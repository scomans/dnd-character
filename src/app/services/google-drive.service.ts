import { Injectable, signal } from '@angular/core';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveFileInfo {
  id: string;
  name: string;
}

const STORAGE_CLIENT_ID_KEY = '736326091345-7if9d7vta2l4ove33j4o359sjppavgi2.apps.googleusercontent.com';
const STORAGE_FILE_ID_KEY = 'gdrive-file-id';
const STORAGE_FILE_NAME_KEY = 'gdrive-file-name';

@Injectable({
  providedIn: 'root',
})
export class GoogleDriveService {
  private _clientId = '';
  private _accessToken = '';

  readonly connected = signal(false);
  readonly currentFile = signal<DriveFileInfo | null>(null);
  readonly loading = signal(false);
  readonly configured = signal(false);

  /** The Client ID for the drive-picker element */
  get clientId(): string {
    return this._clientId;
  }

  /** The App ID derived from the Client ID (the numeric prefix before the first dash) */
  get appId(): string {
    return this._clientId.split('-')[0] ?? '';
  }

  get accessToken(): string {
    return this._accessToken;
  }

  constructor() {
    const savedClientId = localStorage.getItem(STORAGE_CLIENT_ID_KEY);
    if (savedClientId) {
      this._clientId = savedClientId;
      this.configured.set(true);
    }
    const savedFileId = localStorage.getItem(STORAGE_FILE_ID_KEY);
    const savedFileName = localStorage.getItem(STORAGE_FILE_NAME_KEY);
    if (savedFileId && savedFileName) {
      this.currentFile.set({ id: savedFileId, name: savedFileName });
    }
  }

  /**
   * Store client ID for future use. Only Client ID is needed —
   * the App ID is derived from it and the OAuth token comes from the picker element.
   */
  setClientId(clientId: string): void {
    this._clientId = clientId;
    // The Client ID is a public OAuth credential restricted by domain origin in Google Cloud Console.
    localStorage.setItem(STORAGE_CLIENT_ID_KEY, clientId); // nosemgrep: clear-text-storage
    this.configured.set(true);
  }

  /**
   * Called when the drive-picker element emits an OAuth token via picker-oauth-response
   */
  handleOAuthToken(token: string): void {
    this._accessToken = token;
    this.connected.set(true);
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
   * Read a file's content from Google Drive using the REST API
   */
  async readFile(fileId: string): Promise<string> {
    this.loading.set(true);
    try {
      const resp = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this._accessToken}` },
      });
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

  clearCredentials(): void {
    localStorage.removeItem(STORAGE_CLIENT_ID_KEY);
    localStorage.removeItem(STORAGE_FILE_ID_KEY);
    localStorage.removeItem(STORAGE_FILE_NAME_KEY);
    this._clientId = '';
    this._accessToken = '';
    this.configured.set(false);
    this.connected.set(false);
    this.currentFile.set(null);
  }

  disconnect(): void {
    this._accessToken = '';
    this.connected.set(false);
  }
}
