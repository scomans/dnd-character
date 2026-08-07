import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBed, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@openng/optimus-ui/button';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { Select } from '@openng/optimus-ui/select';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { DICE_TYPES } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';
import { CountersComponent } from '../counters/counters.component';
import { NumberInputComponent } from '../number-input/number-input.component';

@Component({
  selector: 'app-combat',
  templateUrl: './combat.component.html',
  styleUrl: './combat.component.scss',
  imports: [
    Button,
    Checkbox,
    CountersComponent,
    FaIconComponent,
    Fieldset,
    FormsModule,
    InputGroup,
    InputNumber,
    NumberInputComponent,
    Select,
    Tooltip,
  ],
})
export class CombatComponent {
  protected readonly cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);
  protected readonly fasBed = faBed;
  protected readonly fasPlus = faPlus;
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
