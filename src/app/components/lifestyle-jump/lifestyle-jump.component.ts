import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Fieldset } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { LIFESTYLES } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';


@Component({
  selector: 'app-lifestyle-jump',
  standalone: true,
  imports: [DecimalPipe, FormsModule, Fieldset, Select, Tooltip],
  template: `
    <div class="flex flex-wrap gap-2 flex-1">
      <p-fieldset class="flex-1" legend="Lebensstil">
        <div class="flex flex-wrap items-center gap-2">
          <p-select
            [ngModel]="cs.character().lifestyle"
            (ngModelChange)="cs.update({ lifestyle: $event })"
            [options]="lifestyles"
            optionLabel="label"
            optionValue="value"
            [style]="{ width: '100%', fontSize: '0.8rem' }"
            appendTo="body"
            class="flex-1"
          />
          <div class="flex-1 text-right">
            <span class="text-xs text-gray-500 dark:text-gray-400">Tägliche Kosten</span>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ getLifestyleCost() }}</div>
          </div>
        </div>
      </p-fieldset>

      <p-fieldset class="flex-1" legend="Hoch- & Weitsprung">
        <div class="text-xs">
          <table class="w-full">
            <thead>
              <tr>
                <th></th>
                <th class="text-center text-[0.6rem] text-gray-500 dark:text-gray-400">Ohne Anlauf</th>
                <th class="text-center text-[0.6rem] text-gray-500 dark:text-gray-400">Mit Anlauf</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-[0.65rem] font-bold">Hoch</td>
                <td class="text-center">
                  <span class="font-bold text-slate-700 dark:text-slate-300" pTooltip="(Stärke-Mod + 3) / 2 ft → m" tooltipPosition="top">
                    {{ getHighJumpStanding() | number:'1.2-2' }} m
                  </span>
                </td>
                <td class="text-center">
                  <span class="font-bold text-slate-700 dark:text-slate-300" pTooltip="Stärke-Mod + 3 ft → m" tooltipPosition="top">
                    {{ getHighJumpRunning() | number:'1.2-2' }} m
                  </span>
                </td>
              </tr>
              <tr>
                <td class="text-[0.65rem] font-bold">Weit</td>
                <td class="text-center">
                  <span class="font-bold text-slate-700 dark:text-slate-300" pTooltip="Stärke-Wert / 2 ft → m" tooltipPosition="top">
                    {{ getLongJumpStanding() | number:'1.2-2' }} m
                  </span>
                </td>
                <td class="text-center">
                  <span class="font-bold text-slate-700 dark:text-slate-300" pTooltip="Stärke-Wert ft → m" tooltipPosition="top">
                    {{ getLongJumpRunning() | number:'1.2-2' }} m
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </p-fieldset>
    </div>
  `,
})
export class LifestyleJumpComponent {
  cs = inject(CharacterService);
  lifestyles = LIFESTYLES;

  private readonly FT_TO_M = 0.3;

  getLifestyleCost(): string {
    const lifestyle = this.cs.character().lifestyle;
    const found = this.lifestyles.find(l => l.value === lifestyle);
    return found?.cost ?? '-';
  }

  getHighJumpRunning(): number {
    const strMod = this.cs.getAbilityModifier('str');
    return (3 + strMod) * this.FT_TO_M;
  }

  getHighJumpStanding(): number {
    return this.getHighJumpRunning() / 2;
  }

  getLongJumpRunning(): number {
    const strScore = this.cs.character().abilities.str.base;
    return strScore * this.FT_TO_M;
  }

  getLongJumpStanding(): number {
    return this.getLongJumpRunning() / 2;
  }
}
