import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { ClickOutside } from 'ngxtension/click-outside';
import { LIFESTYLES } from '../../models/character.model';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumberModule, InputGroupModule, InputGroupAddonModule, CheckboxModule, InputTextModule, InputMaskModule, SelectModule, FieldsetModule, TooltipModule, ClickOutside],
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
              <p-inputgroup styleClass="justify-center" (clickOutside)="editingSpeed.set(false)">
                <p-inputnumber
                  [ngModel]="cs.character().speed"
                  (ngModelChange)="cs.update({ speed: $event ?? 30 })"
                  [showButtons]="false"
                  [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }"
                />
                <p-inputgroup-addon>m</p-inputgroup-addon>
              </p-inputgroup>
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
          <div class="flex items-center justify-center">
            <p-inputMask
              [ngModel]="cs.character().hitDiceTotal"
              (ngModelChange)="cs.update({ hitDiceTotal: $event })"
              mask="99w99"
              placeholder="1W10"
              [autoClear]="false"
              slotChar=" "
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

      <!-- Lifestyle & Jump Section -->
      <div class="grid grid-cols-2 gap-2">
        <p-fieldset legend="Lebensstil">
          <div class="flex items-center gap-2">
            <p-select
              [ngModel]="cs.character().lifestyle"
              (ngModelChange)="cs.update({ lifestyle: $event })"
              [options]="lifestyles"
              optionLabel="label"
              optionValue="value"
              [style]="{ width: '100%', fontSize: '0.8rem' }"
              appendTo="body"
            />
            <div class="shrink-0 text-right">
              <span class="text-xs text-gray-500">Tägliche Kosten</span>
              <div class="text-sm font-bold text-slate-700">{{ getLifestyleCost() }}</div>
            </div>
          </div>
        </p-fieldset>

        <p-fieldset legend="Hoch- & Weitsprung">
          <div class="text-xs">
            <table class="w-full">
              <thead>
                <tr>
                  <th></th>
                  <th class="text-center text-[0.6rem] text-gray-500">Ohne Anlauf</th>
                  <th class="text-center text-[0.6rem] text-gray-500">Mit Anlauf</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-[0.65rem] font-bold">Hoch</td>
                  <td class="text-center">
                    <span class="font-bold text-slate-700" pTooltip="(Stärke-Mod + 3) / 2 ft → m" tooltipPosition="top">
                      {{ getHighJumpStanding() | number:'1.2-2' }} m
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="font-bold text-slate-700" pTooltip="Stärke-Mod + 3 ft → m" tooltipPosition="top">
                      {{ getHighJumpRunning() | number:'1.2-2' }} m
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="text-[0.65rem] font-bold">Weit</td>
                  <td class="text-center">
                    <span class="font-bold text-slate-700" pTooltip="Stärke-Wert / 2 ft → m" tooltipPosition="top">
                      {{ getLongJumpStanding() | number:'1.2-2' }} m
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="font-bold text-slate-700" pTooltip="Stärke-Wert ft → m" tooltipPosition="top">
                      {{ getLongJumpRunning() | number:'1.2-2' }} m
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </p-fieldset>
      </div>
    </div>
  `,
})
export class CombatComponent {
  cs = inject(CharacterService);
  lifestyles = LIFESTYLES;
  editingAC = signal(false);
  editingSpeed = signal(false);
  editingMaxHP = signal(false);

  private readonly FT_TO_M = 0.3048;

  updateDeathSaves(type: 'successes' | 'failures', index: number, checked: boolean): void {
    const char = this.cs.character();
    const deathSaves = { ...char.deathSaves };
    deathSaves[type] = checked ? index + 1 : index;
    this.cs.update({ deathSaves });
  }

  getLifestyleCost(): string {
    const lifestyle = this.cs.character().lifestyle;
    const found = this.lifestyles.find(l => l.value === lifestyle);
    return found?.cost ?? '—';
  }

  // Jump calculations based on DND 5E rules (converted to meters)
  // High Jump (running) = 3 + STR modifier feet
  // High Jump (standing) = half of running
  // Long Jump (running) = STR score feet
  // Long Jump (standing) = half of running
  getHighJumpRunning(): number {
    const strMod = this.cs.getAbilityModifier('str');
    return (3 + strMod) * this.FT_TO_M;
  }

  getHighJumpStanding(): number {
    return this.getHighJumpRunning() / 2;
  }

  getLongJumpRunning(): number {
    const strScore = this.cs.character().abilities.str.base;
    return strScore * this.FT_TO_M;
  }

  getLongJumpStanding(): number {
    return this.getLongJumpRunning() / 2;
  }
}
