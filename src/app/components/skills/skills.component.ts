import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { CheckboxModule } from 'primeng/checkbox';
import { SKILL_LABELS, SKILL_ABILITY_MAP, ABILITY_SHORT_LABELS } from '../../models/character.model';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule],
  template: `
    <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
      <div class="space-y-0.5">
        @for (skill of skillKeys; track skill) {
          <div class="flex items-center gap-1 text-sm">
            <p-checkbox
              [ngModel]="isExpertise(skill)"
              (ngModelChange)="toggleExpertise(skill, $event)"
              [binary]="true"
              styleClass="scale-75"
            />
            <p-checkbox
              [ngModel]="isProficient(skill)"
              (ngModelChange)="toggleProficiency(skill, $event)"
              [binary]="true"
            />
            <span class="font-bold w-8 text-right text-amber-900">
              {{ cs.getSkillModifier(skill) >= 0 ? '+' : '' }}{{ cs.getSkillModifier(skill) }}
            </span>
            <span class="text-xs">{{ getLabel(skill) }} ({{ getAbilityShort(skill) }})</span>
          </div>
        }
      </div>
      <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-2 border-t border-gray-200 pt-1">
        Fertigkeiten
      </div>

      <!-- Passive Perception -->
      <div class="mt-2 flex items-center gap-2 border-t border-gray-200 pt-2">
        <span class="text-lg font-bold text-amber-900">{{ cs.getPassivePerception() }}</span>
        <div class="text-[0.6rem]">
          <div class="font-bold uppercase text-gray-600">Passive Weisheit (Wahrnehmung)</div>
          <div class="text-gray-400">[10 + Wahrnehmung]</div>
        </div>
      </div>
    </div>
  `,
})
export class SkillsComponent {
  cs = inject(CharacterService);

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
