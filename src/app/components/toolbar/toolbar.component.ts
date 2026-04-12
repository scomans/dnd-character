import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { GoogleDriveService } from '../../services/google-drive.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, TextareaModule, InputTextModule, TooltipModule],
  template: `
    <div class="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg mb-4 shadow-md">
      <span class="text-lg font-bold flex-1">⚔️ D&D Charakterbogen</span>

      <!-- Google Drive Section -->
      @if (drive.connected()) {
        @if (drive.currentFile()) {
          <span class="text-xs text-slate-300 hidden md:inline" pTooltip="Verbundene Google Drive Datei" tooltipPosition="bottom">
            <i class="pi pi-google text-xs mr-1"></i>{{ drive.currentFile()!.name }}
          </span>
          <p-button
            icon="pi pi-save"
            size="small"
            severity="success"
            [loading]="drive.loading()"
            (onClick)="saveToDrive()"
            pTooltip="In Google Drive speichern"
            tooltipPosition="bottom"
          />
        }
        <p-button
          icon="pi pi-folder-open"
          size="small"
          severity="secondary"
          (onClick)="openFromDrive()"
          pTooltip="Datei aus Google Drive öffnen"
          tooltipPosition="bottom"
        />
        <p-button
          icon="pi pi-file-plus"
          size="small"
          severity="secondary"
          (onClick)="showNewDriveFile = true"
          pTooltip="Neue Datei in Google Drive erstellen"
          tooltipPosition="bottom"
        />
      } @else {
        <p-button
          icon="pi pi-google"
          label="Google Drive"
          size="small"
          severity="secondary"
          (onClick)="showDriveSetup = true"
          pTooltip="Mit Google Drive verbinden"
          tooltipPosition="bottom"
        />
      }

      <span class="border-l border-slate-500 h-6 mx-1"></span>

      <p-button label="Export JSON" icon="pi pi-download" size="small" severity="secondary" (onClick)="exportJSON()" />
      <p-button label="Import JSON" icon="pi pi-upload" size="small" severity="secondary" (onClick)="showImport = true" />
      <p-button label="Zurücksetzen" icon="pi pi-refresh" size="small" severity="danger" (onClick)="showReset = true" />
    </div>

    <!-- Google Drive Setup Dialog -->
    <p-dialog header="Google Drive verbinden" [(visible)]="showDriveSetup" [modal]="true" [style]="{ width: '500px' }">
      <div class="space-y-3">
        <p class="text-sm text-gray-600">
          Um Google Drive zu nutzen, benötigst du eine Google Cloud Client ID und einen API-Key mit aktivierter
          Google Drive API und Google Picker API.
        </p>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-bold">Client ID</label>
          <input pInputText [(ngModel)]="driveClientId" placeholder="xxxx.apps.googleusercontent.com" class="w-full text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-bold">API Key</label>
          <input pInputText [(ngModel)]="driveApiKey" placeholder="AIza..." class="w-full text-sm" />
        </div>
        @if (driveError) {
          <p class="text-red-600 text-sm">{{ driveError }}</p>
        }
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Abbrechen" [text]="true" (onClick)="showDriveSetup = false; driveError = ''" />
        <p-button label="Verbinden" icon="pi pi-link" [loading]="driveConnecting" (onClick)="connectDrive()" />
      </ng-template>
    </p-dialog>

    <!-- New Drive File Dialog -->
    <p-dialog header="Neue Datei in Google Drive" [(visible)]="showNewDriveFile" [modal]="true" [style]="{ width: '400px' }">
      <div class="space-y-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-bold">Dateiname</label>
          <input pInputText [(ngModel)]="newDriveFileName" placeholder="charakter.json" class="w-full text-sm" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Abbrechen" [text]="true" (onClick)="showNewDriveFile = false" />
        <p-button label="Erstellen & Speichern" icon="pi pi-check" [loading]="drive.loading()" (onClick)="createDriveFile()" />
      </ng-template>
    </p-dialog>

    <!-- Import Dialog -->
    <p-dialog header="JSON Import" [(visible)]="showImport" [modal]="true" [style]="{ width: '600px' }">
      <div class="space-y-3">
        <p class="text-sm text-gray-600">Füge den exportierten JSON-Text ein:</p>
        <textarea
          pTextarea
          [(ngModel)]="importText"
          [rows]="15"
          class="w-full font-mono text-xs"
          placeholder="JSON hier einfügen..."
        ></textarea>
        @if (importError) {
          <p class="text-red-600 text-sm">{{ importError }}</p>
        }
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Abbrechen" [text]="true" (onClick)="showImport = false; importError = ''" />
        <p-button label="Importieren" icon="pi pi-check" (onClick)="doImport()" />
      </ng-template>
    </p-dialog>

    <!-- Reset Confirmation -->
    <p-dialog header="Charakter zurücksetzen?" [(visible)]="showReset" [modal]="true" [style]="{ width: '400px' }">
      <p class="text-sm">Möchtest du wirklich alle Daten zurücksetzen? Dies kann nicht rückgängig gemacht werden.</p>
      <ng-template pTemplate="footer">
        <p-button label="Abbrechen" [text]="true" (onClick)="showReset = false" />
        <p-button label="Zurücksetzen" icon="pi pi-refresh" severity="danger" (onClick)="doReset()" />
      </ng-template>
    </p-dialog>
  `,
})
export class ToolbarComponent {
  cs = inject(CharacterService);
  drive = inject(GoogleDriveService);

