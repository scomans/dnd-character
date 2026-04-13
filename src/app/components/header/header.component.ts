import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TreeSelectModule } from 'primeng/treeselect';
import { TooltipModule } from 'primeng/tooltip';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ALIGNMENTS, DND_CLASS_TREE, DND_RACES, DND_BACKGROUNDS, LIFESTYLES } from '../../models/character.model';
import { ClickOutside } from 'ngxtension/click-outside';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, SelectModule, AutoCompleteModule, TreeSelectModule, TooltipModule, IftaLabelModule, ClickOutside],
  template: `
    <div class="bg-white border-2 border-slate-700 rounded-lg p-4 mb-4">
      <!-- Character Name as click-to-edit title -->
      <div class="flex items-center gap-2 mb-3">
        @if (editingName()) {
          <input
            pInputText
            [ngModel]="cs.character().characterName"
            (ngModelChange)="cs.update({ characterName: $event })"
            placeholder="Charaktername"
            class="text-2xl font-bold font-serif tracking-wide flex-1"
            (clickOutside)="editingName.set(false)"
            autofocus
          />
        } @else {
          <span
            class="text-2xl font-bold text-slate-800 tracking-wide font-serif cursor-pointer hover:text-slate-500 flex-1"
            (click)="editingName.set(true)"
            pTooltip="Klicken zum Bearbeiten"
            tooltipPosition="top"
          >{{ cs.character().characterName || 'Charaktername' }}</span>
        }
      </div>
      <div class="flex gap-4 items-start">
        @if (cs.character().characterImage) {
          <div class="shrink-0">
            <img [src]="cs.character().characterImage" alt="Charakter" class="w-16 h-16 object-cover rounded-lg border border-gray-300" />
          </div>
        }
        <div class="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-[2fr_auto_1fr_1fr_1fr_1fr] gap-2 items-end">
          <!-- Klasse -->
          <p-iftalabel>
            @if (editingField() === 'class') {
              <p-tree-select
                [ngModel]="selectedClassNode"
                (ngModelChange)="onClassNodeSelect($event)"
                [options]="classTree"
                placeholder="Klasse"
                [style]="{ width: '100%', fontSize: '0.85rem' }"
                appendTo="body"
                [filter]="true"
                filterPlaceholder="Suchen..."
                id="header-class"
              />
            } @else {
              <input
                pInputText
                [value]="cs.character().className || ''"
                (click)="editingField.set('class')"
                readonly
                class="w-full text-sm cursor-pointer"
                id="header-class"
              />
            }
            <label for="header-class">Klasse</label>
          </p-iftalabel>
          <!-- Stufe -->
          <p-iftalabel>
            <p-input-number
              [ngModel]="cs.character().level"
              (ngModelChange)="cs.update({ level: $event ?? 1 })"
              [min]="1"
              [max]="20"
              [showButtons]="false"
              [inputStyle]="{ width: '100%', textAlign: 'center', fontSize: '0.85rem' }"
              inputId="header-level"
            />
            <label for="header-level">Stufe</label>
          </p-iftalabel>
          <!-- Hintergrund -->
          <p-iftalabel>
            @if (editingField() === 'background') {
              <p-auto-complete
                [ngModel]="cs.character().background"
                (ngModelChange)="cs.update({ background: $event })"
                [suggestions]="filteredBackgrounds"
                (completeMethod)="filterBackgrounds($event)"
                (onSelect)="editingField.set(null)"
                [dropdown]="true"
                [forceSelection]="false"
                placeholder=" "
                [inputStyle]="{ width: '100%', fontSize: '0.85rem' }"
                [style]="{ width: '100%' }"
                appendTo="body"
                inputId="header-bg"
              />
            } @else {
              <input
                pInputText
                [value]="cs.character().background || ''"
                (click)="editingField.set('background')"
                readonly
                class="w-full text-sm cursor-pointer"
                id="header-bg"
              />
            }
            <label for="header-bg">Hintergrund</label>
          </p-iftalabel>
          <!-- Volk -->
          <p-iftalabel>
            @if (editingField() === 'race') {
              <p-auto-complete
                [ngModel]="cs.character().race"
                (ngModelChange)="cs.update({ race: $event })"
                [suggestions]="filteredRaces"
                (completeMethod)="filterRaces($event)"
                (onSelect)="editingField.set(null)"
                [dropdown]="true"
                [forceSelection]="false"
                placeholder=" "
                [inputStyle]="{ width: '100%', fontSize: '0.85rem' }"
                [style]="{ width: '100%' }"
                appendTo="body"
                inputId="header-race"
              />
            } @else {
              <input
                pInputText
                [value]="cs.character().race || ''"
                (click)="editingField.set('race')"
                readonly
                class="w-full text-sm cursor-pointer"
                id="header-race"
              />
            }
            <label for="header-race">Volk</label>
          </p-iftalabel>
          <!-- Gesinnung -->
          <p-iftalabel>
            @if (editingField() === 'alignment') {
              <p-select
                [ngModel]="cs.character().alignment"
                (ngModelChange)="onAlignmentChange($event)"
                [options]="alignments"
                optionLabel="label"
                optionValue="value"
                placeholder=" "
                [style]="{ width: '100%', fontSize: '0.85rem' }"
                appendTo="body"
                inputId="header-alignment"
              />
            } @else {
              <input
                pInputText
                [value]="getAlignmentLabel() || ''"
                (click)="editingField.set('alignment')"
                readonly
                class="w-full text-sm cursor-pointer"
                id="header-alignment"
              />
            }
            <label for="header-alignment">Gesinnung</label>
          </p-iftalabel>
          <!-- EP -->
          <p-iftalabel>
            <p-input-number
              [ngModel]="cs.character().experiencePoints"
              (ngModelChange)="cs.update({ experiencePoints: $event ?? 0 })"
              [useGrouping]="false"
              [inputStyle]="{ width: '100%' }"
              inputId="header-xp"
            />
            <label for="header-xp">EP</label>
          </p-iftalabel>
        </div>
      </div>
    </div>
  `,
})
export class HeaderComponent {
  cs = inject(CharacterService);
  alignments = ALIGNMENTS;
  classTree = DND_CLASS_TREE;
  editingName = signal(false);
  editingField = signal<string | null>(null);

  allRaces = DND_RACES;
  allBackgrounds = DND_BACKGROUNDS;
  filteredRaces: string[] = [];
  filteredBackgrounds: string[] = [];

  selectedClassNode: any = null;

  constructor() {
    // Keep selectedClassNode in sync with the character signal
    effect(() => {
      const className = this.cs.character().className;
      this.selectedClassNode = className || null;
    });
  }

  getAlignmentLabel(): string {
    const value = this.cs.character().alignment;
    return this.alignments.find(a => a.value === value)?.label ?? value;
  }

  onClassNodeSelect(nodeKey: any): void {
    console.log(nodeKey)
    this.selectedClassNode = nodeKey;
    if (nodeKey?.data && typeof nodeKey.data === 'string') {
      this.cs.update({ className: nodeKey.data });
    } else {
      this.cs.update({ className: '' });
    }
    this.editingField.set(null);
  }

  onAlignmentChange(value: string): void {
    this.cs.update({ alignment: value });
    this.editingField.set(null);
  }

  filterRaces(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.filteredRaces = this.allRaces.filter(r => r.toLowerCase().includes(query));
  }

  filterBackgrounds(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.filteredBackgrounds = this.allBackgrounds.filter(b => b.toLowerCase().includes(query));
  }
}
