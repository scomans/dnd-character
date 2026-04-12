import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ABILITY_SHORT_LABELS } from '../../models/character.model';

@Component({
  selector: 'app-saving-throws',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule],
  template: `
    <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
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
            <span class="text-xs">{{ getLabel(ability) }} ({{ getShort(ability) }})</span>
          </div>
        }
      </div>
      <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-2 border-t border-gray-200 pt-1">
        Rettungswürfe
      </div>
    </div>
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
