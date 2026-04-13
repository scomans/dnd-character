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
      <div class="space-y-3">
        @for (attack of cs.character().attacks; track $index; let i = $index) {
          <div class="border border-gray-200 rounded-lg p-2 space-y-1.5">
            <!-- Row 1: Name + Delete -->
            <div class="flex items-center gap-1">
              <input pInputText [(ngModel)]="attack.name" (ngModelChange)="updateAttacks()" class="flex-1 text-xs font-bold" placeholder="Angriffsname" />
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="removeAttack(i)" />
            </div>
            <!-- Row 2: Compact stats -->
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <!-- Proficient -->
              <div class="flex items-center gap-0.5" pTooltip="Geübt" tooltipPosition="top">
                <p-checkbox [(ngModel)]="attack.proficient" (ngModelChange)="updateAttacks()" [binary]="true" />
                <span class="text-[0.6rem] text-gray-500">ÜB</span>
              </div>
              <!-- Attribute -->
              <p-select
                [(ngModel)]="attack.attribute"
                (ngModelChange)="updateAttacks()"
                [options]="abilityOptions"
                optionLabel="label"
                optionValue="value"
                [style]="{ width: '5.5rem', fontSize: '0.7rem' }"
                appendTo="body"
              >
                <ng-template #selectedItem let-selectedOption>
                  <span class="text-xs">{{ getShortLabel(selectedOption?.value) }}</span>
                </ng-template>
              </p-select>
              <!-- Attack Bonus (computed) -->
              <span class="font-bold text-slate-700 px-1" pTooltip="Angriffsbonus = Attr.Mod + ÜB + Mag." tooltipPosition="top">
                {{ cs.getAttackBonus(attack) >= 0 ? '+' : '' }}{{ cs.getAttackBonus(attack) }}
              </span>
              <!-- Range -->
              <p-inputgroup>
                <p-inputnumber
                  [ngModel]="parseRange(attack.range)"
                  (ngModelChange)="updateAttackRange(i, $event)"
                  [showButtons]="false"
                  [min]="0"
                  [minFractionDigits]="0"
                  [maxFractionDigits]="1"
                  [inputStyle]="{ width: '2.5rem', textAlign: 'center', fontSize: '0.7rem' }"
                />
                <p-inputgroup-addon class="text-[0.6rem]">m</p-inputgroup-addon>
              </p-inputgroup>
              <!-- Damage Dice -->
              <p-inputMask
                [(ngModel)]="attack.damageDice"
                (ngModelChange)="updateAttacks()"
                mask="99w99"
                placeholder="1W8"
                [autoClear]="false"
                slotChar=" "
                [style]="{ width: '3.5rem', textAlign: 'center', fontSize: '0.7rem' }"
              />
              <!-- Damage Bonus (computed) -->
              <span class="font-bold text-slate-700" pTooltip="Schadensbonus = Attr.Mod + Mag." tooltipPosition="top">
                {{ cs.getDamageBonus(attack) >= 0 ? '+' : '' }}{{ cs.getDamageBonus(attack) }}
              </span>
              <!-- Damage Type -->
              <p-select
                [(ngModel)]="attack.damageType"
                (ngModelChange)="updateAttacks()"
                [options]="damageTypes"
                optionLabel="label"
                optionValue="value"
                [style]="{ width: '6rem', fontSize: '0.7rem' }"
                [filter]="true"
                filterBy="label"
                placeholder="Typ"
                appendTo="body"
              >
                <ng-template #selectedItem let-selectedOption>
                  <span class="text-xs">{{ selectedOption?.value }}</span>
                </ng-template>
              </p-select>
              <!-- Mastery -->
              <p-select
                [(ngModel)]="attack.mastery"
                (ngModelChange)="updateAttacks()"
                [options]="masteries"
                optionLabel="label"
                optionValue="value"
                [style]="{ width: '5.5rem', fontSize: '0.7rem' }"
                placeholder="--"
                appendTo="body"
              >
                <ng-template #selectedItem let-selectedOption>
                  <span class="text-xs">{{ selectedOption?.value || '--' }}</span>
                </ng-template>
                <ng-template #item let-option>
                  <span [pTooltip]="option.description" tooltipPosition="right">{{ option.label }}</span>
                </ng-template>
              </p-select>
              <!-- Magic Bonus -->
              <p-inputnumber
                [(ngModel)]="attack.magicBonus"
                (ngModelChange)="updateAttacks()"
                [showButtons]="false"
                [min]="0"
                [max]="5"
                [inputStyle]="{ width: '1.5rem', textAlign: 'center', fontSize: '0.7rem' }"
                pTooltip="Magischer Bonus"
                tooltipPosition="top"
              />
            </div>
            <!-- Row 3: Description -->
            <app-markdown-editor
              [value]="attack.description"
              (valueChange)="updateAttackDescription(i, $event)"
              placeholder="Beschreibung..."
              [minRows]="1"
            />
          </div>
        }
        <p-button label="Angriff hinzufügen" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addAttack()" />
      </div>
    </p-fieldset>
  `,
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
