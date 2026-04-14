import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { GoogleDriveService } from '../../services/google-drive.service';
import { ThemeService } from '../../services/theme.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import '@googleworkspace/drive-picker-element';

@Component({
  selector: 'app-toolbar',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [FormsModule, ButtonModule, DialogModule, TextareaModule, InputTextModule, TooltipModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent implements AfterViewInit, OnDestroy {
  cs = inject(CharacterService);
  drive = inject(GoogleDriveService);
  theme = inject(ThemeService);

  @ViewChild('drivePicker') drivePickerRef?: ElementRef;

  showImport = false;
  showReset = false;
  showNewDriveFile = false;
  showPicker = false;
  importText = '';
  importError = '';
  newDriveFileName = '';

  /** Whether we want to open the picker to select a file (vs auth-only) */
  private wantFilePicker = false;
  private pickerListenersAttached = false;

  // Bound event handlers for cleanup
  private onOAuthResponse = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.access_token) {
      this.drive.handleOAuthToken(detail.access_token);
      // If this was an auth-only request, close the picker after getting the token
      if (!this.wantFilePicker) {
        this.closePicker();
      }
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
        if (this.drive.tokenExpired()) {
          // Token expired - UI will update to show re-auth button
        }
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
      const json = this.cs.exportJSON();
      await this.drive.saveFile(currentFile.id, json, currentFile.name);
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
}
