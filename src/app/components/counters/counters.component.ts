import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutside } from 'ngxtension/click-outside';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Counter } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';


@Component({
  selector: 'app-counters',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Fieldset,
    InputNumber,
    InputText,
    Tooltip,
    ClickOutside,
    ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './counters.component.html',
  styleUrl: './counters.component.scss',
})
export class CountersComponent {
  cs = inject(CharacterService);
  private confirmationService = inject(ConfirmationService);
  editingIndex = signal(-1);

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
      icon: 'pi pi-exclamation-triangle',
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
    const counters = this.cs.character().counters.map((c, i) =>
      i === index ? { ...c, ...partial } : c
    );
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
