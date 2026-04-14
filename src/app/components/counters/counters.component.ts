import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutside } from 'ngxtension/click-outside';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Counter } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-counters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    FieldsetModule,
    InputNumberModule,
    InputText,
    TooltipModule,
    ClickOutside,
  ],
  template: `
    <p-fieldset legend="Zähler / Tracker">
      <div class="flex flex-col gap-3">
        @for (counter of cs.character().counters; track $index) {
          <div class="flex flex-wrap items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
            @if (editingIndex() === $index) {
              <div class="flex flex-wrap items-center gap-2 flex-1" (clickOutside)="editingIndex.set(-1)">
                <input
                  pInputText
                  [ngModel]="counter.name"
                  (ngModelChange)="updateCounter($index, { name: $event })"
                  placeholder="Name"
                  class="text-sm"
                  [style]="{ width: '8rem' }"
                />
                <p-input-number
                  [ngModel]="counter.maxValue"
                  (ngModelChange)="updateCounter($index, { maxValue: $event ?? 1, currentValue: $event ?? 1 })"
                  [showButtons]="false"
                  [min]="1"
                  [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '0.875rem' }"
                  pTooltip="Maximalwert"
                  tooltipPosition="top"
                />
              </div>
            } @else {
              <span
                class="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-500 flex-1 min-w-[4rem]"
                (click)="editingIndex.set($index)"
                pTooltip="Klicken zum Bearbeiten"
                tooltipPosition="top"
              >{{ counter.name || 'Unbenannt' }}</span>
            }
            <div class="flex items-center gap-1">
              <p-button
                icon="pi pi-minus"
                [rounded]="true"
                [text]="true"
                severity="secondary"
                size="small"
                (onClick)="decrement($index)"
                [disabled]="counter.currentValue <= 0"
                pTooltip="Verringern"
                tooltipPosition="top"
              />
              <span class="text-lg font-bold text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
                {{ counter.currentValue }} / {{ counter.maxValue }}
              </span>
              <p-button
                icon="pi pi-plus"
                [rounded]="true"
                [text]="true"
                severity="secondary"
                size="small"
                (onClick)="increment($index)"
                [disabled]="counter.currentValue >= counter.maxValue"
                pTooltip="Erhöhen"
                tooltipPosition="top"
              />
              <p-button
                icon="pi pi-refresh"
                [rounded]="true"
                [text]="true"
                severity="info"
                size="small"
                (onClick)="reset($index)"
                pTooltip="Zurücksetzen"
                tooltipPosition="top"
              />
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                severity="danger"
                size="small"
                (onClick)="remove($index)"
                pTooltip="Entfernen"
                tooltipPosition="top"
              />
            </div>
          </div>
        }
        <p-button
          label="Zähler hinzufügen"
          icon="pi pi-plus"
          [text]="true"
          size="small"
          (onClick)="add()"
        />
      </div>
    </p-fieldset>
  `,
})
export class CountersComponent {
  cs = inject(CharacterService);
  editingIndex = signal(-1);

  add(): void {
    const counters = [...this.cs.character().counters];
    counters.push({ name: '', maxValue: 3, currentValue: 3 });
    this.cs.update({ counters });
    this.editingIndex.set(counters.length - 1);
  }

  remove(index: number): void {
    const counters = [...this.cs.character().counters];
    counters.splice(index, 1);
    this.cs.update({ counters });
    if (this.editingIndex() === index) {
      this.editingIndex.set(-1);
    }
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
