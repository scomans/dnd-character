import { computed, inject, Injectable, signal } from '@angular/core';
import { v4 } from 'uuid';
import { GoogleDriveService } from './google-drive.service';

export interface CharacterFileEntry {
  id: string;
  fileId: string | null;
  fileName: string | null;
  characterName: string;
  active: boolean;
}

export interface RemoteVersionInfo {
  remoteVersion: number;
  localVersion: number;
}

const STORAGE_CHARACTER_LIST_KEY = 'dnd-character-list';

@Injectable({
  providedIn: 'root',
})
export class CharacterListService {
  private googleDriveService = inject(GoogleDriveService);

  readonly remoteUpdateAvailable = signal<RemoteVersionInfo | null>(null);
  readonly characterList = signal<CharacterFileEntry[]>([]);
  readonly activeCharacter = computed(() => this.characterList().find((c) => c.active));

  constructor() {
    // Load character list from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_CHARACTER_LIST_KEY);
      if (saved) {
        this.characterList.set(JSON.parse(saved));
      } else {
        this.characterList.set([
          {
            id: v4(),
            active: true,
            fileId: null,
            fileName: null,
            characterName: 'Neuer Charakter',
          },
        ]);
        this.saveCharacterList();
      }
    } catch {
      // ignore parse errors
    }
  }

  /**
   * Check the remote file version against the local version.
   * Sets remoteUpdateAvailable signal if remote is newer.
   */
  async checkRemoteVersion(fileId: string, localVersion: number): Promise<void> {
    if (!this.googleDriveService.isConnected()) {
      return;
    }
    try {
      const content = await this.googleDriveService.readFile(fileId);
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
   * Get a character entry by ID from the local character list. Returns null if not found.
   */
  getCharacterEntry(id: string): CharacterFileEntry | null {
    return this.characterList().find((e) => e.id === id) ?? null;
  }

  /**
   * Add a character entry in the local character list.
   */
  addCharacterEntry(entry: Omit<CharacterFileEntry, 'id' | 'active'>): string {
    const id = v4();
    this.characterList.update((list) => {
      if ('id' in entry) {
        return list;
      }

      return [...list, { ...entry, active: false, id }];
    });
    this.saveCharacterList();
    return id;
  }

  /**
   * Update a character entry in the local character list.
   */
  updateCharacterEntry(id: string, entry: Partial<Omit<CharacterFileEntry, 'active'>>): void {
    this.characterList.update((list) => {
      const idx = list.findIndex((e) => e.id === id);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = { ...list[idx], ...entry };
        return updated;
      }
      return list;
    });
    this.saveCharacterList();
  }

  /**
   * Remove a character entry from the local character list.
   */
  removeCharacterEntry(id: string): void {
    this.characterList.update((list) => list.filter((e) => e.id !== id));
    this.saveCharacterList();
  }

  /**
   * Set a character entry as active, which indicates the currently loaded character in the UI.
   */
  setCharacterEntryActive(id: string): void {
    this.characterList.update((list) => {
      const idx = list.findIndex((e) => e.id === id);
      if (idx >= 0) {
        const updated = list.map((e) => ({ ...e, active: false }));
        updated[idx] = { ...list[idx], active: true };
        return updated;
      }
      return list;
    });
    this.saveCharacterList();
  }

  private saveCharacterList(): void {
    localStorage.setItem(STORAGE_CHARACTER_LIST_KEY, JSON.stringify(this.characterList()));
  }
}
