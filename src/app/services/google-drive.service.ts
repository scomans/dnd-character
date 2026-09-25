import { Injectable, signal } from '@angular/core';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

/**
 * Public OAuth Client ID for the Google Drive Picker / GIS.
 *
 * This is NOT a secret. Web application client IDs are intended
 * to be exposed in browser code.
 */
const CLIENT_ID = '736326091345-7if9d7vta2l4ove33j4o359sjppavgi2.apps.googleusercontent.com';

const APP_ID = CLIENT_ID.split('-')[0];

declare const google: {
  accounts: {
    oauth2: {
      initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenResponse) => void;
      }): GoogleTokenClient;

      revoke(token: string, callback?: () => void): void;
    };
  };
};

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  callback: (response: GoogleTokenResponse) => void;

  requestAccessToken(options?: { prompt?: '' | 'consent' | 'select_account' }): void;
}

export interface DriveFileInfo {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleDriveService {
  private _accessToken = '';

  /**
   * Time at which the current access token expires.
   *
   * We keep this only in memory. The token itself is deliberately
   * not persisted to localStorage.
   */
  private _tokenExpiresAt = 0;

  private _tokenClient?: GoogleTokenClient;

  /**
   * Promise used while GIS is initializing.
   *
   * This prevents multiple calls from trying to initialize GIS
   * independently.
   */
  private _initializationPromise: Promise<void>;

  readonly connected = signal(false);
  readonly loading = signal(false);
  readonly tokenExpired = signal(false);

  /**
   * The Client ID for the Drive Picker.
   */
  get clientId(): string {
    return CLIENT_ID;
  }

