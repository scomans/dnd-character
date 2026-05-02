import { Injectable, signal } from '@angular/core';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const TOKEN_INFO_URL = 'https://www.googleapis.com/oauth2/v1/tokeninfo';

export interface DriveFileInfo {
  id: string;
  name: string;
}

export interface RemoteVersionInfo {
  remoteVersion: number;
  localVersion: number;
}

/**
 * Public OAuth Client ID for the Google Drive Picker.
 * This is NOT a secret - it is restricted by authorized JavaScript origins
 * in the Google Cloud Console and is safe to embed in client-side code.
 */
const CLIENT_ID = '736326091345-7if9d7vta2l4ove33j4o359sjppavgi2.apps.googleusercontent.com';
const APP_ID = CLIENT_ID.split('-')[0];

const STORAGE_FILE_ID_KEY = 'gdrive-file-id';
const STORAGE_FILE_NAME_KEY = 'gdrive-file-name';
const STORAGE_ACCESS_TOKEN_KEY = 'gdrive-access-token';

@Injectable({
  providedIn: 'root',
})
export class GoogleDriveService {
  private _accessToken = '';

  readonly connected = signal(false);
  readonly currentFile = signal<DriveFileInfo | null>(null);
  readonly loading = signal(false);
  readonly tokenExpired = signal(false);
  readonly remoteUpdateAvailable = signal<RemoteVersionInfo | null>(null);

  /** Always configured since the Client ID is embedded */
  readonly configured = signal(true);

  /** The Client ID for the drive-picker element */
  get clientId(): string {
    return CLIENT_ID;
  }

  /** The App ID derived from the Client ID (the numeric prefix before the first dash) */
  get appId(): string {
    return APP_ID;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  constructor() {
    const savedFileId = localStorage.getItem(STORAGE_FILE_ID_KEY);
    const savedFileName = localStorage.getItem(STORAGE_FILE_NAME_KEY);
    if (savedFileId && savedFileName) {
      this.currentFile.set({ id: savedFileId, name: savedFileName });
    }
    const savedToken = localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY);
    if (savedToken) {
      this._accessToken = savedToken;
      this.connected.set(true);
      // Validate the restored token in the background
      this.validateToken().then(valid => {
        if (!valid) {
          this.handleTokenExpired();
        }
      });
    }
  }

  /**
   * Called when the drive-picker element emits an OAuth token via picker-oauth-response
   */
  handleOAuthToken(token: string): void {
    this._accessToken = token;
    this.connected.set(true);
    this.tokenExpired.set(false);
    localStorage.setItem(STORAGE_ACCESS_TOKEN_KEY, token);
  }

  /**
   * Called when the drive-picker element emits a picked file via picker-picked
   */
  handleFilePicked(fileId: string, fileName: string): void {
    const info: DriveFileInfo = { id: fileId, name: fileName };
    this.currentFile.set(info);
    localStorage.setItem(STORAGE_FILE_ID_KEY, fileId);
    localStorage.setItem(STORAGE_FILE_NAME_KEY, fileName);
  }

  /**
   * Validate whether the current access token is still valid by calling the tokeninfo endpoint.
   */
  async validateToken(): Promise<boolean> {
    if (!this._accessToken) return false;
    try {
      const resp = await fetch(TOKEN_INFO_URL, {
        headers: { Authorization: `Bearer ${this._accessToken}` },
      });
      return resp.ok;
    } catch {
      return false;
    }
  }

  /**
   * Handles an expired token by clearing credentials and setting the tokenExpired signal.
   */
  private handleTokenExpired(): void {
    localStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
    this._accessToken = '';
    this.connected.set(false);
    this.tokenExpired.set(true);
  }

