import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutside } from 'ngxtension/click-outside';
import { Checkbox } from 'primeng/checkbox';
import { Fieldset } from 'primeng/fieldset';
import { InputGroup } from 'primeng/inputgroup';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import { CountersComponent } from '../counters/counters.component';


@Component({
  selector: 'app-combat',
  imports: [
    FormsModule,
    InputNumber,
    InputGroup,
    Checkbox,
    Fieldset,
    Tooltip,
    ClickOutside,
    InputText,
    CountersComponent,
  ],
  templateUrl: './combat.component.html',
  styleUrl: './combat.component.scss',
})
export class CombatComponent {
  cs = inject(CharacterService);
  editingAC = signal(false);
  editingSpeed = signal(false);
  editingMaxHP = signal(false);

  updateDeathSaves(type: 'successes' | 'failures', index: number, checked: boolean): void {
    const char = this.cs.character();
    const deathSaves = { ...char.deathSaves };
    deathSaves[type] = checked ? index + 1 : index;
    this.cs.update({ deathSaves });
  }
}
