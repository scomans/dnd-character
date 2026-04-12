import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ABILITY_LABELS } from '../../models/character.model';
import { ClickOutside } from 'ngxtension/click-outside';

@Component({
  selector: 'app-ability-scores',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumberModule, CheckboxModule, ClickOutside],
  template: `
    <div class="space-y-2">
      <!-- Inspiration -->
      <div class="flex items-center gap-2 bg-white border border-amber-800 rounded-lg p-2">
        <p-checkbox
          [ngModel]="cs.character().inspiration"
          (ngModelChange)="cs.update({ inspiration: $event })"
          [binary]="true"
        />
        <span class="text-xs font-bold uppercase">Inspiration</span>
      </div>

      <!-- Proficiency Bonus (click-to-edit) -->
      <div class="flex items-center gap-2 bg-white border border-amber-800 rounded-lg p-2 overflow-hidden">
        @if (editingProficiency()) {
          <p-inputnumber
            [ngModel]="cs.character().proficiencyBonusOverride ?? cs.getProficiencyBonus()"
            (ngModelChange)="updateProficiency($event)"
            [min]="1"
            [max]="10"
            [showButtons]="false"
            [inputStyle]="{ width: '2rem', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold' }"
            (clickOutside)="editingProficiency.set(false)"
          />
        } @else {
          <span
            class="text-xl font-bold text-amber-900 w-10 text-center cursor-pointer hover:text-amber-700"
            (click)="editingProficiency.set(true)"
          >+{{ cs.getProficiencyBonus() }}</span>
        }
        <span class="text-xs font-bold uppercase">Übungsbonus</span>
      </div>

      <!-- Ability Scores (click-to-edit) -->
      @for (ability of abilities; track ability) {
        <div class="bg-white border-2 border-amber-800 rounded-lg p-2 flex flex-col items-center">
          <span class="text-[0.6rem] font-bold uppercase text-gray-600">{{ getLabel(ability) }}</span>
          <span class="text-3xl font-bold text-amber-900">
            {{ cs.getAbilityModifier(ability) >= 0 ? '+' : '' }}{{ cs.getAbilityModifier(ability) }}
          </span>
          <div class="mt-1">
            @if (editingAbility() === ability) {
              <p-inputnumber
                [ngModel]="getAbilityBase(ability)"
                (ngModelChange)="updateAbility(ability, $event)"
                [min]="1"
                [max]="30"
                [showButtons]="true"
                [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '0.85rem' }"
                (clickOutside)="editingAbility.set(null)"
              />
            } @else {
              <span
                class="text-sm font-medium text-gray-700 cursor-pointer hover:text-amber-700 border border-transparent hover:border-amber-600/30 rounded px-2 py-0.5"
                (click)="editingAbility.set(ability)"
              >{{ getAbilityBase(ability) }}</span>
            }
          </div>
        </div>
      }
    </div>
  `,
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
