import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Divider } from 'primeng/divider';
import { CharacterService } from '../../services/character.service';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Fieldset } from 'primeng/fieldset';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { Tooltip } from 'primeng/tooltip';
import { IftaLabel } from 'primeng/iftalabel';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { Spell, SPELLCASTING_CLASSES, ABILITY_LABELS } from '../../models/character.model';

@Component({
  selector: 'app-spellcasting',
  imports: [
    FormsModule,
    InputText,
    InputNumber,
    Checkbox,
    Button,
    Select,
    Fieldset,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    Tooltip,
    IftaLabel,
    ToggleSwitch,
    MarkdownEditorComponent,
    DragDropModule,
    Divider,
    ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './spellcasting.component.html',
  styleUrl: './spellcasting.component.scss',
})
export class SpellcastingComponent {
  cs = inject(CharacterService);
  private confirmationService = inject(ConfirmationService);
  spellcastingClasses = SPELLCASTING_CLASSES;
  spellLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  newSpellLevel = 0;
  showPreparedOnly = false;
  editingField = signal<string | null>(null);
  editing = signal(false);
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

  onAccordionChange(value: string | number | string[] | number[] | null | undefined): void {
    if (Array.isArray(value)) {
      this.expandedPanels.set(value.map(v => String(v)));
    } else if (value != null) {
      this.expandedPanels.set([String(value)]);
    } else {
      this.expandedPanels.set([]);
    }
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

  confirmRemoveSpell(spell: Spell): void {
    this.confirmationService.confirm({
      message: `„${spell.name || 'Unbenannt'}" wirklich löschen?`,
      header: 'Zauber löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.removeSpell(spell),
    });
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
    spell.prepared = prepared;
    this.updateSpells();
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
