import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { Fieldset } from 'primeng/fieldset';
import { InputGroup } from 'primeng/inputgroup';
import { InputNumber } from 'primeng/inputnumber';
import { Tooltip } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import { CountersComponent } from '../counters/counters.component';
import { faMinus, faPlus, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { DICE_TYPES } from '../../models/character.model';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-combat',
  templateUrl: './combat.component.html',
  styleUrl: './combat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    Checkbox,
    CountersComponent,
    FaIconComponent,
    Fieldset,
    FormsModule,
    InputGroup,
    InputNumber,
    Select,
    Tooltip,
  ],
})
export class CombatComponent {
  protected readonly cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);
  protected readonly fasPlus = faPlus;
  protected readonly fasMinus = faMinus;
  protected readonly fasRefresh = faRefresh;
  protected readonly diceTypes = DICE_TYPES;

  updateDeathSaves(type: 'successes' | 'failures', index: number, checked: boolean): void {
    const char = this.cs.character();
    const deathSaves = { ...char.deathSaves };
    deathSaves[type] = checked ? index + 1 : index;
    this.cs.update({ deathSaves });
  }

  resetHitDice(): void {
    this.cs.update({ hitDiceCurrent: this.cs.character().hitDiceMax });
  }

  getArmorClassTooltip(): string {
    const char = this.cs.character();
    const dexMod = this.cs.getAbilityModifier('dex');
    let tooltip = `Rüstungswert (${char.armorValue}) + GES-Mod (${dexMod})`;
    if (char.hasShield) {
      tooltip += ' + Schild (2)';
    }
    tooltip += ` = ${this.cs.getComputedArmorClass()}`;
    return tooltip;
  }
}
