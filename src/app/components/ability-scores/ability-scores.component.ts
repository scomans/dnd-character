import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ABILITY_LABELS } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';
import { NumberInputComponent } from '../number-input/number-input.component';
import { Tag } from '@openng/optimus-ui/tag';

@Component({
  selector: 'app-ability-scores',
  templateUrl: './ability-scores.component.html',
  styleUrl: './ability-scores.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NumberInputComponent, Tag],
})
export class AbilityScoresComponent {
  cs = inject(CharacterService);
  protected readonly isEditMode = inject(EditModeService).isEditMode;
  abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  protected readonly fasMinus = faMinus;
  protected readonly fasPlus = faPlus;

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
}
