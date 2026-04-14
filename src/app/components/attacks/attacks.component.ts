import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Fieldset } from 'primeng/fieldset';
import { Tooltip } from 'primeng/tooltip';
import { InputGroup } from 'primeng/inputgroup';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { Attack, DAMAGE_TYPES, ABILITY_SHORT_LABELS, WEAPON_MASTERIES } from '../../models/character.model';

@Component({
  selector: 'app-attacks',
  imports: [
    FormsModule,
    InputText,
    InputNumber,
    Checkbox,
    Button,
    Select,
    Fieldset,
    Tooltip,
    InputGroup,
    MarkdownEditorComponent,
    ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './attacks.component.html',
  styleUrl: './attacks.component.scss'
})
export class AttacksComponent {
  cs = inject(CharacterService);
  private confirmationService = inject(ConfirmationService);
  editing = signal(false);

  damageTypes = DAMAGE_TYPES;
  masteries = WEAPON_MASTERIES;

  abilityOptions = [
    { label: 'Stärke', value: 'str' },
    { label: 'Geschicklichkeit', value: 'dex' },
    { label: 'Konstitution', value: 'con' },
    { label: 'Intelligenz', value: 'int' },
    { label: 'Weisheit', value: 'wis' },
    { label: 'Charisma', value: 'cha' },
  ];

  getShortLabel(value: string | undefined): string {
    return value ? (ABILITY_SHORT_LABELS[value] ?? value) : '';
  }

  parseRange(range: string): number {
    const num = parseFloat(String(range).replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }

  addAttack(): void {
    const char = this.cs.character();
    const attacks = [...char.attacks, {
      name: '',
      proficient: true,
      attribute: 'str',
      range: '1.5',
      damageDice: '1W8',
      damageType: 'Hieb',
      description: '',
      mastery: '',
      magicBonus: 0,
    }];
    this.cs.update({ attacks });
  }

  confirmRemoveAttack(index: number, name: string): void {
    this.confirmationService.confirm({
      message: `„${name || 'Unbenannt'}" wirklich löschen?`,
      header: 'Angriff löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.removeAttack(index),
    });
  }

  removeAttack(index: number): void {
    const char = this.cs.character();
    const attacks = char.attacks.filter((_, i) => i !== index);
    this.cs.update({ attacks });
  }

  updateAttacks(): void {
    const char = this.cs.character();
    this.cs.update({ attacks: [...char.attacks] });
  }

  updateAttackRange(index: number, value: number | null): void {
    const char = this.cs.character();
    const attacks = [...char.attacks];
    attacks[index] = { ...attacks[index], range: String(value ?? 0) };
    this.cs.update({ attacks });
  }

  updateAttackDescription(index: number, desc: string): void {
    const char = this.cs.character();
    const attacks = [...char.attacks];
    attacks[index] = { ...attacks[index], description: desc };
    this.cs.update({ attacks });
  }
}
