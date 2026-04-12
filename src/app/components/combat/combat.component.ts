import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumberModule, InputGroupModule, InputGroupAddonModule, CheckboxModule, InputTextModule, FieldsetModule],
  template: `
    <div class="space-y-3">
      <!-- AC / Initiative / Speed Row -->
      <div class="grid grid-cols-3 gap-2">
        <p-fieldset legend="Rüstungsklasse" styleClass="text-center">
          <div class="flex flex-col items-center">
            @if (editingAC()) {
              <div class="flex flex-col items-center gap-1">
                <p-inputnumber
                  [ngModel]="cs.character().armorValue"
                  (ngModelChange)="cs.update({ armorValue: $event ?? 10 })"
                  [showButtons]="false"
                  [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold' }"
                  (onBlur)="onACBlur()"
                />
                <label class="flex items-center gap-1 text-xs">
                  <p-checkbox
                    [ngModel]="cs.character().hasShield"
                    (ngModelChange)="cs.update({ hasShield: $event })"
                    [binary]="true"
                  />
                  Schild (+2)
                </label>
              </div>
            } @else {
              <span
                class="text-2xl font-bold text-amber-900 cursor-pointer hover:text-amber-700"
                (click)="editingAC.set(true)"
              >{{ cs.getComputedArmorClass() }}</span>
            }
          </div>
        </p-fieldset>
        <p-fieldset legend="Initiative" styleClass="text-center">
          <div class="flex flex-col items-center">
            <span class="text-2xl font-bold text-amber-900">
              {{ cs.getInitiative() >= 0 ? '+' : '' }}{{ cs.getInitiative() }}
            </span>
          </div>
        </p-fieldset>
        <p-fieldset legend="Bewegungsrate" styleClass="text-center">
          <div class="flex flex-col items-center">
            @if (editingSpeed()) {
              <p-inputgroup styleClass="justify-center">
                <p-inputnumber
                  [ngModel]="cs.character().speed"
                  (ngModelChange)="cs.update({ speed: $event ?? 30 })"
                  [showButtons]="false"
                  [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
                  (onBlur)="onSpeedBlur()"
                />
                <p-inputgroup-addon>m</p-inputgroup-addon>
              </p-inputgroup>
            } @else {
              <span
                class="text-2xl font-bold text-amber-900 cursor-pointer hover:text-amber-700"
                (click)="editingSpeed.set(true)"
              >{{ cs.character().speed }} m</span>
            }
          </div>
        </p-fieldset>
      </div>

      <!-- Hit Points: combined current/max + temp side by side -->
      <div class="grid grid-cols-2 gap-2">
        <p-fieldset legend="Trefferpunkte">
          <div class="flex items-center justify-center gap-1">
            <p-inputnumber
              [ngModel]="cs.character().hitPointsCurrent"
              (ngModelChange)="cs.update({ hitPointsCurrent: $event ?? 0 })"
              [showButtons]="false"
              [inputStyle]="{ width: '4rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
            />
            <span class="text-xl font-bold text-gray-400">/</span>
            <p-inputnumber
              [ngModel]="cs.character().hitPointsMax"
              (ngModelChange)="cs.update({ hitPointsMax: $event ?? 1 })"
              [showButtons]="false"
              [inputStyle]="{ width: '4rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
            />
          </div>
        </p-fieldset>

        <p-fieldset legend="Temporäre TP">
          <div class="flex items-center justify-center">
            <p-inputnumber
              [ngModel]="cs.character().hitPointsTemp"
              (ngModelChange)="cs.update({ hitPointsTemp: $event ?? 0 })"
              [showButtons]="false"
              [min]="0"
              [inputStyle]="{ width: '4rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
            />
          </div>
        </p-fieldset>
      </div>

      <!-- Hit Dice & Death Saves -->
      <div class="grid grid-cols-2 gap-2">
        <p-fieldset legend="Trefferwürfel">
          <div class="flex items-center justify-center">
            <input
              pInputText
              [ngModel]="cs.character().hitDiceTotal"
              (ngModelChange)="cs.update({ hitDiceTotal: $event })"
              class="w-20 text-center text-sm font-bold"
            />
          </div>
        </p-fieldset>
        <p-fieldset legend="Rettungswürfe gegen Tod">
          <div class="text-xs">
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
        </p-fieldset>
      </div>
    </div>
  `,
})
export class CombatComponent {
  cs = inject(CharacterService);
  editingAC = signal(false);
  editingSpeed = signal(false);

  onACBlur(): void {
    setTimeout(() => this.editingAC.set(false), 200);
  }

  onSpeedBlur(): void {
    setTimeout(() => this.editingSpeed.set(false), 200);
  }

  updateDeathSaves(type: 'successes' | 'failures', index: number, checked: boolean): void {
    const char = this.cs.character();
    const deathSaves = { ...char.deathSaves };
    deathSaves[type] = checked ? index + 1 : index;
    this.cs.update({ deathSaves });
  }
}
