import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import {
  ABILITY_LABELS,
  ABILITY_SHORT_LABELS,
  SKILL_ABILITY_MAP,
  SKILL_LABELS,
} from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Checkbox, Fieldset, Tooltip],
})
export class SkillsComponent {
  cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);

  skillKeys = Object.keys(SKILL_LABELS).sort((a, b) =>
    SKILL_LABELS[a].localeCompare(SKILL_LABELS[b], 'de'),
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
    return (
      (char.skills as Record<string, { proficient: boolean; expertise: boolean }>)[skill]
        ?.proficient ?? false
    );
  }

  isExpertise(skill: string): boolean {
    const char = this.cs.character();
    return (
      (char.skills as Record<string, { proficient: boolean; expertise: boolean }>)[skill]
        ?.expertise ?? false
    );
  }

  toggleProficiency(skill: string, value: boolean): void {
    const char = this.cs.character();
    const current = (char.skills as Record<string, { proficient: boolean; expertise: boolean }>)[
      skill
    ] ?? { proficient: false, expertise: false };
    const skills = {
      ...char.skills,
      [skill]: { ...current, proficient: value, expertise: value ? current.expertise : false },
    };
    this.cs.update({ skills });
  }

  toggleExpertise(skill: string, value: boolean): void {
    const char = this.cs.character();
    const current = (char.skills as Record<string, { proficient: boolean; expertise: boolean }>)[
      skill
    ] ?? { proficient: false, expertise: false };
    const skills = {
      ...char.skills,
      [skill]: { ...current, expertise: value, proficient: value ? true : current.proficient },
    };
    this.cs.update({ skills });
  }
}
