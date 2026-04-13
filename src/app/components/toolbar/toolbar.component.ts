import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { GoogleDriveService } from '../../services/google-drive.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import '@googleworkspace/drive-picker-element';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
          (onClick)="openPicker()"
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
          label="Mit Google anmelden"
          size="small"
          severity="secondary"
          (onClick)="openPicker()"
          pTooltip="Öffne Google Drive File Picker"
          tooltipPosition="bottom"
        />
      }

      <span class="border-l border-slate-500 h-6 mx-1"></span>

      <p-button label="Export JSON" icon="pi pi-download" size="small" severity="secondary" (onClick)="exportJSON()" />
      <p-button label="Import JSON" icon="pi pi-upload" size="small" severity="secondary" (onClick)="showImport = true" />
      <p-button label="Zurücksetzen" icon="pi pi-refresh" size="small" severity="danger" (onClick)="showReset = true" />
    </div>

    <!-- Drive Picker element (only rendered when user requests it to avoid popup blocking) -->
    @if (showPicker) {
      <drive-picker
        #drivePicker
        [attr.client-id]="drive.clientId"
        [attr.app-id]="drive.appId"
        [attr.oauth-token]="drive.accessToken || null"
        scope="https://www.googleapis.com/auth/drive.file"
        locale="de"
        title="JSON-Datei auswählen"
      >
        <drive-picker-docs-view
          mime-types="application/json"
          mode="LIST"
        ></drive-picker-docs-view>
      </drive-picker>
    }

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
export class ToolbarComponent implements AfterViewInit, OnDestroy {
  cs = inject(CharacterService);
  drive = inject(GoogleDriveService);

  @ViewChild('drivePicker') drivePickerRef?: ElementRef;

  showImport = false;
  showReset = false;
  showNewDriveFile = false;
  showPicker = false;
  importText = '';
  importError = '';
  newDriveFileName = '';

  private pickerListenersAttached = false;

  // Bound event handlers for cleanup
  private onOAuthResponse = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.access_token) {
      this.drive.handleOAuthToken(detail.access_token);
    }
  };

  private onFilePicked = async (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.docs?.length > 0) {
      const doc = detail.docs[0];
      this.drive.handleFilePicked(doc.id, doc.name);
      try {
        const content = await this.drive.readFile(doc.id);
        this.cs.importJSON(content);
      } catch (err) {
        console.error('Error reading file from Google Drive:', err);
      }
    }
  };

  ngAfterViewInit(): void {
    this.attachPickerListeners();
  }

  ngOnDestroy(): void {
    this.detachPickerListeners();
  }

  private attachPickerListeners(): void {
    const el = this.drivePickerRef?.nativeElement;
    if (el && !this.pickerListenersAttached) {
      el.addEventListener('picker-oauth-response', this.onOAuthResponse);
      el.addEventListener('picker-picked', this.onFilePicked);
      this.pickerListenersAttached = true;
    }
  }

  private detachPickerListeners(): void {
    const el = this.drivePickerRef?.nativeElement;
    if (el) {
      el.removeEventListener('picker-oauth-response', this.onOAuthResponse);
      el.removeEventListener('picker-picked', this.onFilePicked);
      this.pickerListenersAttached = false;
    }
  }

  openPicker(): void {
    // Render the drive-picker element first (user gesture context),
    // then attach listeners and set visible after it's in the DOM
    this.showPicker = true;
    setTimeout(() => {
      this.attachPickerListeners();
      const el = this.drivePickerRef?.nativeElement;
      if (el) {
        el.visible = true;
      }
    }, 0);
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
      await this.drive.createFile(json, fileName);
      this.showNewDriveFile = false;
      this.newDriveFileName = '';
    } catch (err) {
      console.error('Error creating file on Google Drive:', err);
    }
  }
}
