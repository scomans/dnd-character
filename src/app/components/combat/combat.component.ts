import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumberModule, CheckboxModule],
  template: `
    <div class="space-y-3">
      <!-- AC / Initiative / Speed Row -->
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-white border-2 border-amber-800 rounded-lg p-3 flex flex-col items-center">
          <p-inputnumber
            [ngModel]="cs.character().armorClass"
            (ngModelChange)="cs.update({ armorClass: $event ?? 10 })"
            [showButtons]="false"
            [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
          />
          <span class="text-[0.6rem] font-bold uppercase text-gray-600 mt-1">Rüstungsklasse</span>
        </div>
        <div class="bg-white border-2 border-amber-800 rounded-lg p-3 flex flex-col items-center">
          <span class="text-2xl font-bold text-amber-900">
            {{ cs.getInitiative() >= 0 ? '+' : '' }}{{ cs.getInitiative() }}
          </span>
          <span class="text-[0.6rem] font-bold uppercase text-gray-600 mt-1">Initiative</span>
        </div>
        <div class="bg-white border-2 border-amber-800 rounded-lg p-3 flex flex-col items-center">
          <p-inputnumber
            [ngModel]="cs.character().speed"
            (ngModelChange)="cs.update({ speed: $event ?? 30 })"
            [showButtons]="false"
            [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
          />
          <span class="text-[0.6rem] font-bold uppercase text-gray-600 mt-1">Bewegungsrate</span>
        </div>
      </div>

      <!-- Hit Points -->
      <div class="bg-white border-2 border-amber-800 rounded-lg p-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-500">Trefferpunkte Maximum</span>
          <p-inputnumber
            [ngModel]="cs.character().hitPointsMax"
            (ngModelChange)="cs.update({ hitPointsMax: $event ?? 1 })"
            [showButtons]="false"
            [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '0.8rem' }"
          />
        </div>
        <div class="flex flex-col items-center">
          <p-inputnumber
            [ngModel]="cs.character().hitPointsCurrent"
            (ngModelChange)="cs.update({ hitPointsCurrent: $event ?? 0 })"
            [showButtons]="true"
            [inputStyle]="{ width: '5rem', textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }"
          />
          <span class="text-[0.6rem] font-bold uppercase text-gray-600 mt-1">Aktuelle Trefferpunkte</span>
        </div>
      </div>

      <!-- Temporary Hit Points -->
      <div class="bg-white border-2 border-amber-800 rounded-lg p-3 flex flex-col items-center">
        <p-inputnumber
          [ngModel]="cs.character().hitPointsTemp"
          (ngModelChange)="cs.update({ hitPointsTemp: $event ?? 0 })"
          [showButtons]="true"
          [min]="0"
          [inputStyle]="{ width: '4rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }"
        />
        <span class="text-[0.6rem] font-bold uppercase text-gray-600 mt-1">Temporäre Trefferpunkte</span>
      </div>

      <!-- Hit Dice & Death Saves -->
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-white border-2 border-amber-800 rounded-lg p-2 flex flex-col items-center">
          <div class="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <span>Gesamt</span>
            <input
              pInputText
              [ngModel]="cs.character().hitDiceTotal"
              (ngModelChange)="cs.update({ hitDiceTotal: $event })"
              class="w-16 text-center text-xs"
            />
          </div>
          <p-inputnumber
            [ngModel]="cs.character().hitDiceUsed"
            (ngModelChange)="cs.update({ hitDiceUsed: $event ?? 0 })"
            [showButtons]="true"
            [min]="0"
            [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '0.85rem' }"
          />
          <span class="text-[0.6rem] font-bold uppercase text-gray-600 mt-1">Trefferwürfel</span>
        </div>
        <div class="bg-white border-2 border-amber-800 rounded-lg p-2 flex flex-col items-center">
          <div class="text-xs mb-1">
            <div class="flex items-center gap-1">
              <span class="text-[0.6rem] w-16">Erfolge</span>
              @for (i of [0, 1, 2]; track i) {
                <p-checkbox
                  [ngModel]="cs.character().deathSaves.successes > i"
                  (ngModelChange)="updateDeathSaves('successes', i, $event)"
                  [binary]="true"
                />
              }
            </div>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-[0.6rem] w-16">Fehlschläge</span>
              @for (i of [0, 1, 2]; track i) {
                <p-checkbox
                  [ngModel]="cs.character().deathSaves.failures > i"
                  (ngModelChange)="updateDeathSaves('failures', i, $event)"
                  [binary]="true"
                />
              }
            </div>
          </div>
          <span class="text-[0.6rem] font-bold uppercase text-gray-600 mt-1">Rettungswürfe gegen Tod</span>
        </div>
      </div>
    </div>
  `,
})
export class CombatComponent {
  cs = inject(CharacterService);

  updateDeathSaves(type: 'successes' | 'failures', index: number, checked: boolean): void {
    const char = this.cs.character();
    const deathSaves = { ...char.deathSaves };
    deathSaves[type] = checked ? index + 1 : index;
    this.cs.update({ deathSaves });
  }
}
