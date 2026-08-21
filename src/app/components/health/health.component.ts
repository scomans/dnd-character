import { Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBed,
  faBurst,
  faCampground,
  faHeart,
  faHeartCirclePlus,
  faHourglass,
  faSkull,
} from '@fortawesome/free-solid-svg-icons';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { Select } from '@openng/optimus-ui/select';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { DICE_TYPES } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';
import { NumberInputComponent } from '../number-input/number-input.component';
import { Tag } from '@openng/optimus-ui/tag';
import { ButtonGroup } from '@openng/optimus-ui/buttongroup';
import { OverlayBadge } from '@openng/optimus-ui/overlaybadge';
import { Menu } from '@openng/optimus-ui/menu';
import { MenuItem } from '@openng/optimus-ui/api';
import { Dialog } from '@openng/optimus-ui/dialog';
import { InputNumber } from '@openng/optimus-ui/inputnumber';

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrl: './health.component.scss',
  imports: [
    ButtonDirective,
    ButtonGroup,
    Checkbox,
    Dialog,
    FaIconComponent,
    Fieldset,
    FormsModule,
    InputNumber,
    Menu,
    NumberInputComponent,
    OverlayBadge,
    Select,
    Tag,
    Tooltip,
  ],
})
export class HealthComponent {
  protected readonly cs = inject(CharacterService);
  protected readonly isEditMode = inject(EditModeService).isEditMode;
  protected readonly fasBed = faBed;
  protected readonly fasHeart = faHeart;
  protected readonly fasHeartCirclePlus = faHeartCirclePlus;
  protected readonly fasBurst = faBurst;
  protected readonly fasSkull = faSkull;
  protected readonly diceTypes = DICE_TYPES;
  protected readonly amountButtons = [1, 5, 10];

  protected showDamageDialog = model(false);
  protected damageAmount = model(1);
  protected showHealDialog = model<false | 'heal' | true>(false);
  protected healAmount = model(1);
  protected readonly restMenuItems = computed(
    () =>
      [
        {
          label: `Trefferwürfel: ${this.cs.character().hitDice}`,
        },
        {
          label: 'Rasten',
          items: [
            {
              label: 'Lange Rast (8h)',
              faIcon: faCampground,
              command: () => this.longRest(),
            },
            {
              label: 'Kurze Rast (1h)',
              faIcon: faHourglass,
              danger: this.cs.character().hitDiceCurrent <= 0,
              command: () => this.shortRest(),
            },
          ],
        },
      ] satisfies MenuItem[],
  );

  protected title = computed(() => {
    if (this.isEditMode()) {
      return 'Max. Trefferpunkte';
    } else if (this.cs.character().hitPointsCurrent <= 0) {
      return 'Todesrettung';
    } else {
      return 'Trefferpunkte';
    }
  });

  updateDeathSaves(type: 'successes' | 'failures', index: number, checked: boolean): void {
    const char = this.cs.character();
    const deathSaves = { ...char.deathSaves };
    deathSaves[type] = checked ? index + 1 : index;
    this.cs.update({ deathSaves });
  }

  longRest(): void {
    this.cs.update({
      hitDiceCurrent: this.cs.character().level,
      hitPointsCurrent: this.cs.character().hitPointsMax,
    });
  }

  shortRest() {
    this.cs.update({ hitDiceCurrent: Math.max(this.cs.character().hitDiceCurrent - 1, 0) });
    this.showHealDialog.set('heal');
  }

  adjustDamageAmount(amount: number): void {
    this.damageAmount.update((value) => Math.max(value + amount, 1));
  }

  damageCharacter(amount: number): void {
    const healthDamage = amount - this.cs.character().hitPointsTemp;
    this.cs.update({
      hitPointsTemp: Math.max(this.cs.character().hitPointsTemp - amount, 0),
      hitPointsCurrent: Math.max(this.cs.character().hitPointsCurrent - healthDamage, 0),
    });
    this.damageAmount.set(1);
    this.showDamageDialog.set(false);
  }

  adjustHealAmount(amount: number): void {
    this.healAmount.update((value) => Math.max(value + amount, 1));
  }

  healCharacter(amount: number, temp: boolean) {
    if (temp) {
      this.cs.update({
        hitPointsTemp: Math.max(amount, 0),
      });
    } else {
      this.cs.update({
        hitPointsCurrent: Math.min(
          this.cs.character().hitPointsCurrent + amount,
          this.cs.character().hitPointsMax,
        ),
      });
    }
    this.healAmount.set(1);
    this.showHealDialog.set(false);
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
