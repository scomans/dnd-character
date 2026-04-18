import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Fieldset } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { LIFESTYLES } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-lifestyle-jump',
  templateUrl: './lifestyle-jump.component.html',
  styleUrl: './lifestyle-jump.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, Fieldset, Select, Tooltip],
})
export class LifestyleJumpComponent {
  cs = inject(CharacterService);
  lifestyles = LIFESTYLES;

  private readonly FT_TO_M = 0.3;

  getLifestyleCost(): string {
    const lifestyle = this.cs.character().lifestyle;
    const found = this.lifestyles.find((l) => l.value === lifestyle);
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
