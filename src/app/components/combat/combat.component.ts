import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { CharacterService } from '../../services/character.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CheckboxModule } from 'primeng/checkbox';
import { InputMaskModule } from 'primeng/inputmask';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { ClickOutside } from 'ngxtension/click-outside';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    CheckboxModule,
    InputMaskModule,
    FieldsetModule,
    TooltipModule,
    ClickOutside,
    InputText,
  ],
  template: `
    <div class="space-y-3">
      <!-- AC / Initiative / Speed Row -->
      <div class="grid grid-cols-3 gap-2">
        <p-fieldset legend="Rüstungsklasse" styleClass="text-center">
          <div class="flex flex-col items-center">
            @if (editingAC()) {
              <div class="flex flex-col items-center gap-1" (clickOutside)="editingAC.set(false)">
                <p-inputnumber
                  [ngModel]="cs.character().armorValue"
                  (ngModelChange)="cs.update({ armorValue: $event ?? 10 })"
                  [showButtons]="false"
                  [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold' }"
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
                class="text-2xl font-bold text-slate-700 cursor-pointer hover:text-slate-500"
                pTooltip="Rüstungsklasse (klicken zum Bearbeiten)"
                tooltipPosition="top"
                (click)="editingAC.set(true)"
              >{{ cs.getComputedArmorClass() }}</span>
            }
          </div>
        </p-fieldset>
        <p-fieldset legend="Initiative" styleClass="text-center">
          <div class="flex flex-col items-center">
            <span class="text-2xl font-bold text-slate-700" pTooltip="Geschicklichkeits-Modifikator" tooltipPosition="top">
              {{ cs.getInitiative() >= 0 ? '+' : '' }}{{ cs.getInitiative() }}
            </span>
          </div>
        </p-fieldset>
        <p-fieldset legend="Bewegungsrate" styleClass="text-center">
          <div class="flex flex-col items-center">
            @if (editingSpeed()) {
              <p-input-group class="justify-center" (clickOutside)="editingSpeed.set(false)">
                <p-input-number
                  [ngModel]="cs.character().speed"
                  (ngModelChange)="cs.update({ speed: $event ?? 30 })"
                  [showButtons]="false"
                  [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
                  suffix=" m"
                />
              </p-input-group>
            } @else {
              <span
                class="text-2xl font-bold text-slate-700 cursor-pointer hover:text-slate-500"
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
              [showButtons]="true"
              buttonLayout="horizontal"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              [min]="0"
              [max]="cs.character().hitPointsMax"
              [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
            />
            <span class="text-xl font-bold text-gray-400">/</span>
            @if (editingMaxHP()) {
              <div (clickOutside)="editingMaxHP.set(false)">
                <p-inputnumber
                  [ngModel]="cs.character().hitPointsMax"
                  (ngModelChange)="cs.update({ hitPointsMax: $event ?? 1 })"
                  [showButtons]="false"
                  [min]="1"
                  [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
                />
              </div>
            } @else {
              <span
                class="text-2xl font-bold text-slate-700 cursor-pointer hover:text-slate-500"
                pTooltip="Max. TP (klicken zum Bearbeiten)"
                tooltipPosition="top"
                (click)="editingMaxHP.set(true)"
              >{{ cs.character().hitPointsMax }}</span>
            }
          </div>
        </p-fieldset>

        <p-fieldset legend="Temporäre TP" pTooltip="Temporäre Trefferpunkte" tooltipPosition="top">
          <div class="flex items-center justify-center">
            <p-inputnumber
              [ngModel]="cs.character().hitPointsTemp"
              (ngModelChange)="cs.update({ hitPointsTemp: $event ?? 0 })"
              [showButtons]="true"
              buttonLayout="horizontal"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              [min]="0"
              [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
            />
          </div>
        </p-fieldset>
      </div>

      <!-- Hit Dice & Death Saves -->
      <div class="grid grid-cols-2 gap-2">
        <p-fieldset legend="Trefferwürfel">
          <div class="flex items-center justify-center gap-2">
            <input
              pInputText
              [ngModel]="cs.character().hitDiceTotal"
              (ngModelChange)="cs.update({ hitDiceTotal: $event })"
              placeholder="1Wx"
              class="w-full text-xs attack-input"
              [style]="{ width: '5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold' }"
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
  editingMaxHP = signal(false);

  updateDeathSaves(type: 'successes' | 'failures', index: number, checked: boolean): void {
    const char = this.cs.character();
    const deathSaves = { ...char.deathSaves };
    deathSaves[type] = checked ? index + 1 : index;
    this.cs.update({ deathSaves });
  }
}
