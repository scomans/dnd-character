import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TreeSelectModule } from 'primeng/treeselect';
import { TooltipModule } from 'primeng/tooltip';
import { ALIGNMENTS, DND_CLASS_TREE, LIFESTYLES } from '../../models/character.model';
import { ClickOutside } from 'ngxtension/click-outside';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, SelectModule, TreeSelectModule, TooltipModule, ClickOutside],
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
            <input pInputText [ngModel]="cs.character().background" (ngModelChange)="cs.update({ background: $event })" class="w-full" />
            <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">Hintergrund</label>
          </div>
          <!-- Volk -->
          <div class="flex flex-col">
            <input pInputText [ngModel]="cs.character().race" (ngModelChange)="cs.update({ race: $event })" class="w-full" />
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

  selectedClassNode: any = null;

  constructor() {
    // Initialize selectedClassNode from current className
    const className = this.cs.character().className;
    if (className) {
      this.selectedClassNode = this.findNodeByData(className);
    }
  }

  private findNodeByData(data: string): any {
    for (const parent of this.classTree) {
      if (parent.data === data) {
        return { [parent.data]: true };
      }
      if (parent.children) {
        for (const child of parent.children) {
          if (child.data === data) {
            return { [child.data]: true };
          }
        }
      }
    }
    return null;
  }

  onClassNodeSelect(node: any): void {
    this.selectedClassNode = node;
    if (node) {
      // TreeSelect returns a key-value map; find the selected key
      const keys = Object.keys(node);
      if (keys.length > 0) {
        // Find the node data from the tree
        const selectedKey = keys[0];
        const found = this.findDataByKey(selectedKey);
        if (found) {
          this.cs.update({ className: found });
          return;
        }
      }
    }
    this.cs.update({ className: '' });
  }

  private findDataByKey(key: string): string | null {
    for (const parent of this.classTree) {
      if (parent.data === key || parent.label === key) return parent.data;
      if (parent.children) {
        for (const child of parent.children) {
          if (child.data === key || child.label === key) return child.data;
        }
      }
    }
    return key; // Return the key itself as fallback (for custom entries)
  }
}