  /**
   * Read a file's content from Google Drive using the REST API
   */
  async readFile(fileId: string): Promise<string> {
    this.loading.set(true);
    try {
      const resp = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this._accessToken}` },
      });
      if (resp.status === 401) {
        this.handleTokenExpired();
        throw new Error('Access token expired. Please re-authenticate with Google.');
      }
      if (!resp.ok) throw new Error(`Drive API error: ${resp.status}`);
      return await resp.text();
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Save content to an existing file on Google Drive
   */
  async saveFile(fileId: string, content: string, fileName?: string): Promise<void> {
    this.loading.set(true);
    try {
      const metadata: Record<string, string> = {};
      if (fileName) metadata['name'] = fileName;

      const boundary = '-------314159265358979323846';
      const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
        content +
        `\r\n--${boundary}--`;

      const resp = await fetch(
        `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=multipart`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this._accessToken}`,
            'Content-Type': `multipart/related; boundary="${boundary}"`,
          },
          body,
        },
      );
      if (resp.status === 401) {
        this.handleTokenExpired();
        throw new Error('Access token expired. Please re-authenticate with Google.');
      }
      if (!resp.ok) throw new Error(`Drive API error: ${resp.status}`);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Create a new file on Google Drive
   */
  async createFile(content: string, fileName: string): Promise<DriveFileInfo> {
    this.loading.set(true);
    try {
      const metadata = { name: fileName, mimeType: 'application/json' };

      const boundary = '-------314159265358979323846';
      const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
        content +
        `\r\n--${boundary}--`;

      const resp = await fetch(
        `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this._accessToken}`,
            'Content-Type': `multipart/related; boundary="${boundary}"`,
          },
          body,
        },
      );
      if (resp.status === 401) {
        this.handleTokenExpired();
        throw new Error('Access token expired. Please re-authenticate with Google.');
      }
      if (!resp.ok) throw new Error(`Drive API error: ${resp.status}`);
      const result = await resp.json();
      const fileInfo: DriveFileInfo = { id: result.id, name: fileName };
      this.currentFile.set(fileInfo);
      localStorage.setItem(STORAGE_FILE_ID_KEY, fileInfo.id);
      localStorage.setItem(STORAGE_FILE_NAME_KEY, fileInfo.name);
      return fileInfo;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Check the remote file version against the local version.
   * Sets remoteUpdateAvailable signal if remote is newer.
   */
  async checkRemoteVersion(fileId: string, localVersion: number): Promise<void> {
    if (!this._accessToken) return;
    try {
      const content = await this.readFile(fileId);
      const parsed = JSON.parse(content);
      const remoteVersion = parsed.version ?? 0;
      if (remoteVersion > localVersion) {
        this.remoteUpdateAvailable.set({ remoteVersion, localVersion });
      } else {
        this.remoteUpdateAvailable.set(null);
      }
    } catch (e) {
      // Log but don't bubble up check failures (e.g. network errors, expired tokens)
      console.warn('Failed to check remote version:', e);
    }
  }

  /**
   * List all JSON files accessible by the app in Google Drive.
   * Uses the drive.file scope, so only files created by or opened with this app are visible.
   */
  async listFiles(): Promise<DriveFileInfo[]> {
    if (!this._accessToken) return [];
    try {
      const query = encodeURIComponent("mimeType='application/json' and trashed=false");
      const resp = await fetch(
        `${DRIVE_API_BASE}/files?q=${query}&fields=files(id,name)&orderBy=name`,
        {
          headers: { Authorization: `Bearer ${this._accessToken}` },
        },
      );
      if (resp.status === 401) {
        this.handleTokenExpired();
        return [];
      }
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.files ?? []) as DriveFileInfo[];
    } catch {
      return [];
    }
  }

  clearCredentials(): void {
    localStorage.removeItem(STORAGE_FILE_ID_KEY);
    localStorage.removeItem(STORAGE_FILE_NAME_KEY);
    localStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
    this._accessToken = '';
    this.connected.set(false);
    this.currentFile.set(null);
    this.tokenExpired.set(false);
  }

  disconnect(): void {
    localStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
    this._accessToken = '';
    this.connected.set(false);
  }
}
