import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, TextareaModule],
  template: `
    <div class="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg mb-4 shadow-md">
      <span class="text-lg font-bold flex-1">⚔️ D&D Charakterbogen</span>
      <p-button label="Export JSON" icon="pi pi-download" size="small" severity="secondary" (onClick)="exportJSON()" />
      <p-button label="Import JSON" icon="pi pi-upload" size="small" severity="secondary" (onClick)="showImport = true" />
      <p-button label="Zurücksetzen" icon="pi pi-refresh" size="small" severity="danger" (onClick)="showReset = true" />
    </div>

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
  showImport = false;
  showReset = false;
  importText = '';
  importError = '';

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
}
