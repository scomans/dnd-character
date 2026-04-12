import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { Equipment } from '../../models/character.model';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, ButtonModule, FieldsetModule, TooltipModule],
  template: `
    <p-fieldset legend="Ausrüstung">
      <div class="flex gap-4">
        <!-- Equipment List (left) -->
        <div class="flex-1 min-w-0">
          <div class="space-y-1">
            @for (item of cs.character().equipment; track $index; let i = $index) {
              <div class="flex items-center gap-1 text-xs">
                <input pInputText [(ngModel)]="item.name" (ngModelChange)="updateEquipment()" class="flex-1 text-xs" placeholder="Gegenstand" />
                <p-inputnumber
                  [(ngModel)]="item.quantity"
                  (ngModelChange)="updateEquipment()"
                  [showButtons]="false"
                  [min]="0"
                  [inputStyle]="{ width: '2.5rem', textAlign: 'center', fontSize: '0.75rem' }"
                />
                <p-inputnumber
                  [(ngModel)]="item.weight"
                  (ngModelChange)="updateEquipment()"
                  [showButtons]="false"
                  [min]="0"
                  [minFractionDigits]="1"
                  [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '0.75rem' }"
                />
                <span class="text-gray-400 text-[0.6rem]">kg</span>
                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="removeItem(i)" />
              </div>
            }
          </div>
          <div class="flex justify-between items-center mt-2">
            <p-button label="Hinzufügen" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addItem()" />
            <span class="text-xs text-gray-500">
              Gewicht: {{ getTotalWeight() | number:'1.1-1' }} kg
            </span>
          </div>
        </div>

        <!-- Currency (right, vertical) -->
        <div class="shrink-0 flex flex-col gap-1 border-l border-gray-200 pl-4">
          <span class="text-[0.65rem] font-bold uppercase text-gray-600 text-center mb-1">Münzen</span>
          @for (coin of coins; track coin.key) {
            <div class="flex items-center gap-1">
              <span class="text-[0.6rem] font-bold uppercase text-gray-600 w-6 text-right" [pTooltip]="coin.tooltip" tooltipPosition="left">{{ coin.label }}</span>
              <p-inputnumber
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
  `,
})
export class EquipmentComponent {
  cs = inject(CharacterService);

  coins = [
    { key: 'cp', label: 'KM', tooltip: 'Kupfermünzen' },
    { key: 'sp', label: 'SM', tooltip: 'Silbermünzen' },
    { key: 'ep', label: 'EM', tooltip: 'Elektrummünzen' },
    { key: 'gp', label: 'GM', tooltip: 'Goldmünzen' },
    { key: 'pp', label: 'PM', tooltip: 'Platinmünzen' },
  ];

  getCurrency(key: string): number {
    const char = this.cs.character();
    return (char.currency as unknown as Record<string, number>)[key] ?? 0;
  }

  updateCurrency(key: string, value: number | null): void {
    const char = this.cs.character();
    this.cs.update({ currency: { ...char.currency, [key]: value ?? 0 } });
  }

  addItem(): void {
    const char = this.cs.character();
    const equipment = [...char.equipment, { name: '', quantity: 1, weight: 0, description: '' }];
    this.cs.update({ equipment });
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

  getTotalWeight(): number {
    return this.cs.character().equipment.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  }
}
