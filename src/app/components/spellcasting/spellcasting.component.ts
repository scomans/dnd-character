import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { Popover, PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { Spell, SpellSlot, SPELLCASTING_CLASSES, ABILITY_LABELS } from '../../models/character.model';

@Component({
  selector: 'app-spellcasting',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, CheckboxModule, ButtonModule, SelectModule, FieldsetModule, PopoverModule, TooltipModule, IftaLabelModule, MarkdownEditorComponent],
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
        <div class="flex flex-col items-center justify-center"
          pTooltip="8 + Übungsbonus + Zauberattribut-Modifikator"
          tooltipPosition="top"
        >
          <span class="text-2xl font-bold text-slate-700">{{ cs.getSpellSaveDC() || '--' }}</span>
          <span class="text-[0.6rem] font-bold uppercase text-gray-600 mt-1">Zauber-SG</span>
        </div>
        <div class="flex flex-col items-center justify-center">
          <span class="text-2xl font-bold text-slate-700">
            @if (cs.getSpellAttackBonus()) {
              {{ cs.getSpellAttackBonus() >= 0 ? '+' : '' }}{{ cs.getSpellAttackBonus() }}
            } @else {
              --
            }
          </span>
          <span class="text-[0.6rem] font-bold uppercase text-gray-600 mt-1">Zauber-Angriff</span>
        </div>
      </div>

      <!-- Spell Slots -->
      <div>
        <span class="text-xs font-bold text-gray-600">Zauberplätze</span>
        <div class="grid grid-cols-9 gap-1 mt-1">
          @for (level of spellLevels; track level) {
            <div class="flex flex-col items-center text-xs">
              <span class="font-bold text-slate-700 mb-0.5">{{ level }}</span>
              <p-inputnumber
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

      <!-- Spells List -->
      <div>
        <div class="space-y-1">
          @for (levelGroup of groupedSpellLevels; track levelGroup.level) {
            <div class="border-t border-gray-200 pt-1">
              <span class="text-xs font-bold text-gray-600">
                {{ levelGroup.level === 0 ? 'Zaubertricks' : 'Stufe ' + levelGroup.level }}
              </span>
              @for (spell of getSpellsForLevel(levelGroup.level); track spell.name + $index) {
                <div class="flex items-center gap-1 text-xs mt-0.5">
                  @if (levelGroup.level > 0) {
                    <p-checkbox
                      [ngModel]="spell.prepared"
                      (ngModelChange)="updateSpellPrepared($index, levelGroup.level, $event)"
                      [binary]="true"
                    />
                  }
                  <input pInputText [(ngModel)]="spell.name" (ngModelChange)="updateSpells()" class="flex-1 text-xs" />
                  <p-button
                    icon="pi pi-info-circle"
                    [rounded]="true"
                    [text]="true"
                    size="small"
                    (onClick)="toggleSpellInfo(spell, $event)"
                  />
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="removeSpell(spell)" />
                </div>
              }
            </div>
          }
        </div>
        <div class="flex gap-2 mt-2">
          <p-select
            [(ngModel)]="newSpellLevel"
            [options]="spellLevelOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Stufe"
            [style]="{ width: '14rem', fontSize: '0.75rem' }"
            appendTo="body"
          />
          <p-button label="Zauber hinzufügen" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addSpell()" />
        </div>
      </div>

    </p-fieldset>

    <!-- Spell Info Popover -->
    <p-popover #spellPopover [style]="{ width: '400px' }">
      @if (activeSpell) {
        <div class="space-y-2">
          <span class="text-sm font-bold">{{ activeSpell.name || 'Zauber' }} — Beschreibung</span>
          <app-markdown-editor
            [value]="activeSpell.description"
            (valueChange)="activeSpell.description = $event; updateSpells()"
            placeholder="Beschreibung eingeben..."
            [minRows]="5"
          />
        </div>
      }
    </p-popover>
  `,
})
export class SpellcastingComponent {
  cs = inject(CharacterService);
  @ViewChild('spellPopover') spellPopover!: Popover;
  spellcastingClasses = SPELLCASTING_CLASSES;
  spellLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  newSpellLevel = 0;
  activeSpell: Spell | null = null;
  editingField = signal<string | null>(null);

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
    const levels = [...new Set(spells.map(s => s.level))].sort((a, b) => a - b);
    return levels.map(level => ({ level }));
  }

  getSpellsForLevel(level: number): Spell[] {
    return this.cs.character().spells.filter(s => s.level === level);
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
    const newSpells = [...char.spells.map(s => ({ ...s }))];
    this.cs.update({ spells: newSpells });
    if (this.activeSpell) {
      const idx = char.spells.indexOf(this.activeSpell);
      if (idx >= 0 && idx < newSpells.length) {
        this.activeSpell = newSpells[idx];
      }
    }
  }

  updateSpellPrepared(indexInLevel: number, level: number, prepared: boolean): void {
    const char = this.cs.character();
    const spellsOfLevel = char.spells.filter(s => s.level === level);
    if (spellsOfLevel[indexInLevel]) {
      spellsOfLevel[indexInLevel].prepared = prepared;
      this.updateSpells();
    }
  }

  toggleSpellInfo(spell: Spell, event: Event): void {
    this.activeSpell = spell;
    if (this.spellPopover) {
      this.spellPopover.toggle(event);
    }
  }
}
