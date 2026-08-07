import { Component, effect, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrl: './number-input.component.scss',
  imports: [ButtonDirective, FaIconComponent, FormsModule, InputGroup, InputGroupAddon, InputText],
})
export class NumberInputComponent {
  step = input<number>(1);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
  readonly = input<boolean>(true);
  value = model<number>(0);

  protected readonly fasPlus = faPlus;
  protected readonly fasMinus = faMinus;

  constructor() {
    effect(() => {
      const min = this.min();
      const max = this.max();
      const value = this.value();
      if (value == null) {
        return;
      }
      if (min !== undefined && value < min) {
        this.value.set(min);
      } else if (max !== undefined && value > max) {
        this.value.set(max);
      }
    });
  }

  protected update(step: number) {
    this.value.update((v) => {
      const newValue = v + step;
      const min = this.min();
      if (min !== undefined && newValue < min) {
        return min;
      }
      const max = this.max();
      if (max !== undefined && newValue > max) {
        return max;
      }
      return newValue;
    });
  }
}
