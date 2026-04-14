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
  imports: [FormsModule, CheckboxModule, ButtonModule, FieldsetModule, TooltipModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
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
