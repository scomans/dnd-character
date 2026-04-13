import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { Attack, DAMAGE_TYPES, ABILITY_SHORT_LABELS, WEAPON_MASTERIES } from '../../models/character.model';

@Component({
  selector: 'app-attacks',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, InputMaskModule, CheckboxModule, ButtonModule, SelectModule, FieldsetModule, TooltipModule, InputGroupModule, InputGroupAddonModule, MarkdownEditorComponent],
  template: `
    <p-fieldset legend="Waffen & Angriffszauber">
      <div class="overflow-x-auto">
        <table class="w-full text-xs" style="min-width: 600px">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="text-left p-1">Angriff</th>
              <th class="p-1" pTooltip="Übungsbonus" tooltipPosition="top">ÜB</th>
              <th class="p-1" pTooltip="Attribut" tooltipPosition="top">Attr</th>
              <th class="p-1" pTooltip="Angriffsbonus" tooltipPosition="top">Bonus</th>
              <th class="p-1">RW</th>
              <th class="p-1">Schaden</th>
              <th class="p-1" pTooltip="Schadensbonus" tooltipPosition="top">+</th>
              <th class="text-left p-1">Typ</th>
              <th class="p-1" pTooltip="Waffenmeisterschaft" tooltipPosition="top">Meist.</th>
              <th class="p-1" pTooltip="Magischer Bonus" tooltipPosition="top">Mag</th>
              <th class="p-1 text-right">
                <p-button
                  icon="pi pi-plus" [rounded]="true" [text]="true" size="small" (onClick)="addAttack()" pTooltip="Angriff hinzufügen"
                  tooltipPosition="top"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            @for (attack of cs.character().attacks; track $index; let i = $index) {
              <tr class="border-b border-gray-100">
                <td class="p-1">
                  <input
                    pInputText [(ngModel)]="attack.name" (ngModelChange)="updateAttacks()" class="w-full text-xs" style="min-width:80px"
                    pSize="small"
                  />
                </td>
                <td class="p-1 text-center">
                  <p-checkbox [(ngModel)]="attack.proficient" (ngModelChange)="updateAttacks()" [binary]="true" />
                </td>
                <td class="p-1">
                  <p-select
                    [(ngModel)]="attack.attribute"
                    (ngModelChange)="updateAttacks()"
                    [options]="abilityOptions"
                    optionLabel="label"
                    optionValue="value"
                    [style]="{ width: '4rem', fontSize: '0.7rem' }"
                    appendTo="body"
                    size="small"
                    class="attack-input"
                  >
                    <ng-template #selectedItem let-selectedOption>
                      <span>{{ getShortLabel(selectedOption?.value) }}</span>
                    </ng-template>
                  </p-select>
                </td>
                <td class="p-1 text-center font-bold text-slate-700">
                  {{ cs.getAttackBonus(attack) >= 0 ? '+' : '' }}{{ cs.getAttackBonus(attack) }}
                </td>
                <td class="p-1">
                  <p-inputgroup>
                    <p-input-number
                      [ngModel]="parseRange(attack.range)"
                      (ngModelChange)="updateAttackRange(i, $event)"
                      [showButtons]="false"
                      [min]="0"
                      [minFractionDigits]="0"
                      [maxFractionDigits]="1"
                      [inputStyle]="{ width: '3rem', textAlign: 'center', fontSize: '0.7rem' }"
                      suffix="m"
                      size="small"
                      class="attack-input"
                    />
                  </p-inputgroup>
                </td>
                <td class="p-1">
                  <input
                    pInputText
                    [(ngModel)]="attack.damageDice"
                    (ngModelChange)="updateAttacks()"
                    placeholder="1W8"
                    class="w-full text-xs attack-input"
                    [style]="{ width: '4rem', textAlign: 'center', fontSize: '0.7rem' }"
                    pSize="small"
                  />
                </td>
                <td class="p-1 text-center font-bold text-slate-700">
                  {{ cs.getDamageBonus(attack) >= 0 ? '+' : '' }}{{ cs.getDamageBonus(attack) }}
                </td>
                <td class="p-1">
                  <p-select
                    [(ngModel)]="attack.damageType"
                    (ngModelChange)="updateAttacks()"
                    [options]="damageTypes"
                    optionLabel="label"
                    optionValue="value"
                    [style]="{ width: '5.5rem', fontSize: '0.7rem' }"
                    [filter]="true"
                    filterBy="label"
                    placeholder="Typ"
                    appendTo="body"
                    size="small"
                    class="attack-input"
                  >
                    <ng-template #selectedItem let-selectedOption>
                      <span>{{ selectedOption?.value }}</span>
                    </ng-template>
                  </p-select>
                </td>
                <td class="p-1">
                  <p-select
                    [(ngModel)]="attack.mastery"
                    (ngModelChange)="updateAttacks()"
                    [options]="masteries"
                    optionLabel="label"
                    optionValue="value"
                    [style]="{ width: '5rem', fontSize: '0.7rem' }"
                    placeholder="--"
                    appendTo="body"
                    size="small"
                    class="attack-input"
                  >
                    <ng-template #selectedItem let-selectedOption>
                      <span>{{ selectedOption?.value || '--' }}</span>
                    </ng-template>
                    <ng-template #item let-option>
                      <span [pTooltip]="option.description" tooltipPosition="right">{{ option.label }}</span>
                    </ng-template>
                  </p-select>
                </td>
                <td class="p-1">
                  <p-input-number
                    [(ngModel)]="attack.magicBonus"
                    (ngModelChange)="updateAttacks()"
                    [showButtons]="false"
                    [min]="0"
                    [max]="5"
                    [inputStyle]="{ width: '2rem', textAlign: 'center', fontSize: '0.7rem' }"
                    pTooltip="Magischer Bonus (z.B. +1 Waffe)"
                    tooltipPosition="top"
                    size="small"
                    class="attack-input"
                  />
                </td>
                <td class="p-1">
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="removeAttack(i)" />
                </td>
              </tr>
              <tr>
                <td colspan="11" class="p-1">
                  <app-markdown-editor
                    [value]="attack.description"
                    (valueChange)="updateAttackDescription(i, $event)"
                    placeholder="Beschreibung..."
                    [minRows]="1"
                  />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </p-fieldset>
  `,
  styles: `
  .attack-input {
    --p-select-sm-padding-x: 0.5rem 0;
    --p-select-dropdown-width: 1.5rem;
    --p-inputtext-sm-padding-x: 0.25rem;
  }
  `
})
export class AttacksComponent {
  cs = inject(CharacterService);

