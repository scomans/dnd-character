import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  model,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import {
  faCheck,
  faCloudDownloadAlt,
  faDownload,
  faEllipsisV,
  faExclamationTriangle,
  faFileCirclePlus,
  faFolderOpen,
  faMoon,
  faPen,
  faPlay,
  faPlus,
  faRefresh,
  faSave,
  faSun,
  faSync,
  faTrash,
  faUpload,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { DrivePickerElement } from '@googleworkspace/drive-picker-element';
import { MenuItem } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Menu } from '@openng/optimus-ui/menu';
import { Ripple } from '@openng/optimus-ui/ripple';
import { Textarea } from '@openng/optimus-ui/textarea';
import { ToggleSwitch } from '@openng/optimus-ui/toggleswitch';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { CharacterFileEntry, CharacterListService } from '../../services/character-list.service';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';
import { GoogleDriveService } from '../../services/google-drive.service';
import { ThemeService } from '../../services/theme.service';
import { WakeLockService } from '../../services/wake-lock.service';
import '@googleworkspace/drive-picker-element';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    Button,
    Dialog,
    FaIconComponent,
    FormsModule,
    InputText,
    Menu,
    Ripple,
    Textarea,
    ToggleSwitch,
    Tooltip,
  ],
})
export class ToolbarComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly cs = inject(CharacterService);
  protected readonly characterListService = inject(CharacterListService);
  protected readonly drive = inject(GoogleDriveService);
  protected readonly editMode = inject(EditModeService);
  protected readonly theme = inject(ThemeService);
  protected readonly wakeLock = inject(WakeLockService);
  protected readonly fabGoogle = faGoogle;
  protected readonly fasCheck = faCheck;
  protected readonly fasCloudDownloadAlt = faCloudDownloadAlt;
  protected readonly fasEllipsisV = faEllipsisV;
  protected readonly fasExclamationTriangle = faExclamationTriangle;
  protected readonly fasFilePlus = faFileCirclePlus;
  protected readonly fasFolderOpen = faFolderOpen;
  protected readonly fasMoon = faMoon;
  protected readonly fasPen = faPen;
  protected readonly fasPlay = faPlay;
  protected readonly fasPlus = faPlus;
  protected readonly fasRefresh = faRefresh;
  protected readonly fasSave = faSave;
  protected readonly fasSun = faSun;
  protected readonly fasSync = faSync;
  protected readonly fasTrash = faTrash;
  protected readonly fasUsers = faUsers;

  protected readonly drivePickerRef = viewChild<ElementRef<DrivePickerElement>>('drivePicker');

  protected showImport = signal(false);
  protected showReset = signal(false);
  protected showNewDriveFile = signal(false);
  protected readonly showPicker = signal(false);
  protected showRemoteUpdate = signal(false);
  protected showCharacterList = signal(false);
  protected showSaveBeforeSwitch = signal(false);
  protected readonly pendingSwitchEntry = signal<CharacterFileEntry | null>(null);
  protected importText = model('');
  protected readonly importError = signal('');
  protected newDriveFileName = signal('');

  moreMenuItems: MenuItem[] = [
    {
      label: 'Export JSON',
      faIcon: faDownload,
      command: () => this.exportJSON(),
    },
    {
      label: 'Import JSON',
      faIcon: faUpload,
      command: () => this.showImport.set(true),
    },
    {
      separator: true,
    },
    {
      label: 'Zurücksetzen',
      faIcon: faRefresh,
      command: () => this.showReset.set(true),
    },
  ];

  /**
   * Whether the picker is currently being used to select a file.
   *
   * Authentication is now handled by GoogleDriveService/GIS,
   * so the picker is no longer used as an authentication mechanism.
   */
  private wantFilePicker = false;

  private pickerListenersAttached = false;

  async ngOnInit(): Promise<void> {
    await this.initializeGoogleDrive();
  }

  /**
   * Try to restore the Google authorization on application startup.
   *
   * No access token is stored in localStorage. GIS obtains a fresh
   * short-lived token using the existing Google authorization/session.
   */
  private async initializeGoogleDrive(): Promise<void> {
    try {
      const connected = await this.drive.tryReconnect();

      if (connected && this.characterListService.activeCharacter()) {
        await this.checkForRemoteUpdate();
      }
    } catch (err) {
      console.error('Google Drive initialization failed:', err);
    }
  }

  private onFilePicked = async (e: Event) => {
    const currentFile = this.characterListService.activeCharacter();

    if (!currentFile) {
      return;
    }

    const detail = (e as CustomEvent).detail;

    if (detail?.docs?.length > 0) {
      const doc = detail.docs[0];

      try {
        const content = await this.drive.readFile(doc.id);

        this.cs.importJSON(content);

        this.characterListService.updateCharacterEntry(currentFile.id, {
          fileId: doc.id,
          fileName: doc.name,
          characterName: this.cs.character().characterName || doc.name,
        });
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
    const el = this.drivePickerRef()?.nativeElement;

    if (el && !this.pickerListenersAttached) {
      el.addEventListener('picker-picked', this.onFilePicked);

      el.addEventListener('picker-canceled', this.onPickerCanceled);

      this.pickerListenersAttached = true;
    }
  }

  private detachPickerListeners(): void {
    const el = this.drivePickerRef()?.nativeElement;

    if (el) {
      el.removeEventListener('picker-picked', this.onFilePicked);

      el.removeEventListener('picker-canceled', this.onPickerCanceled);

      this.pickerListenersAttached = false;
    }
  }

  private closePicker(): void {
    const el = this.drivePickerRef()?.nativeElement;

    if (el) {
      el.visible = false;
    }

    this.showPicker.set(false);
    this.pickerListenersAttached = false;
    this.wantFilePicker = false;
  }

  /**
   * Authenticate with Google without opening the Drive Picker.
   */
  async authenticateOnly(): Promise<void> {
    try {
      await this.drive.connect();

      if (this.characterListService.activeCharacter()) {
        await this.checkForRemoteUpdate();
      }
    } catch (err) {
      console.error('Google Drive authentication failed:', err);
    }
  }

  /**
   * Open the Drive Picker.
   *
   * Authentication is handled by GoogleDriveService. The current
   * access token is passed to the Picker explicitly.
   */
  async openPickerForFile(): Promise<void> {
    try {
      await this.drive.ensureAccessToken();

      this.wantFilePicker = true;
      this.showPicker.set(true);

      setTimeout(() => {
        this.attachPickerListeners();

        const el = this.drivePickerRef()?.nativeElement;

        if (el) {
          (el as any).oauthToken = this.drive.accessToken;
          el.visible = true;
        }
      }, 0);
    } catch (err) {
      console.error('Google Drive authentication failed:', err);
    }
  }

  exportJSON(): void {
    const json = this.cs.exportJSON();
    const blob = new Blob([json], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `${this.cs.character().characterName || 'character'}.json`;

    a.click();

    URL.revokeObjectURL(url);
  }

  doImport(): void {
    this.importError.set('');

    if (!this.importText().trim()) {
      this.importError.set('Bitte JSON-Text eingeben.');
      return;
    }

    const success = this.cs.importJSON(this.importText());

    if (success) {
      this.showImport.set(false);
      this.importText.set('');
    } else {
      this.importError.set('Ungültiges JSON-Format.');
    }
  }

  doReset(): void {
    this.cs.resetCharacter();
    this.showReset.set(false);
  }

  // === Google Drive ===

  async saveToDrive(): Promise<void> {
    const currentFile = this.characterListService.activeCharacter();

    if (!currentFile || !currentFile.fileId || !currentFile.fileName) {
      return;
    }

    try {
      const currentVersion = this.cs.character().version ?? 0;

      this.cs.update({
        version: currentVersion + 1,
      });

      const json = this.cs.exportJSON();

      await this.drive.saveFile(currentFile.fileId, json, currentFile.fileName);

      this.characterListService.updateCharacterEntry(currentFile.id, {
        characterName: this.cs.character().characterName || currentFile.fileName,
      });

      this.characterListService.remoteUpdateAvailable.set(null);
    } catch (err) {
      console.error('Error saving to Google Drive:', err);

      if (this.drive.tokenExpired()) {
        return;
      }
    }
  }

  async createDriveFile(): Promise<void> {
    const currentFile = this.characterListService.activeCharacter();

    if (!currentFile) {
      return;
    }

    let fileName =
      this.newDriveFileName().trim() || `${this.cs.character().characterName || 'character'}.json`;

    if (!fileName.endsWith('.json')) {
      fileName += '.json';
    }

    try {
      const currentVersion = this.cs.character().version ?? 0;

      this.cs.update({
        version: currentVersion + 1,
      });

      const json = this.cs.exportJSON();

      const fileInfo = await this.drive.createFile(json, fileName);

      this.characterListService.updateCharacterEntry(currentFile.id, {
        fileId: fileInfo.id,
        fileName: fileInfo.name,
      });

      this.showNewDriveFile.set(false);
      this.newDriveFileName.set('');
    } catch (err) {
      console.error('Error creating file on Google Drive:', err);

      if (this.drive.tokenExpired()) {
        this.showNewDriveFile.set(false);
        return;
      }
    }
  }

  /**
   * Check if the remote file has a newer version than the
   * local one.
   */
  async checkForRemoteUpdate(): Promise<void> {
    const currentFile = this.characterListService.activeCharacter();

    if (!currentFile || !currentFile.fileId) {
      return;
    }

    const localVersion = this.cs.character().version ?? 0;

    await this.characterListService.checkRemoteVersion(currentFile.fileId, localVersion);

    if (this.characterListService.remoteUpdateAvailable()) {
      this.showRemoteUpdate.set(true);
    }
  }

  /**
   * Reload the character data from the remote Google Drive file.
   */
  async reloadFromRemote(): Promise<void> {
    const currentFile = this.characterListService.activeCharacter();

    if (!currentFile || !currentFile.fileId) {
      return;
    }

    try {
      const content = await this.drive.readFile(currentFile.fileId);

      this.cs.importJSON(content);

      this.characterListService.remoteUpdateAvailable.set(null);

      this.showRemoteUpdate.set(false);
    } catch (err) {
      console.error('Error reloading from Google Drive:', err);
    }
  }

  // === Character Switching ===

  /**
   * Open the character list dialog.
   * Uses the localStorage-based list.
   */
  openCharacterList(): void {
    this.showCharacterList.set(true);
  }

  /**
   * Initiate switching to a different character.
   * Asks to save first if connected to a file.
   */
  requestSwitchCharacter(entry: CharacterFileEntry): void {
    if (entry.active) {
      return;
    }

    if (this.characterListService.activeCharacter()) {
      this.pendingSwitchEntry.set(entry);
      this.showCharacterList.set(false);
      this.showSaveBeforeSwitch.set(true);
    } else {
      void this.doSwitchCharacter(entry);
    }
  }

  /**
   * Save current character then switch.
   */
  async saveAndSwitch(): Promise<void> {
    this.showSaveBeforeSwitch.set(false);

    const currentFile = this.characterListService.activeCharacter();

    await this.saveToDrive();

    const entry = this.pendingSwitchEntry();

    if (entry) {
      if (currentFile) {
        this.characterListService.updateCharacterEntry(currentFile.id, {
          characterName: this.cs.character().characterName,
        });
      }

      await this.doSwitchCharacter(entry);
    }

    this.pendingSwitchEntry.set(null);
  }

  /**
   * Switch without saving.
   */
  async switchWithoutSaving(): Promise<void> {
    this.showSaveBeforeSwitch.set(false);

    const entry = this.pendingSwitchEntry();

    if (entry) {
      await this.doSwitchCharacter(entry);
    }

    this.pendingSwitchEntry.set(null);
  }

  /**
   * Actually switch to a different character file
   * from Google Drive.
   */
  private async doSwitchCharacter(entry: CharacterFileEntry): Promise<void> {
    this.showCharacterList.set(false);

    try {
      this.cs.resetCharacter();

      if (entry.fileId && entry.fileName) {
        const content = await this.drive.readFile(entry.fileId);

        this.cs.importJSON(content);
      }

      const loadedName = this.cs.character().characterName || entry.fileName;

      if (loadedName && loadedName !== entry.characterName) {
        this.characterListService.updateCharacterEntry(entry.id, {
          characterName: loadedName,
        });
      }

      this.characterListService.setCharacterEntryActive(entry.id);
    } catch (err) {
      console.error('Error switching character:', err);
    }
  }

  /**
   * Called after a file is picked in "add character" mode.
   * Saves default character data to the selected file and
   * adds it to the list.
   */
  protected async addCharacter(): Promise<void> {
    const id = this.characterListService.addCharacterEntry({
      fileId: null,
      fileName: null,
      characterName: 'Neuer Charakter',
    });

    this.showCharacterList.set(false);

    const entry = this.characterListService.getCharacterEntry(id);

    if (entry) {
      this.requestSwitchCharacter(entry);
    }
  }

  /**
   * Delete a character entry from the list.
   * Does not delete the file from Google Drive.
   */
  protected async deleteCharacter(id: string): Promise<void> {
    this.characterListService.removeCharacterEntry(id);
  }
}