  showImport = false;
  showReset = false;
  showDriveSetup = false;
  showNewDriveFile = false;
  importText = '';
  importError = '';
  driveClientId = '';
  driveApiKey = '';
  driveError = '';
  driveConnecting = false;
  newDriveFileName = '';

  constructor() {
    // Restore saved credentials
    const savedClientId = localStorage.getItem('gdrive-client-id');
    const savedApiKey = localStorage.getItem('gdrive-api-key');
    const savedFileId = localStorage.getItem('gdrive-file-id');
    const savedFileName = localStorage.getItem('gdrive-file-name');

    if (savedClientId && savedApiKey) {
      this.driveClientId = savedClientId;
      this.driveApiKey = savedApiKey;
      this.drive.init(savedClientId, savedApiKey).then(() => {
        if (savedFileId && savedFileName) {
          this.drive.currentFile.set({ id: savedFileId, name: savedFileName });
        }
      }).catch(() => {
        // Silently fail on auto-connect
      });
    }
  }

  exportJSON(): void {
    const json = this.cs.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.cs.character().characterName || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  doImport(): void {
    this.importError = '';
    if (!this.importText.trim()) {
      this.importError = 'Bitte JSON-Text eingeben.';
      return;
    }
    const success = this.cs.importJSON(this.importText);
    if (success) {
      this.showImport = false;
      this.importText = '';
    } else {
      this.importError = 'Ungültiges JSON-Format.';
    }
  }

  doReset(): void {
    this.cs.resetCharacter();
    this.showReset = false;
  }

  // === Google Drive ===

  async connectDrive(): Promise<void> {
    this.driveError = '';
    if (!this.driveClientId.trim() || !this.driveApiKey.trim()) {
      this.driveError = 'Bitte Client ID und API Key eingeben.';
      return;
    }
    this.driveConnecting = true;
    try {
      await this.drive.init(this.driveClientId.trim(), this.driveApiKey.trim());
      this.drive.authorize();
      // Save credentials to localStorage for convenience.
      // These are the user's own public Google Cloud OAuth credentials (Client ID + API Key),
      // not secrets - they are restricted by domain origin in Google Cloud Console.
      localStorage.setItem('gdrive-client-id', this.driveClientId.trim());
      localStorage.setItem('gdrive-api-key', this.driveApiKey.trim()); // nosemgrep: clear-text-storage
      this.showDriveSetup = false;
    } catch (err: any) {
      this.driveError = 'Verbindung fehlgeschlagen: ' + (err?.message || err);
    } finally {
      this.driveConnecting = false;
    }
  }

  async openFromDrive(): Promise<void> {
    try {
      const file = await this.drive.pickFile();
      if (file) {
        const content = await this.drive.readFile(file.id);
        const success = this.cs.importJSON(content);
        if (success) {
          this.drive.currentFile.set(file);
          localStorage.setItem('gdrive-file-id', file.id);
          localStorage.setItem('gdrive-file-name', file.name);
        }
      }
    } catch (err) {
      console.error('Error opening from Google Drive:', err);
    }
  }

  async saveToDrive(): Promise<void> {
    const currentFile = this.drive.currentFile();
    if (!currentFile) return;
    try {
      const json = this.cs.exportJSON();
      await this.drive.saveFile(currentFile.id, json, currentFile.name);
    } catch (err) {
      console.error('Error saving to Google Drive:', err);
    }
  }

  async createDriveFile(): Promise<void> {
    let fileName = this.newDriveFileName.trim() || `${this.cs.character().characterName || 'character'}.json`;
    if (!fileName.endsWith('.json')) {
      fileName = fileName + '.json';
    }
    try {
      const json = this.cs.exportJSON();
      const file = await this.drive.createFile(json, fileName);
      localStorage.setItem('gdrive-file-id', file.id);
      localStorage.setItem('gdrive-file-name', file.name);
      this.showNewDriveFile = false;
      this.newDriveFileName = '';
    } catch (err) {
      console.error('Error creating file on Google Drive:', err);
    }
  }
}
