import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Equipment } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';


@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [FormsModule, InputText, InputNumber, Button, Fieldset, Tooltip, DragDropModule, DecimalPipe, ConfirmDialog],
  providers: [ConfirmationService],
  template: `
    <p-confirmDialog />
    <div class="space-y-3">
      <p-fieldset legend="Ausrüstung">
        <div class="flex gap-4">
          <!-- Equipment List (left) -->
          <div class="flex-1 min-w-0">
            <div cdkDropList (cdkDropListDropped)="dropEquipment($event)" class="space-y-1">
              @for (item of cs.character().equipment; track $index; let i = $index) {
                <div cdkDrag class="flex items-center gap-1 text-xs">
                  <i class="pi pi-bars text-gray-400 dark:text-gray-500 cursor-move mr-1" cdkDragHandle></i>
                  <input pInputText [(ngModel)]="item.name" (ngModelChange)="updateEquipment()" class="flex-1 text-xs" placeholder="Gegenstand" />
                  <p-input-number
                    [(ngModel)]="item.quantity"
                    (ngModelChange)="updateEquipment()"
                    [showButtons]="false"
                    [min]="0"
                    [inputStyle]="{ width: '2.5rem', textAlign: 'center', fontSize: '0.75rem' }"
                  />
                  <p-input-number
                    [(ngModel)]="item.weight"
                    (ngModelChange)="updateEquipment()"
                    [showButtons]="false"
                    [min]="0"
                    [minFractionDigits]="1"
                    [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '0.75rem' }"
                  />
                  <span class="text-gray-400 dark:text-gray-500 text-[0.6rem]">kg</span>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="confirmRemoveItem(i, item.name)" />
                </div>
              }
            </div>
            <div class="flex justify-between items-center mt-2">
              <p-button label="Hinzufügen" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addItem()" />
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Gewicht: {{ getTotalWeight() | number:'1.1-1' }} kg
              </span>
            </div>
          </div>

          <!-- Currency (right, vertical) - reversed order: highest value first -->
          <div class="shrink-0 flex flex-col gap-1 border-l border-gray-200 dark:border-gray-700 pl-4">
            <span class="text-[0.65rem] font-bold text-gray-600 dark:text-gray-400 text-center mb-1">Münzen</span>
            @for (coin of coins; track coin.key) {
              <div class="flex items-center gap-1">
                <span
                  class="text-[0.6rem] font-bold text-gray-600 dark:text-gray-400 w-6 text-right" [pTooltip]="coin.tooltip" tooltipPosition="left"
                >{{ coin.label }}</span>
                <p-input-number
                  [ngModel]="getCurrency(coin.key)"
                  (ngModelChange)="updateCurrency(coin.key, $event)"
                  [showButtons]="true"
                  buttonLayout="horizontal"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  [min]="0"
                  [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '0.75rem' }"
                />
              </div>
            }
          </div>
        </div>
      </p-fieldset>

      <p-fieldset legend="Zusätzliche Ausrüstung">
        <div cdkDropList (cdkDropListDropped)="dropAdditionalEquipment($event)" class="space-y-1">
          @for (item of cs.character().additionalEquipment; track $index; let i = $index) {
            <div cdkDrag class="flex items-center gap-1 text-xs">
              <i class="pi pi-bars text-gray-400 dark:text-gray-500 cursor-move mr-1" cdkDragHandle></i>
              <input pInputText [(ngModel)]="item.name" (ngModelChange)="updateAdditionalEquipment()" class="flex-1 text-xs" placeholder="Gegenstand" />
              <p-input-number
                [(ngModel)]="item.quantity"
                (ngModelChange)="updateAdditionalEquipment()"
                [showButtons]="false"
                [min]="0"
                [inputStyle]="{ width: '2.5rem', textAlign: 'center', fontSize: '0.75rem' }"
              />
              <p-input-number
                [(ngModel)]="item.weight"
                (ngModelChange)="updateAdditionalEquipment()"
                [showButtons]="false"
                [min]="0"
                [minFractionDigits]="1"
                [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '0.75rem' }"
              />
              <span class="text-gray-400 dark:text-gray-500 text-[0.6rem]">kg</span>
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="confirmRemoveAdditionalItem(i, item.name)" />
            </div>
          }
        </div>
        <div class="flex justify-between items-center mt-2">
          <p-button label="Hinzufügen" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addAdditionalItem()" />
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Gewicht: {{ getAdditionalTotalWeight() | number:'1.1-1' }} kg
          </span>
        </div>
      </p-fieldset>
    </div>
  `,
})
export class EquipmentComponent {
  cs = inject(CharacterService);
  private confirmationService = inject(ConfirmationService);

