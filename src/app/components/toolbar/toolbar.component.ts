import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CharacterService } from '../../services/character.service';
import { GoogleDriveService } from '../../services/google-drive.service';
import { ThemeService } from '../../services/theme.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import '@googleworkspace/drive-picker-element';

@Component({
  selector: 'app-toolbar',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [FormsModule, ButtonModule, DialogModule, TextareaModule, InputTextModule, TooltipModule, Menu],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent implements OnInit, AfterViewInit, OnDestroy {
  cs = inject(CharacterService);
  drive = inject(GoogleDriveService);
  theme = inject(ThemeService);

  @ViewChild('drivePicker') drivePickerRef?: ElementRef;

  showImport = false;
  showReset = false;
  showNewDriveFile = false;
  showPicker = false;
  showRemoteUpdate = false;
  importText = '';
  importError = '';
  newDriveFileName = '';

  moreMenuItems: MenuItem[] = [
    {
      label: 'Export JSON',
      icon: 'pi pi-download',
      command: () => this.exportJSON(),
    },
    {
      label: 'Import JSON',
      icon: 'pi pi-upload',
      command: () => (this.showImport = true),
    },
    {
      separator: true,
    },
    {
      label: 'Zurücksetzen',
      icon: 'pi pi-refresh',
      styleClass: 'text-red-500',
      command: () => (this.showReset = true),
    },
  ];

  /** Whether we want to open the picker to select a file (vs auth-only) */
  private wantFilePicker = false;
  private pickerListenersAttached = false;

  ngOnInit(): void {
    // On page load, check for remote updates if connected and a file is selected
    if (this.drive.connected() && this.drive.currentFile()) {
      this.checkForRemoteUpdate();
    }
  }

  // Bound event handlers for cleanup
  private onOAuthResponse = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.access_token) {
      this.drive.handleOAuthToken(detail.access_token);
      // If this was an auth-only request, close the picker after getting the token
      if (!this.wantFilePicker) {
        this.closePicker();
      }
      // Check for remote updates after authentication
      this.checkForRemoteUpdate();
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
    this.closePicker();
  };

  private onPickerCanceled = () => {
    this.closePicker();
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
      el.addEventListener('picker-canceled', this.onPickerCanceled);
      this.pickerListenersAttached = true;
    }
  }

  private detachPickerListeners(): void {
    const el = this.drivePickerRef?.nativeElement;
    if (el) {
      el.removeEventListener('picker-oauth-response', this.onOAuthResponse);
      el.removeEventListener('picker-picked', this.onFilePicked);
      el.removeEventListener('picker-canceled', this.onPickerCanceled);
      this.pickerListenersAttached = false;
    }
  }

  private closePicker(): void {
    const el = this.drivePickerRef?.nativeElement;
    if (el) {
      el.visible = false;
    }
    this.showPicker = false;
    this.pickerListenersAttached = false;
    this.wantFilePicker = false;
  }

  /**
   * Auth only - shows the picker to trigger OAuth but closes it after token is received
   */
  authenticateOnly(): void {
    this.wantFilePicker = false;
    this.showPicker = true;
    setTimeout(() => {
      this.attachPickerListeners();
      const el = this.drivePickerRef?.nativeElement;
      if (el) {
        el.visible = true;
      }
    }, 0);
  }

  /**
   * Opens the picker to select a file (user already authenticated)
   */
  openPickerForFile(): void {
    this.wantFilePicker = true;
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
      // Increment version before saving
      const currentVersion = this.cs.character().version ?? 0;
      this.cs.update({ version: currentVersion + 1 });
      const json = this.cs.exportJSON();
      await this.drive.saveFile(currentFile.id, json, currentFile.name);
      // Clear any remote update notification after successful save
      this.drive.remoteUpdateAvailable.set(null);
    } catch (err) {
      console.error('Error saving to Google Drive:', err);
      if (this.drive.tokenExpired()) {
        // Token expired - UI will update to show re-auth button
        return;
      }
    }
  }

  async createDriveFile(): Promise<void> {
    let fileName = this.newDriveFileName.trim() || `${this.cs.character().characterName || 'character'}.json`;
    if (!fileName.endsWith('.json')) {
      fileName = fileName + '.json';
    }
    try {
      // Increment version before creating
      const currentVersion = this.cs.character().version ?? 0;
      this.cs.update({ version: currentVersion + 1 });
      const json = this.cs.exportJSON();
      await this.drive.createFile(json, fileName);
      this.showNewDriveFile = false;
      this.newDriveFileName = '';
    } catch (err) {
      console.error('Error creating file on Google Drive:', err);
      if (this.drive.tokenExpired()) {
        this.showNewDriveFile = false;
        return;
      }
    }
  }

  /**
   * Check if the remote file has a newer version than the local one.
   * Shows the update modal if remote is newer.
   */
  async checkForRemoteUpdate(): Promise<void> {
    const currentFile = this.drive.currentFile();
    if (!currentFile) return;
    const localVersion = this.cs.character().version ?? 0;
    await this.drive.checkRemoteVersion(currentFile.id, localVersion);
    if (this.drive.remoteUpdateAvailable()) {
      this.showRemoteUpdate = true;
    }
  }

  /**
   * Reload the character data from the remote Google Drive file.
   */
  async reloadFromRemote(): Promise<void> {
    const currentFile = this.drive.currentFile();
    if (!currentFile) return;
    try {
      const content = await this.drive.readFile(currentFile.id);
      this.cs.importJSON(content);
      this.drive.remoteUpdateAvailable.set(null);
      this.showRemoteUpdate = false;
    } catch (err) {
      console.error('Error reloading from Google Drive:', err);
    }
  }
}
