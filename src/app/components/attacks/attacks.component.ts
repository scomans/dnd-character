import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { ConfirmDialog } from '@openng/optimus-ui/confirmdialog';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { ABILITY_SHORT_LABELS, DAMAGE_TYPES, WEAPON_MASTERIES } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-attacks',
  templateUrl: './attacks.component.html',
  styleUrl: './attacks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    Checkbox,
    ConfirmDialog,
    FaIconComponent,
    Fieldset,
    FormsModule,
    InputGroup,
    InputNumber,
    InputText,
    MarkdownEditorComponent,
    Select,
    Tooltip,
  ],
  providers: [ConfirmationService],
})
export class AttacksComponent {
  cs = inject(CharacterService);
  private confirmationService = inject(ConfirmationService);
  protected readonly editMode = inject(EditModeService);

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

  public readonly fasCheck = faCheck;
  public readonly fasPlus = faPlus;
  public readonly fasTrash = faTrash;

  getShortLabel(value: string | undefined): string {
    return value ? (ABILITY_SHORT_LABELS[value] ?? value) : '';
  }

  parseRange(range: string): number {
    const num = parseFloat(String(range).replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }

  addAttack(): void {
    const char = this.cs.character();
    const attacks = [
      ...char.attacks,
      {
        name: '',
        proficient: true,
        attribute: 'str',
        range: '1.5',
        damageDice: '1W8',
        damageType: 'Hieb',
        description: '',
        mastery: '',
        magicBonus: 0,
      },
    ];
    this.cs.update({ attacks });
  }

  confirmRemoveAttack(index: number, name: string): void {
    this.confirmationService.confirm({
      message: `„${name || 'Unbenannt'}" wirklich löschen?`,
      header: 'Angriff löschen',
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
