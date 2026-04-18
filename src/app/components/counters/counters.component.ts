import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faMinus as fasMinus,
  faPlus as fasPlus,
  faRotateRight as fasRefresh,
  faTrash as fasTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ClickOutside } from 'ngxtension/click-outside';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Fieldset } from 'primeng/fieldset';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Counter } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-counters',
  templateUrl: './counters.component.html',
  styleUrl: './counters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    ClickOutside,
    ConfirmDialog,
    FaIconComponent,
    Fieldset,
    FormsModule,
    InputNumber,
    InputText,
    Tooltip,
  ],
  providers: [ConfirmationService],
})
export class CountersComponent {
  cs = inject(CharacterService);
  private confirmationService = inject(ConfirmationService);
  editingIndex = signal(-1);

  protected readonly fasMinus = fasMinus;
  protected readonly fasPlus = fasPlus;
  protected readonly fasRefresh = fasRefresh;
  protected readonly fasTrash = fasTrash;

  add(): void {
    const counters = [...this.cs.character().counters];
    counters.push({ name: '', maxValue: 3, currentValue: 3 });
    this.cs.update({ counters });
    this.editingIndex.set(counters.length - 1);
  }

  confirmRemove(index: number, name: string): void {
    this.confirmationService.confirm({
      message: `„${name || 'Unbenannt'}" wirklich löschen?`,
      header: 'Zähler löschen',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.remove(index),
    });
  }

  remove(index: number): void {
    const counters = [...this.cs.character().counters];
    counters.splice(index, 1);
    this.cs.update({ counters });
    const editing = this.editingIndex();
    if (editing === index) {
      this.editingIndex.set(-1);
    } else if (editing > index) {
      this.editingIndex.set(editing - 1);
    }
  }

  updateMaxValue(index: number, newMax: number): void {
    const counter = this.cs.character().counters[index];
    this.updateCounter(index, {
      maxValue: newMax,
      currentValue: Math.min(counter.currentValue, newMax),
    });
  }

  updateCounter(index: number, partial: Partial<Counter>): void {
    const counters = this.cs
      .character()
      .counters.map((c, i) => (i === index ? { ...c, ...partial } : c));
    this.cs.update({ counters });
  }

  increment(index: number): void {
    const counter = this.cs.character().counters[index];
    if (counter.currentValue < counter.maxValue) {
      this.updateCounter(index, { currentValue: counter.currentValue + 1 });
    }
  }

  decrement(index: number): void {
    const counter = this.cs.character().counters[index];
    if (counter.currentValue > 0) {
      this.updateCounter(index, { currentValue: counter.currentValue - 1 });
    }
  }

  reset(index: number): void {
    const counter = this.cs.character().counters[index];
    this.updateCounter(index, { currentValue: counter.maxValue });
  }
}
