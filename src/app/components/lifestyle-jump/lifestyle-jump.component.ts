import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { Select } from '@openng/optimus-ui/select';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { LIFESTYLES } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-lifestyle-jump',
  templateUrl: './lifestyle-jump.component.html',
  styleUrl: './lifestyle-jump.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, Fieldset, InputText, Select, Tooltip],
})
export class LifestyleJumpComponent {
  cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);
  lifestyles = LIFESTYLES;

  private readonly FT_TO_M = 0.3;

  getLifestyleCost(): string {
    const lifestyle = this.cs.character().lifestyle;
    const found = this.lifestyles.find((l) => l.value === lifestyle);
    return found?.cost ?? '-';
  }

  getLifestyleLabel(): string {
    const lifestyle = this.cs.character().lifestyle;
    const found = this.lifestyles.find((l) => l.value === lifestyle);
    return found?.label ?? lifestyle ?? '';
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
