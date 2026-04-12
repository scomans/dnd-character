import { Injectable, signal } from '@angular/core';

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

declare const google: any;
declare const gapi: any;

export interface DriveFileInfo {
  id: string;
  name: string;
}

const STORAGE_CLIENT_ID_KEY = 'gdrive-client-id';
const STORAGE_API_KEY_KEY = 'gdrive-api-key';

@Injectable({
  providedIn: 'root',
})
export class GoogleDriveService {
  private clientId = '';
  private apiKey = '';
  private tokenClient: any = null;
  private accessToken = '';
  private gapiLoaded = false;
  private gsiLoaded = false;
  private initPromise: Promise<void> | null = null;

  readonly connected = signal(false);
  readonly currentFile = signal<DriveFileInfo | null>(null);
  readonly loading = signal(false);
  readonly configured = signal(false);

  constructor() {
    // Check if credentials are saved
    const savedClientId = localStorage.getItem(STORAGE_CLIENT_ID_KEY);
    const savedApiKey = localStorage.getItem(STORAGE_API_KEY_KEY);
    if (savedClientId && savedApiKey) {
      this.clientId = savedClientId;
      this.apiKey = savedApiKey;
      this.configured.set(true);
    }
  }

  /**
   * Store credentials for future use
   */
  setCredentials(clientId: string, apiKey: string): void {
    this.clientId = clientId;
    this.apiKey = apiKey;
    // These are the user's own public Google Cloud OAuth credentials (Client ID + API Key),
    // not secrets - they are restricted by domain origin in Google Cloud Console.
    localStorage.setItem(STORAGE_CLIENT_ID_KEY, clientId); // nosemgrep: clear-text-storage
    localStorage.setItem(STORAGE_API_KEY_KEY, apiKey); // nosemgrep: clear-text-storage
    this.configured.set(true);
    this.initPromise = null; // Reset so next init uses new credentials
  }

  /**
   * Initialize the Google API libraries (loads scripts + configures gapi + gsi)
   */
  async ensureInitialized(): Promise<void> {
    if (!this.clientId || !this.apiKey) {
      throw new Error('Google Drive credentials not configured.');
    }
    if (!this.initPromise) {
      this.initPromise = this.doInit();
    }
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    await Promise.all([
      this.loadGapiScript(),
      this.loadGsiScript(),
    ]);
    await this.initGapi();
    this.initGsi();
  }

  private loadGapiScript(): Promise<void> {
    if (this.gapiLoaded || (typeof gapi !== 'undefined')) {
      this.gapiLoaded = true;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapiLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private loadGsiScript(): Promise<void> {
    if (this.gsiLoaded || (typeof google !== 'undefined' && google.accounts)) {
      this.gsiLoaded = true;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.gsiLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private initGapi(): Promise<void> {
    return new Promise((resolve) => {
      gapi.load('client:picker', async () => {
        await gapi.client.init({
          apiKey: this.apiKey,
          discoveryDocs: DISCOVERY_DOCS,
        });
        resolve();
      });
    });
  }

  private initGsi(): void {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          console.error('Google auth error:', response);
          return;
        }
        this.accessToken = response.access_token;
        this.connected.set(true);
      },
    });
  }

  /**
   * Sign in with Google - shows the OAuth consent popup
   */
  async signIn(): Promise<void> {
    await this.ensureInitialized();
    return new Promise<void>((resolve, reject) => {
      // Override callback temporarily
      const origCallback = this.tokenClient.s.callback;
      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        this.accessToken = response.access_token;
        this.connected.set(true);
        resolve();
      };
      if (this.accessToken) {
        this.tokenClient.requestAccessToken({ prompt: '' });
      } else {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      }
    });
  }

  /**
   * Open Google Picker to select a JSON file from Google Drive
   */
  async pickFile(): Promise<DriveFileInfo | null> {
    if (!this.accessToken) {
      await this.signIn();
    }
    if (!this.accessToken) return null;

    return new Promise((resolve) => {
      const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
        .setMimeTypes('application/json')
        .setMode(google.picker.DocsViewMode.LIST);

      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.accessToken)
        .setDeveloperKey(this.apiKey)
        .setCallback((data: any) => {
          if (data.action === google.picker.Action.PICKED) {
            const file = data.docs[0];
            const fileInfo: DriveFileInfo = {
              id: file.id,
              name: file.name,
            };
            this.currentFile.set(fileInfo);
            resolve(fileInfo);
          } else if (data.action === google.picker.Action.CANCEL) {
            resolve(null);
          }
        })
        .build();
      picker.setVisible(true);
    });
  }

  /**
   * Read a file's content from Google Drive
   */
  async readFile(fileId: string): Promise<string> {
    this.loading.set(true);
    try {
      const response = await gapi.client.drive.files.get({
        fileId,
        alt: 'media',
      });
      return response.body;
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
      const metadata: any = {};
      if (fileName) {
        metadata.name = fileName;
      }

      const boundary = '-------314159265358979323846';
      const delimiter = '\r\n--' + boundary + '\r\n';
      const closeDelimiter = '\r\n--' + boundary + '--';

      const multipartBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        content +
        closeDelimiter;

      await gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartBody,
      });
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
      const metadata = {
        name: fileName,
        mimeType: 'application/json',
      };

      const boundary = '-------314159265358979323846';
      const delimiter = '\r\n--' + boundary + '\r\n';
      const closeDelimiter = '\r\n--' + boundary + '--';

      const multipartBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        content +
        closeDelimiter;

      const response = await gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartBody,
      });

      const result = JSON.parse(response.body);
      const fileInfo: DriveFileInfo = {
        id: result.id,
        name: fileName,
      };
      this.currentFile.set(fileInfo);
      return fileInfo;
    } finally {
      this.loading.set(false);
    }
  }

  clearCredentials(): void {
    localStorage.removeItem(STORAGE_CLIENT_ID_KEY);
    localStorage.removeItem(STORAGE_API_KEY_KEY);
    this.clientId = '';
    this.apiKey = '';
    this.configured.set(false);
    this.disconnect();
  }

  disconnect(): void {
    if (this.accessToken && typeof google !== 'undefined') {
      try {
        google.accounts.oauth2.revoke(this.accessToken);
      } catch {
        // ignore revoke errors
      }
    }
    this.accessToken = '';
    this.connected.set(false);
    this.currentFile.set(null);
    this.initPromise = null;
  }
}
