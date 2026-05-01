import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faDownLeftAndUpRightToCenter,
  faPlus,
  faTrash,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Divider } from 'primeng/divider';
import { Fieldset } from 'primeng/fieldset';
import { IftaLabel } from 'primeng/iftalabel';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';
import { ABILITY_LABELS, Spell, SPELLCASTING_CLASSES } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-spellcasting',
  templateUrl: './spellcasting.component.html',
  styleUrl: './spellcasting.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    Button,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    Checkbox,
    ConfirmDialog,
    Divider,
    FaIconComponent,
    Fieldset,
    FormsModule,
    IftaLabel,
    InputNumber,
    InputText,
    MarkdownEditorComponent,
    Select,
    ToggleSwitch,
    Tooltip,
  ],
  providers: [ConfirmationService],
})
export class SpellcastingComponent {
  protected readonly cs = inject(CharacterService);
  private readonly confirmationService = inject(ConfirmationService);
  protected readonly editMode = inject(EditModeService);
  protected readonly fasBars = faBars;
  protected readonly fasDownLeftAndUpRightToCenter = faDownLeftAndUpRightToCenter;
  protected readonly fasPlus = faPlus;
  protected readonly fasTrash = faTrash;
  protected readonly fasUpRightAndDownLeftFromCenter = faUpRightAndDownLeftFromCenter;
  protected spellcastingClasses = SPELLCASTING_CLASSES;
  protected newSpellLevel = 0;
  protected showPreparedOnly = false;
  protected readonly expandedPanels = signal<string[]>([]);

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
    return this.spellcastingClasses.find((c) => c.value === value)?.label ?? value;
  }

  getAbilityLabel(ability: string): string {
    return ABILITY_LABELS[ability] ?? ability;
  }

  get groupedSpellLevels() {
    const spells = this.cs.character().spells;
    const allLevels = [...new Set(spells.map((s) => s.level))].sort((a, b) => a - b);
    if (this.showPreparedOnly) {
      return allLevels
        .filter((level) => spells.some((s) => s.level === level && (s.prepared || level === 0)))
        .map((level) => ({ level }));
    }
    return allLevels.map((level) => ({ level }));
  }

  getSpellsForLevel(level: number): Spell[] {
    return this.cs.character().spells.filter((s) => s.level === level);
  }

  getFilteredSpellsForLevel(level: number): Spell[] {
    const spells = this.getSpellsForLevel(level);
    if (this.showPreparedOnly && level > 0) {
      return spells.filter((s) => s.prepared);
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
      this.expandedPanels.set(value.map((v) => String(v)));
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
    const newUsed = index < currentUsed ? index : index + 1;
    this.updateSlotUsed(level, newUsed);
  }

  onSpellcastingClassChange(value: string): void {
    const found = this.spellcastingClasses.find((c) => c.value === value);
    const updates: Partial<any> = { spellcastingClass: value };
    if (found) {
      updates['spellcastingAbility'] = found.ability;
    }
    this.cs.update(updates);
  }

  onSpellAbilityChange(value: string): void {
    this.cs.update({ spellcastingAbility: value });
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
    const spellsOfLevel = char.spells.filter((s) => s.level === level);

    if (event.previousIndex === event.currentIndex) return;

    // Reorder within this level group
    moveItemInArray(spellsOfLevel, event.previousIndex, event.currentIndex);

    // Compute insertion index before filtering
    const firstIndex = char.spells.findIndex((s) => s.level === level);
    const newSpells = char.spells.filter((s) => s.level !== level);
    newSpells.splice(firstIndex >= 0 ? firstIndex : newSpells.length, 0, ...spellsOfLevel);

    this.cs.update({ spells: newSpells });
  }
}
