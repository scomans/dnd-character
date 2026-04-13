import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { SKILL_LABELS, SKILL_ABILITY_MAP, ABILITY_SHORT_LABELS, ABILITY_LABELS } from '../../models/character.model';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [FormsModule, CheckboxModule, ButtonModule, FieldsetModule, TooltipModule],
  template: `
    <p-fieldset styleClass="relative">
      <ng-template pTemplate="header">
        <div class="flex items-center gap-2 w-full">
          <span class="font-bold">Fertigkeiten</span>
          <p-button
            [icon]="editing() ? 'pi pi-check' : 'pi pi-pencil'"
            [rounded]="true"
            [text]="true"
            size="small"
            (onClick)="editing.set(!editing())"
            [pTooltip]="editing() ? 'Bearbeitung beenden' : 'Bearbeiten'"
            tooltipPosition="top"
          />
        </div>
      </ng-template>
      <div class="space-y-0.5">
        @for (skill of skillKeys; track skill) {
          <div class="flex items-center gap-1 text-sm">
            <p-checkbox
              [ngModel]="isExpertise(skill)"
              (ngModelChange)="toggleExpertise(skill, $event)"
              [binary]="true"
              styleClass="scale-75"
              [disabled]="!editing()"
            />
            <p-checkbox
              [ngModel]="isProficient(skill)"
              (ngModelChange)="toggleProficiency(skill, $event)"
              [binary]="true"
              [disabled]="!editing()"
            />
            <span class="font-bold w-6 text-right text-slate-700 dark:text-slate-300">
              {{ cs.getSkillModifier(skill) >= 0 ? '+' : '' }}{{ cs.getSkillModifier(skill) }}
            </span>
            <span class="text-xs">{{ getLabel(skill) }} (<span class="font-bold" [pTooltip]="getAbilityFull(skill)" tooltipPosition="right">{{ getAbilityShort(skill) }}</span>)</span>
          </div>
        }
      </div>

      <!-- Passive Perception -->
      <div class="mt-2 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 pt-2">
        <span class="text-lg font-bold text-slate-700 dark:text-slate-300">{{ cs.getPassivePerception() }}</span>
        <div class="text-[0.6rem]">
          <div class="font-bold text-gray-600 dark:text-gray-400">Passive Weisheit (Wahrnehmung)</div>
          <div class="text-gray-400 dark:text-gray-500">[10 + Wahrnehmung]</div>
        </div>
      </div>
    </p-fieldset>
  `,
})
export class SkillsComponent {
  cs = inject(CharacterService);
  editing = signal(false);

  skillKeys = Object.keys(SKILL_LABELS).sort((a, b) =>
    SKILL_LABELS[a].localeCompare(SKILL_LABELS[b], 'de')
  );

  getLabel(skill: string): string {
    return SKILL_LABELS[skill] || skill;
  }

  getAbilityShort(skill: string): string {
    const ability = SKILL_ABILITY_MAP[skill];
    return ABILITY_SHORT_LABELS[ability] || ability;
  }

  getAbilityFull(skill: string): string {
    const ability = SKILL_ABILITY_MAP[skill];
    return ABILITY_LABELS[ability] || ability;
  }

  isProficient(skill: string): boolean {
    const char = this.cs.character();
    return (char.skills as Record<string, { proficient: boolean; expertise: boolean }>)[skill]?.proficient ?? false;
  }

  isExpertise(skill: string): boolean {
    const char = this.cs.character();
    return (char.skills as Record<string, { proficient: boolean; expertise: boolean }>)[skill]?.expertise ?? false;
  }

  toggleProficiency(skill: string, value: boolean): void {
    const char = this.cs.character();
    const current = (char.skills as Record<string, { proficient: boolean; expertise: boolean }>)[skill] ?? { proficient: false, expertise: false };
    const skills = { ...char.skills, [skill]: { ...current, proficient: value, expertise: value ? current.expertise : false } };
    this.cs.update({ skills });
  }

  toggleExpertise(skill: string, value: boolean): void {
    const char = this.cs.character();
    const current = (char.skills as Record<string, { proficient: boolean; expertise: boolean }>)[skill] ?? { proficient: false, expertise: false };
    const skills = { ...char.skills, [skill]: { ...current, expertise: value, proficient: value ? true : current.proficient } };
    this.cs.update({ skills });
  }
}
