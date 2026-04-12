import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { Attack, DAMAGE_TYPES, ABILITY_SHORT_LABELS } from '../../models/character.model';

@Component({
  selector: 'app-attacks',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, CheckboxModule, ButtonModule, SelectModule, FieldsetModule, TooltipModule, InputGroupModule, InputGroupAddonModule, MarkdownEditorComponent],
  template: `
    <p-fieldset legend="Waffen & Angriffszauber">
      <!-- Attacks Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="text-left p-1">Angriff</th>
              <th class="p-1" pTooltip="Übungsbonus" tooltipPosition="top">ÜB</th>
              <th class="p-1" pTooltip="Attribut" tooltipPosition="top">ATTR</th>
              <th class="p-1">Reichweite</th>
              <th class="p-1">Bonus</th>
              <th class="p-1">Schaden</th>
              <th class="p-1">+</th>
              <th class="text-left p-1">Schadentyp</th>
              <th class="p-1 text-right">
                <p-button icon="pi pi-plus" [rounded]="true" [text]="true" size="small" (onClick)="addAttack()" pTooltip="Angriff hinzufügen" tooltipPosition="top" />
              </th>
            </tr>
          </thead>
          <tbody>
            @for (attack of cs.character().attacks; track $index; let i = $index) {
              <tr class="border-b border-gray-100">
                <td class="p-1">
                  <input pInputText [(ngModel)]="attack.name" (ngModelChange)="updateAttacks()" class="w-full text-xs" />
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
                    [style]="{ width: '6rem', fontSize: '0.75rem' }"
                    appendTo="body"
                  >
                    <ng-template #selectedItem let-selectedOption>
                      <span>{{ getShortLabel(selectedOption?.value) }}</span>
                    </ng-template>
                  </p-select>
                </td>
                <td class="p-1">
                  <p-inputgroup>
                    <input pInputText [(ngModel)]="attack.range" (ngModelChange)="updateAttacks()" class="w-14 text-xs text-center" />
                    <p-inputgroup-addon class="text-xs">m</p-inputgroup-addon>
                  </p-inputgroup>
                </td>
                <td class="p-1 text-center font-bold text-slate-700">
                  {{ cs.getAttackBonus(attack) >= 0 ? '+' : '' }}{{ cs.getAttackBonus(attack) }}
                </td>
                <td class="p-1">
                  <input pInputText [(ngModel)]="attack.damageDice" (ngModelChange)="updateAttacks()" class="w-16 text-xs text-center" placeholder="1W8" />
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
                    [style]="{ width: '10rem', fontSize: '0.75rem' }"
                    [filter]="true"
                    filterBy="label"
                    placeholder="Typ wählen"
                    appendTo="body"
                  >
                    <ng-template #selectedItem let-selectedOption>
                      <span>{{ selectedOption?.value }}</span>
                    </ng-template>
                  </p-select>
                </td>
                <td class="p-1">
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="removeAttack(i)" />
                </td>
              </tr>
              @if (attack.description) {
                <tr>
                  <td colspan="9" class="p-1">
                    <app-markdown-editor
                      [value]="attack.description"
                      (valueChange)="updateAttackDescription(i, $event)"
                      placeholder="Beschreibung..."
                      [minRows]="1"
                    />
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </p-fieldset>
  `,
})
export class AttacksComponent {
  cs = inject(CharacterService);

  damageTypes = DAMAGE_TYPES;

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

  addAttack(): void {
    const char = this.cs.character();
    const attacks = [...char.attacks, {
      name: '',
      proficient: true,
      attribute: 'str',
      range: '1,5',
      damageDice: '1W8',
      damageType: 'Hieb',
      description: '',
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

  updateAttackDescription(index: number, desc: string): void {
    const char = this.cs.character();
    const attacks = [...char.attacks];
    attacks[index] = { ...attacks[index], description: desc };
    this.cs.update({ attacks });
  }
}
