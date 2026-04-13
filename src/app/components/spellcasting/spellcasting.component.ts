import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Divider } from 'primeng/divider';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { Spell, SPELLCASTING_CLASSES, ABILITY_LABELS } from '../../models/character.model';

@Component({
  selector: 'app-spellcasting',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule,
    SelectModule,
    FieldsetModule,
    AccordionModule,
    TooltipModule,
    IftaLabelModule,
    ToggleSwitchModule,
    MarkdownEditorComponent,
    DragDropModule,
    Divider,
  ],
  template: `
    <p-fieldset legend="Zauberwirken" styleClass="space-y-3">
      <!-- Spellcasting Header -->
      <div class="grid grid-cols-4 gap-2">
        <p-iftalabel>
          @if (editingField() === 'spellClass') {
            <p-select
              [ngModel]="cs.character().spellcastingClass"
              (ngModelChange)="onSpellcastingClassChange($event)"
              [options]="spellcastingClasses"
              optionLabel="label"
              optionValue="value"
              placeholder=" "
              [style]="{ width: '100%' }"
              appendTo="body"
              inputId="spell-class"
            />
          } @else {
            <input
              pInputText
              [value]="getSpellcastingClassLabel() || ''"
              (click)="editingField.set('spellClass')"
              readonly
              class="w-full text-sm cursor-pointer"
              id="spell-class"
            />
          }
          <label for="spell-class">Zauberwirkende Klasse</label>
        </p-iftalabel>
        <p-iftalabel>
          @if (editingField() === 'spellAbility') {
            <p-select
              [ngModel]="cs.character().spellcastingAbility"
              (ngModelChange)="onSpellAbilityChange($event)"
              [options]="abilityOptions"
              optionLabel="label"
              optionValue="value"
              placeholder=" "
              [style]="{ width: '100%' }"
              appendTo="body"
              inputId="spell-ability"
            />
          } @else {
            <input
              pInputText
              [value]="getAbilityLabel(cs.character().spellcastingAbility) || ''"
              (click)="editingField.set('spellAbility')"
              readonly
              class="w-full text-sm cursor-pointer"
              id="spell-ability"
            />
          }
          <label for="spell-ability">Zauberattribut</label>
        </p-iftalabel>
        <div
          class="flex flex-col items-center justify-center"
          pTooltip="8 + Übungsbonus + Zauberattribut-Modifikator"
          tooltipPosition="top"
        >
          <span class="text-2xl font-bold text-slate-700">{{ cs.getSpellSaveDC() || '--' }}</span>
          <span class="text-[0.6rem] font-bold text-gray-600 mt-1">Zauber-SG</span>
        </div>
        <div class="flex flex-col items-center justify-center">
          <span class="text-2xl font-bold text-slate-700">
            @if (cs.getSpellAttackBonus()) {
              {{ cs.getSpellAttackBonus() >= 0 ? '+' : '' }}{{ cs.getSpellAttackBonus() }}
            } @else {
              --
            }
          </span>
          <span class="text-[0.6rem] font-bold text-gray-600 mt-1">Zauber-Angriff</span>
        </div>
      </div>

      <p-divider />
      <!-- Spell Slots -->
      <div>
        <span class="text-xs font-bold text-gray-600">Zauberplätze</span>
        <div class="grid grid-cols-9 gap-1 mt-1">
          @for (level of spellLevels; track level) {
            <div class="flex flex-col items-center text-xs">
              <span class="font-bold text-slate-700 mb-0.5">{{ level }}</span>
              <p-input-number
                [ngModel]="getSlotMax(level)"
                (ngModelChange)="updateSlotMax(level, $event)"
                [showButtons]="false"
                [min]="0"
                [inputStyle]="{ width: '2.5rem', textAlign: 'center', fontSize: '0.7rem' }"
                pTooltip="Max. Plätze"
                tooltipPosition="top"
              />
              <div class="flex flex-wrap justify-center gap-0.5 mt-1">
                @for (i of getSlotRange(level); track i) {
                  <span
                    class="w-3.5 h-3.5 rounded-full border border-slate-400 cursor-pointer flex items-center justify-center text-[0.5rem]"
                    [class.bg-slate-700]="i < getSlotUsed(level)"
                    [class.border-slate-700]="i < getSlotUsed(level)"
                    [class.bg-white]="i >= getSlotUsed(level)"
                    (click)="toggleSlotUsed(level, i)"
                    [pTooltip]="i < getSlotUsed(level) ? 'Verbraucht' : 'Verfügbar'"
                    tooltipPosition="top"
                  ></span>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Filter for prepared spells + expand/collapse -->
      <div class="flex items-center gap-2 mt-2">
        <p-toggleswitch [(ngModel)]="showPreparedOnly" />
        <span class="text-xs text-gray-600">Nur vorbereitete Zauber anzeigen</span>
        <span class="flex-1"></span>
        <p-button
          icon="pi pi-angle-double-down"
          size="small"
          [text]="true"
          pTooltip="Alle aufklappen"
          tooltipPosition="top"
          (onClick)="expandAll()"
        />
        <p-button
          icon="pi pi-angle-double-up"
          size="small"
          [text]="true"
          pTooltip="Alle zuklappen"
          tooltipPosition="top"
          (onClick)="collapseAll()"
        />
      </div>

      <!-- Spells List with Accordions -->
      <div>
        @for (levelGroup of groupedSpellLevels; track levelGroup.level) {
          <div class="border-t border-gray-200 pt-1 mt-1">
            <span class="text-xs font-bold text-gray-600 mb-1 block">
              {{ levelGroup.level === 0 ? 'Zaubertricks' : 'Stufe ' + levelGroup.level }}
            </span>
            <p-accordion [multiple]="true" [value]="expandedPanels()">
              <div
                cdkDropList
                [cdkDropListData]="levelGroup.level"
                (cdkDropListDropped)="dropSpell($event, levelGroup.level)"
              >
                @for (spell of getFilteredSpellsForLevel(levelGroup.level); track $index) {
                  <div cdkDrag [cdkDragData]="spell">
                    <p-accordion-panel [value]="'spell-' + levelGroup.level + '-' + $index">
                      <p-accordion-header>
                        <div class="flex items-center gap-1 w-full text-xs" (click)="$event.stopPropagation()">
                          <i class="pi pi-bars text-gray-400 cursor-move mr-1" cdkDragHandle></i>
                          @if (levelGroup.level > 0) {
                            <p-checkbox
                              [ngModel]="spell.prepared"
                              (ngModelChange)="updateSpellPreparedByRef(spell, $event)"
                              [binary]="true"
                            />
                          }
                          <input
                            pInputText
                            [(ngModel)]="spell.name"
                            (ngModelChange)="updateSpells()"
                            class="flex-1 text-xs"
                            placeholder="Zaubername"
                          />
                          <p-button
                            icon="pi pi-trash"
                            [rounded]="true"
                            [text]="true"
                            severity="danger"
                            size="small"
                            (onClick)="removeSpell(spell)"
                          />
                        </div>
                      </p-accordion-header>
                      <p-accordion-content>
                        <div class="p-2">
                          <app-markdown-editor
                            [value]="spell.description"
                            (valueChange)="spell.description = $event; updateSpells()"
                            placeholder="Beschreibung eingeben..."
                            [minRows]="3"
                          />
                        </div>
                      </p-accordion-content>
                    </p-accordion-panel>
                  </div>
                }
              </div>
            </p-accordion>
          </div>
        }
        <p-divider />
        <div class="flex gap-2 mt-8 justify-center">
          <p-select
            [(ngModel)]="newSpellLevel"
            [options]="spellLevelOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Stufe"
            [style]="{ width: '14rem', fontSize: '0.75rem' }"
            appendTo="body"
            size="small"
          />
          <p-button label="Zauber hinzufügen" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addSpell()" />
        </div>
      </div>

    </p-fieldset>
  `,
})
export class SpellcastingComponent {
  cs = inject(CharacterService);
  spellcastingClasses = SPELLCASTING_CLASSES;
  spellLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  newSpellLevel = 0;
  showPreparedOnly = false;
  editingField = signal<string | null>(null);
  expandedPanels = signal<string[]>([]);