  damageTypes = DAMAGE_TYPES;
  masteries = WEAPON_MASTERIES;

  abilityOptions = [
    { label: 'Stärke', value: 'str' },
    { label: 'Geschicklichkeit', value: 'dex' },
    { label: 'Konstitution', value: 'con' },
    { label: 'Intelligenz', value: 'int' },
    { label: 'Weisheit', value: 'wis' },
    { label: 'Charisma', value: 'cha' },
  ];

  getShortLabel(value: string | undefined): string {
    return value ? (ABILITY_SHORT_LABELS[value] ?? value) : '';
  }

  parseRange(range: string): number {
    const num = parseFloat(String(range).replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }

  addAttack(): void {
    const char = this.cs.character();
    const attacks = [...char.attacks, {
      name: '',
      proficient: true,
      attribute: 'str',
      range: '1.5',
      damageDice: ' 1W8',
      damageType: 'Hieb',
      description: '',
      mastery: '',
      magicBonus: 0,
    }];
    this.cs.update({ attacks });
  }

  removeAttack(index: number): void {
    const char = this.cs.character();
    const attacks = char.attacks.filter((_, i) => i !== index);
    this.cs.update({ attacks });
  }

  updateAttacks(): void {
    const char = this.cs.character();
    this.cs.update({ attacks: [...char.attacks] });
  }

  updateAttackRange(index: number, value: number | null): void {
    const char = this.cs.character();
    const attacks = [...char.attacks];
    attacks[index] = { ...attacks[index], range: String(value ?? 0) };
    this.cs.update({ attacks });
  }

  updateAttackDescription(index: number, desc: string): void {
    const char = this.cs.character();
    const attacks = [...char.attacks];
    attacks[index] = { ...attacks[index], description: desc };
    this.cs.update({ attacks });
  }
}
