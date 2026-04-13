import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TreeSelectModule } from 'primeng/treeselect';
import { TooltipModule } from 'primeng/tooltip';
import { ALIGNMENTS, DND_CLASS_TREE, DND_RACES, DND_BACKGROUNDS, LIFESTYLES } from '../../models/character.model';
import { ClickOutside } from 'ngxtension/click-outside';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, SelectModule, AutoCompleteModule, TreeSelectModule, TooltipModule, ClickOutside],
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
        <div class="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2">
          <!-- Klasse & Stufe -->
          <div class="flex flex-col">
            <div class="flex gap-1">
              <p-treeselect
                [ngModel]="selectedClassNode"
                (ngModelChange)="onClassNodeSelect($event)"
                [options]="classTree"
                placeholder="Klasse"
                [style]="{ width: '100%', fontSize: '0.85rem' }"
                appendTo="body"
                [filter]="true"
                filterPlaceholder="Suchen..."
              />
              <p-inputnumber
                [ngModel]="cs.character().level"
                (ngModelChange)="cs.update({ level: $event ?? 1 })"
                [min]="1"
                [max]="20"
                [showButtons]="false"
                [inputStyle]="{ width: '2.5rem', textAlign: 'center', fontSize: '0.85rem' }"
              />
            </div>
            <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">Klasse & Stufe</label>
          </div>
          <!-- Hintergrund -->
          <div class="flex flex-col">
            <p-autocomplete
              [ngModel]="cs.character().background"
              (ngModelChange)="cs.update({ background: $event })"
              [suggestions]="filteredBackgrounds"
              (completeMethod)="filterBackgrounds($event)"
              [dropdown]="true"
              [forceSelection]="false"
              placeholder="Hintergrund"
              [inputStyle]="{ width: '100%', fontSize: '0.85rem' }"
              [style]="{ width: '100%' }"
              appendTo="body"
            />
            <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">Hintergrund</label>
          </div>
          <!-- Volk -->
          <div class="flex flex-col">
            <p-autocomplete
              [ngModel]="cs.character().race"
              (ngModelChange)="cs.update({ race: $event })"
              [suggestions]="filteredRaces"
              (completeMethod)="filterRaces($event)"
              [dropdown]="true"
              [forceSelection]="false"
              placeholder="Volk"
              [inputStyle]="{ width: '100%', fontSize: '0.85rem' }"
              [style]="{ width: '100%' }"
              appendTo="body"
            />
            <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">Volk</label>
          </div>
          <!-- Gesinnung -->
          <div class="flex flex-col">
            <p-select
              [ngModel]="cs.character().alignment"
              (ngModelChange)="cs.update({ alignment: $event })"
              [options]="alignments"
              optionLabel="label"
              optionValue="value"
              placeholder="--"
              [style]="{ width: '100%', fontSize: '0.85rem' }"
              appendTo="body"
            />
            <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">Gesinnung</label>
          </div>
          <!-- EP -->
          <div class="flex flex-col" pTooltip="Erfahrungspunkte" tooltipPosition="top">
            <p-inputnumber
              [ngModel]="cs.character().experiencePoints"
              (ngModelChange)="cs.update({ experiencePoints: $event ?? 0 })"
              [useGrouping]="false"
              [inputStyle]="{ width: '100%' }"
            />
            <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">EP</label>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HeaderComponent {
  cs = inject(CharacterService);
  alignments = ALIGNMENTS;
  classTree = DND_CLASS_TREE;
  lifestyles = LIFESTYLES;
  editingName = signal(false);

  // AutoComplete suggestions
  allRaces = DND_RACES;
  allBackgrounds = DND_BACKGROUNDS;
  filteredRaces: string[] = [];
  filteredBackgrounds: string[] = [];

  selectedClassNode: any = null;

  constructor() {
    // Initialize selectedClassNode from current className using the key
    const className = this.cs.character().className;
    if (className) {
      this.selectedClassNode = className;
    }
  }

  onClassNodeSelect(nodeKey: any): void {
    this.selectedClassNode = nodeKey;
    // PrimeNG TreeSelect with selectionMode="single" (default) returns the node key directly
    if (nodeKey && typeof nodeKey === 'string') {
      this.cs.update({ className: nodeKey });
    } else {
      this.cs.update({ className: '' });
    }
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
