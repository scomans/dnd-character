import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutside } from 'ngxtension/click-outside';
import { Checkbox } from 'primeng/checkbox';
import { Fieldset } from 'primeng/fieldset';
import { InputGroup } from 'primeng/inputgroup';
import { InputNumber } from 'primeng/inputnumber';
import { Tooltip } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import { CountersComponent } from '../counters/counters.component';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Select } from 'primeng/select';
import { DICE_TYPES } from '../../models/character.model';

@Component({
  selector: 'app-combat',
  templateUrl: './combat.component.html',
  styleUrl: './combat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Checkbox,
    ClickOutside,
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
  protected readonly editingAC = signal(false);
  protected readonly editingSpeed = signal(false);
  protected readonly editingMaxHP = signal(false);
  protected readonly editingMaxHitDice = signal(false);
  protected readonly fasPlus = faPlus;
  protected readonly fasMinus = faMinus;
  protected readonly diceTypes = DICE_TYPES;

  updateDeathSaves(type: 'successes' | 'failures', index: number, checked: boolean): void {
    const char = this.cs.character();
    const deathSaves = { ...char.deathSaves };
    deathSaves[type] = checked ? index + 1 : index;
    this.cs.update({ deathSaves });
  }
}
