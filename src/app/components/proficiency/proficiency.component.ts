import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';
import { NumberInputComponent } from '../number-input/number-input.component';

@Component({
  selector: 'app-proficiency',
  templateUrl: './proficiency.component.html',
  styleUrl: './proficiency.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NumberInputComponent, Tooltip],
})
export class ProficiencyComponent {
  cs = inject(CharacterService);
  protected readonly isEditMode = inject(EditModeService).isEditMode;

  updateProficiency(value: number | null): void {
    this.cs.update({ proficiencyBonusOverride: value });
  }
}
