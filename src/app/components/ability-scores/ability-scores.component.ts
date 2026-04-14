import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutside } from 'ngxtension/click-outside';
import { Checkbox } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { Tooltip } from 'primeng/tooltip';
import { ABILITY_LABELS } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';


@Component({
  selector: 'app-ability-scores',
  imports: [FormsModule, InputNumber, Checkbox, Tooltip, ClickOutside],
  templateUrl: './ability-scores.component.html',
  styleUrl: './ability-scores.component.scss',
})
export class AbilityScoresComponent {
  cs = inject(CharacterService);
  abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  editingAbility = signal<string | null>(null);
  editingProficiency = signal(false);

  getLabel(ability: string): string {
    return ABILITY_LABELS[ability] || ability;
  }

  getAbilityBase(ability: string): number {
    const char = this.cs.character();
    return (char.abilities as Record<string, { base: number }>)[ability]?.base ?? 10;
  }

  updateAbility(ability: string, value: number | null): void {
    const char = this.cs.character();
    const abilities = { ...char.abilities, [ability]: { base: value ?? 10 } };
    this.cs.update({ abilities });
  }

  updateProficiency(value: number | null): void {
    this.cs.update({ proficiencyBonusOverride: value });
  }
}
