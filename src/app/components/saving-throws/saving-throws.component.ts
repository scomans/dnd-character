import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { ABILITY_SHORT_LABELS } from '../../models/character.model';

@Component({
  selector: 'app-saving-throws',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, FieldsetModule],
  template: `
    <p-fieldset legend="Rettungswürfe">
      <div class="space-y-0.5">
        @for (ability of abilities; track ability) {
          <div class="flex items-center gap-1.5 text-sm">
            <p-checkbox
              [ngModel]="isProficient(ability)"
              (ngModelChange)="toggleProficiency(ability, $event)"
              [binary]="true"
            />
            <span class="font-bold w-8 text-right text-amber-900">
              {{ cs.getSavingThrowModifier(ability) >= 0 ? '+' : '' }}{{ cs.getSavingThrowModifier(ability) }}
            </span>
            <span class="text-xs">{{ getLabel(ability) }} (<span class="font-bold">{{ getShort(ability) }}</span>)</span>
          </div>
        }
      </div>
    </p-fieldset>
  `,
})
export class SavingThrowsComponent {
  cs = inject(CharacterService);
  abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  private abilityLabels: Record<string, string> = {
    str: 'Stärke',
    dex: 'Geschicklichkeit',
    con: 'Konstitution',
    int: 'Intelligenz',
    wis: 'Weisheit',
    cha: 'Charisma',
  };

  getLabel(ability: string): string {
    return this.abilityLabels[ability] || ability;
  }

  getShort(ability: string): string {
    return ABILITY_SHORT_LABELS[ability] || ability;
  }

  isProficient(ability: string): boolean {
    const char = this.cs.character();
    return (char.savingThrows as Record<string, { proficient: boolean }>)[ability]?.proficient ?? false;
  }

  toggleProficiency(ability: string, value: boolean): void {
    const char = this.cs.character();
    const savingThrows = { ...char.savingThrows, [ability]: { proficient: value } };
    this.cs.update({ savingThrows });
  }
}