  // Reversed order: highest value first
  coins = [
    { key: 'pp', label: 'PM', tooltip: 'Platinmünzen' },
    { key: 'gp', label: 'GM', tooltip: 'Goldmünzen' },
    { key: 'ep', label: 'EM', tooltip: 'Elektrummünzen' },
    { key: 'sp', label: 'SM', tooltip: 'Silbermünzen' },
    { key: 'cp', label: 'KM', tooltip: 'Kupfermünzen' },
  ];

  getCurrency(key: string): number {
    const char = this.cs.character();
    return (char.currency as unknown as Record<string, number>)[key] ?? 0;
  }

  updateCurrency(key: string, value: number | null): void {
    const char = this.cs.character();
    this.cs.update({ currency: { ...char.currency, [key]: value ?? 0 } });
  }

  // === Main Equipment ===

  addItem(): void {
    const char = this.cs.character();
    const equipment = [...char.equipment, { name: '', quantity: 1, weight: 0, description: '' }];
    this.cs.update({ equipment });
  }

  confirmRemoveItem(index: number, name: string): void {
    this.confirmationService.confirm({
      message: `„${name || 'Unbenannt'}" wirklich löschen?`,
      header: 'Gegenstand löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.removeItem(index),
    });
  }

  removeItem(index: number): void {
    const char = this.cs.character();
    const equipment = char.equipment.filter((_, i) => i !== index);
    this.cs.update({ equipment });
  }

  updateEquipment(): void {
    const char = this.cs.character();
    this.cs.update({ equipment: [...char.equipment] });
  }

  dropEquipment(event: CdkDragDrop<Equipment[]>): void {
    const char = this.cs.character();
    const equipment = [...char.equipment];
    moveItemInArray(equipment, event.previousIndex, event.currentIndex);
    this.cs.update({ equipment });
  }

  getTotalWeight(): number {
    return this.cs.character().equipment.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  }

  // === Additional Equipment ===

  addAdditionalItem(): void {
    const char = this.cs.character();
    const additionalEquipment = [...(char.additionalEquipment ?? []), { name: '', quantity: 1, weight: 0, description: '' }];
    this.cs.update({ additionalEquipment });
  }

  confirmRemoveAdditionalItem(index: number, name: string): void {
    this.confirmationService.confirm({
      message: `„${name || 'Unbenannt'}" wirklich löschen?`,
      header: 'Gegenstand löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.removeAdditionalItem(index),
    });
  }

  removeAdditionalItem(index: number): void {
    const char = this.cs.character();
    const additionalEquipment = (char.additionalEquipment ?? []).filter((_, i) => i !== index);
    this.cs.update({ additionalEquipment });
  }

  updateAdditionalEquipment(): void {
    const char = this.cs.character();
    this.cs.update({ additionalEquipment: [...(char.additionalEquipment ?? [])] });
  }

  dropAdditionalEquipment(event: CdkDragDrop<Equipment[]>): void {
    const char = this.cs.character();
    const additionalEquipment = [...(char.additionalEquipment ?? [])];
    moveItemInArray(additionalEquipment, event.previousIndex, event.currentIndex);
    this.cs.update({ additionalEquipment });
  }

  getAdditionalTotalWeight(): number {
    return (this.cs.character().additionalEquipment ?? []).reduce((sum, item) => sum + item.weight * item.quantity, 0);
  }
}