  abilityOptions = [
    { label: 'Keine', value: '' },
    { label: 'Stärke', value: 'str' },
    { label: 'Geschicklichkeit', value: 'dex' },
    { label: 'Konstitution', value: 'con' },
    { label: 'Intelligenz', value: 'int' },
    { label: 'Weisheit', value: 'wis' },
    { label: 'Charisma', value: 'cha' },
  ];

  spellLevelOptions = [
    { label: 'Zaubertrick (Stufe 0)', value: 0 },
    ...Array.from({ length: 9 }, (_, i) => ({ label: `Stufe ${i + 1}`, value: i + 1 })),
  ];

  getSpellcastingClassLabel(): string {
    const value = this.cs.character().spellcastingClass;
    return this.spellcastingClasses.find(c => c.value === value)?.label ?? value;
  }

  getAbilityLabel(ability: string): string {
    return ABILITY_LABELS[ability] ?? ability;
  }

  get groupedSpellLevels() {
    const spells = this.cs.character().spells;
    const allLevels = [...new Set(spells.map(s => s.level))].sort((a, b) => a - b);
    if (this.showPreparedOnly) {
      return allLevels
        .filter(level => spells.some(s => s.level === level && (s.prepared || level === 0)))
        .map(level => ({ level }));
    }
    return allLevels.map(level => ({ level }));
  }