  /**
   * The App ID derived from the Client ID.
   */
  get appId(): string {
    return APP_ID;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  constructor() {
    this._initializationPromise = this.initializeGoogleAuth();
  }

  /**
   * Wait until Google Identity Services is available and initialize
   * the OAuth token client.
   */
  private async initializeGoogleAuth(): Promise<void> {
    await this.waitForGoogleIdentityServices();

    this._tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        this.handleTokenResponse(response);
      },
    });
  }

  /**
   * GIS is loaded through index.html, so wait until the global
   * `google.accounts` object becomes available.
   */
  private async waitForGoogleIdentityServices(): Promise<void> {
    const timeout = 10_000;
    const interval = 50;
    const start = Date.now();

    while (typeof google === 'undefined' || !google.accounts?.oauth2) {
      if (Date.now() - start >= timeout) {
        throw new Error('Google Identity Services failed to load.');
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  /**
   * Handle an OAuth response from Google.
   */
  private handleTokenResponse(response: GoogleTokenResponse): void {
    if (response.error) {
      console.error('Google OAuth error:', response);

      this._accessToken = '';
      this._tokenExpiresAt = 0;
      this.connected.set(false);

      return;
    }

    this._accessToken = response.access_token;

    /**
     * Refresh slightly before the actual expiration time.
     *
     * 60 seconds gives us some safety margin for network latency
     * and requests already in progress.
     */
    this._tokenExpiresAt = Date.now() + response.expires_in * 1000 - 60_000;

    this.connected.set(true);
    this.tokenExpired.set(false);
  }

  /**
   * Explicitly connect the user to Google Drive.
   *
   * This is what you call from your "Connect Google Drive" button.
   */
  async connect(): Promise<void> {
    await this._initializationPromise;

    if (!this._tokenClient) {
      throw new Error('Google Identity Services is not initialized.');
    }

    return new Promise<void>((resolve, reject) => {
      this._tokenClient!.callback = (response) => {
        if (response.error) {
          reject(
            new Error(
              response.error_description ?? response.error ?? 'Google authentication failed.',
            ),
          );
          return;
        }

        this.handleTokenResponse(response);
        resolve();
      };

      /**
       * `consent` is used for the initial authorization.
       */
      this._tokenClient!.requestAccessToken({
        prompt: 'consent',
      });
    });
  }

  /**
   * Get a fresh access token.
   *
   * `prompt: ''` tells Google to reuse the existing Google
   * authorization/session when possible instead of showing
   * the consent screen again.
   */
  private async refreshToken(): Promise<void> {
    await this._initializationPromise;

    if (!this._tokenClient) {
      throw new Error('Google Identity Services is not initialized.');
    }

    return new Promise<void>((resolve, reject) => {
      this._tokenClient!.callback = (response) => {
        if (response.error) {
          this.handleTokenExpired();

          reject(
            new Error(
              response.error_description ??
                response.error ??
                'Unable to refresh Google access token.',
            ),
          );

          return;
        }

        this.handleTokenResponse(response);
        resolve();
      };

      this._tokenClient!.requestAccessToken({
        prompt: '',
      });
    });
  }

  /**
   * Ensure that we currently have a usable access token.
   *
   * This automatically obtains a token if there isn't one, or
   * refreshes it if the current token is about to expire.
   */
  public async ensureAccessToken(): Promise<void> {
    if (!this._accessToken) {
      /**
       * There is no existing authorization in this application
       * instance. The caller needs to explicitly connect first.
       */
      throw new Error('Google Drive is not connected. Please connect your Google account first.');
    }

    if (Date.now() >= this._tokenExpiresAt) {
      await this.refreshToken();
    }
  }

  /**
   * Perform a Drive API request.
   *
   * If Google responds with 401, we obtain a new token and retry
   * the request once.
   */
  private async driveFetch(url: string, options: RequestInit = {}): Promise<Response> {
    await this.ensureAccessToken();

    let response = await this.performFetch(url, options);

    if (response.status === 401) {
      /**
       * The token may have been invalidated server-side before
       * our local expiration timestamp.
       */
      await this.refreshToken();

      response = await this.performFetch(url, options);
    }

    return response;
  }

  /**
   * Perform the actual HTTP request with the current token.
   */
  private async performFetch(url: string, options: RequestInit): Promise<Response> {
    const headers = new Headers(options.headers);

    headers.set('Authorization', `Bearer ${this._accessToken}`);

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Read a file's content from Google Drive.
   */
  async readFile(fileId: string): Promise<string> {
    this.loading.set(true);

    try {
      const resp = await this.driveFetch(
        `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?alt=media`,
      );

      if (!resp.ok) {
        throw new Error(`Drive API error: ${resp.status} ${resp.statusText}`);
      }

      return await resp.text();
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Save content to an existing file on Google Drive.
   */
  async saveFile(fileId: string, content: string, fileName?: string): Promise<void> {
    this.loading.set(true);

    try {
      const metadata: Record<string, string> = {};

      if (fileName) {
        metadata['name'] = fileName;
      }

      const boundary = '-------314159265358979323846';

      const body =
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        `${content}\r\n` +
        `--${boundary}--`;

      const resp = await this.driveFetch(
        `${DRIVE_UPLOAD_BASE}/files/${encodeURIComponent(fileId)}?uploadType=multipart`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': `multipart/related; boundary="${boundary}"`,
          },
          body,
        },
      );

      if (!resp.ok) {
        throw new Error(`Drive API error: ${resp.status} ${resp.statusText}`);
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Create a new file on Google Drive.
   */
  async createFile(content: string, fileName: string): Promise<DriveFileInfo> {
    this.loading.set(true);

    try {
      const metadata = {
        name: fileName,
        mimeType: 'application/json',
      };

      const boundary = '-------314159265358979323846';

      const body =
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        `${content}\r\n` +
        `--${boundary}--`;

      const resp = await this.driveFetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body,
      });

      if (!resp.ok) {
        throw new Error(`Drive API error: ${resp.status} ${resp.statusText}`);
      }

      const result = await resp.json();

      return {
        id: result.id,
        name: fileName,
      };
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Check whether the application currently has an access token.
   *
   * Note that this does NOT mean that the token is necessarily
   * still valid. Drive requests automatically handle expiration.
   */
  isConnected(): boolean {
    return this.connected();
  }

  /**
   * Disconnect the current Google authorization.
   *
   * This revokes the OAuth grant for this application, not merely
   * removing the local token.
   */
  disconnect(): void {
    if (this._accessToken) {
      google.accounts.oauth2.revoke(this._accessToken, () => {
        this.clearLocalCredentials();
      });

      return;
    }

    this.clearLocalCredentials();
  }

  /**
   * Clear the locally held access token without revoking Google's
   * authorization.
   *
   * Useful when you simply want to reset application state.
   */
  clearCredentials(): void {
    this.clearLocalCredentials();
  }

  private clearLocalCredentials(): void {
    this._accessToken = '';
    this._tokenExpiresAt = 0;

    this.connected.set(false);
    this.tokenExpired.set(false);
  }

  /**
   * Handle an authentication failure.
   */
  private handleTokenExpired(): void {
    this._accessToken = '';
    this._tokenExpiresAt = 0;

    this.connected.set(false);
    this.tokenExpired.set(true);
  }

  async tryReconnect(): Promise<boolean> {
    try {
      await this.ensureAccessToken();

      if (!this._tokenClient) {
        return false;
      }

      return await new Promise<boolean>((resolve) => {
        this._tokenClient!.callback = (response) => {
          if (response.error || !response.access_token) {
            resolve(false);
            return;
          }

          this.handleTokenResponse(response);

          resolve(true);
        };

        this._tokenClient!.requestAccessToken({
          prompt: '',
        });
      });
    } catch (error) {
      console.debug('Google Drive silent reconnect failed:', error);
      this.clearCredentials();
      return false;
    }
  }
}
