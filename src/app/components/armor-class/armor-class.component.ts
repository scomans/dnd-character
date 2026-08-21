import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-armor-class',
  templateUrl: './armor-class.component.html',
  styleUrl: './armor-class.component.scss',
  imports: [Checkbox, FormsModule, InputNumber, Tooltip],
})
export class ArmorClassComponent {
  protected readonly cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);

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