  getSpellsForLevel(level: number): Spell[] {
    return this.cs.character().spells.filter(s => s.level === level);
  }

  getFilteredSpellsForLevel(level: number): Spell[] {
    const spells = this.getSpellsForLevel(level);
    if (this.showPreparedOnly && level > 0) {
      return spells.filter(s => s.prepared);
    }
    return spells;
  }

  expandAll(): void {
    const panels: string[] = [];
    for (const levelGroup of this.groupedSpellLevels) {
      const spells = this.getFilteredSpellsForLevel(levelGroup.level);
      spells.forEach((_, i) => panels.push('spell-' + levelGroup.level + '-' + i));
    }
    this.expandedPanels.set(panels);
  }

  collapseAll(): void {
    this.expandedPanels.set([]);
  }

  getSlotMax(level: number): number {
    return this.cs.character().spellSlots[level]?.max ?? 0;
  }

  getSlotUsed(level: number): number {
    return this.cs.character().spellSlots[level]?.used ?? 0;
  }

  updateSlotMax(level: number, value: number | null): void {
    const char = this.cs.character();
    const slots = { ...char.spellSlots };
    slots[level] = { max: value ?? 0, used: slots[level]?.used ?? 0 };
    this.cs.update({ spellSlots: slots });
  }

  updateSlotUsed(level: number, value: number | null): void {
    const char = this.cs.character();
    const slots = { ...char.spellSlots };
    slots[level] = { max: slots[level]?.max ?? 0, used: value ?? 0 };
    this.cs.update({ spellSlots: slots });
  }

  getSlotRange(level: number): number[] {
    const max = this.getSlotMax(level);
    return Array.from({ length: max }, (_, i) => i);
  }

  toggleSlotUsed(level: number, index: number): void {
    const currentUsed = this.getSlotUsed(level);
    const newUsed = (index < currentUsed) ? index : index + 1;
    this.updateSlotUsed(level, newUsed);
  }

  onSpellcastingClassChange(value: string): void {
    const found = this.spellcastingClasses.find(c => c.value === value);
    const updates: Partial<any> = { spellcastingClass: value };
    if (found) {
      updates['spellcastingAbility'] = found.ability;
    }
    this.cs.update(updates);
    this.editingField.set(null);
  }

  onSpellAbilityChange(value: string): void {
    this.cs.update({ spellcastingAbility: value });
    this.editingField.set(null);
  }

  addSpell(): void {
    const char = this.cs.character();
    const newSpell: Spell = {
      name: '',
      level: this.newSpellLevel,
      school: '',
      castingTime: '',
      range: '',
      components: '',
      duration: '',
      description: '',
      prepared: false,
    };
    this.cs.update({ spells: [...char.spells, newSpell] });
  }

  removeSpell(spell: Spell): void {
    const char = this.cs.character();
    const idx = char.spells.indexOf(spell);
    if (idx >= 0) {
      const spells = [...char.spells];
      spells.splice(idx, 1);
      this.cs.update({ spells });
    }
  }

  updateSpells(): void {
    const char = this.cs.character();
    this.cs.update({ spells: [...char.spells] });
  }

  updateSpellPreparedByRef(spell: Spell, prepared: boolean): void {
    const char = this.cs.character();
    const idx = char.spells.indexOf(spell);
    if (idx >= 0) {
      const spells = [...char.spells.map(s => ({ ...s }))];
      spells[idx].prepared = prepared;
      this.cs.update({ spells });
    }
  }

  dropSpell(event: CdkDragDrop<number>, level: number): void {
    const char = this.cs.character();
    const spellsOfLevel = char.spells.filter(s => s.level === level);

    if (event.previousIndex === event.currentIndex) return;

    // Reorder within this level group
    moveItemInArray(spellsOfLevel, event.previousIndex, event.currentIndex);

    // Compute insertion index before filtering
    const firstIndex = char.spells.findIndex(s => s.level === level);
    const newSpells = char.spells.filter(s => s.level !== level);
    newSpells.splice(firstIndex >= 0 ? firstIndex : newSpells.length, 0, ...spellsOfLevel);

    this.cs.update({ spells: newSpells });
  }
}
