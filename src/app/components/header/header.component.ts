import { Component, effect, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutside } from 'ngxtension/click-outside';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { TreeSelectModule } from 'primeng/treeselect';
import { ALIGNMENTS, DND_BACKGROUNDS, DND_CLASS_TREE, DND_RACES } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    AutoCompleteModule,
    TreeSelectModule,
    TooltipModule,
    IftaLabelModule,
    ImageModule,
    ClickOutside,
  ],
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
      <div class="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch">
        @if (cs.character().characterImage) {
          <div class="shrink-0">
            <p-image
              [src]="cs.character().characterImage"
              alt="Charakter"
              [preview]="true"
              width="64"
              imageClass="w-16 h-16 object-cover rounded-lg border border-gray-300"
            />
          </div>
        }
        <div class="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[2fr_auto_1fr_1fr_1fr_1fr] gap-2 items-end">
          <!-- Klasse -->
          <p-ifta-label>
            <p-tree-select
              [ngModel]="selectedClassNode()"
              (ngModelChange)="onClassNodeSelect($event)"
              [options]="classTree"
              ariaLabel="Klasse"
              [style]="{ width: '100%', fontSize: '0.85rem' }"
              appendTo="body"
              [showClear]="false"
              id="header-class"
              [autofocus]="true"
            />
            <label for="header-class">Klasse</label>
          </p-ifta-label>
          <!-- Stufe -->
          <p-ifta-label>
            <p-input-number
              [ngModel]="cs.character().level"
              (ngModelChange)="cs.update({ level: $event ?? 1 })"
              [min]="1"
              [max]="20"
              [showButtons]="false"
              [inputStyle]="{ width: '100%', fontSize: '0.85rem' }"
              inputId="header-level"
              [fluid]="true"
            />
            <label for="header-level">Stufe</label>
          </p-ifta-label>
          <!-- Hintergrund -->
          <p-ifta-label>
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
          </p-ifta-label>
          <!-- Volk -->
          <p-ifta-label>
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
          </p-ifta-label>
          <!-- Gesinnung -->
          <p-ifta-label>
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
          </p-ifta-label>
          <!-- EP -->
          <p-ifta-label>
            <p-input-number
              [ngModel]="cs.character().experiencePoints"
              (ngModelChange)="cs.update({ experiencePoints: $event ?? 0 })"
              [useGrouping]="false"
              [inputStyle]="{ width: '100%' }"
              inputId="header-xp"
              [fluid]="true"
            />
            <label for="header-xp">EP</label>
          </p-ifta-label>
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

  selectedClassNode = model<any | null>(null);

  constructor() {
    // Keep selectedClassNode in sync with the character signal
    effect(() => {
      const className = this.cs.character().className;
      const classNode = className ? this.findClassNodeByName(className, this.classTree) : null;
      this.selectedClassNode.set(classNode || null);
    });
  }

  findClassNodeByName(name: string, nodes: any[]): any | null {
    for (const node of nodes) {
      if (node.data === name) {
        return node;
      }
      if (node.children) {
        const found = this.findClassNodeByName(name, node.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  getAlignmentLabel(): string {
    const value = this.cs.character().alignment;
    return this.alignments.find(a => a.value === value)?.label ?? value;
  }

  onClassNodeSelect(nodeKey: any): void {
    this.selectedClassNode.set(nodeKey);
    if (nodeKey?.data && typeof nodeKey.data === 'string') {
      this.cs.update({ className: nodeKey.data });
    } else {
      this.cs.update({ className: '' });
    }
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
