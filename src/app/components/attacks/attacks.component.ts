import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { Attack, DAMAGE_TYPES } from '../../models/character.model';

@Component({
  selector: 'app-attacks',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, CheckboxModule, ButtonModule, SelectModule, MarkdownEditorComponent],
  template: `
    <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
      <!-- Attacks Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="text-left p-1">Angriff</th>
              <th class="p-1">ÜB</th>
              <th class="p-1">ATTR</th>
              <th class="p-1">Reichweite</th>
              <th class="p-1">Bonus</th>
              <th class="p-1">Schaden</th>
              <th class="p-1">+</th>
              <th class="text-left p-1">Schadentyp</th>
              <th class="p-1"></th>
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
                    [style]="{ width: '5rem', fontSize: '0.75rem' }"
                  />
                </td>
                <td class="p-1">
                  <input pInputText [(ngModel)]="attack.range" (ngModelChange)="updateAttacks()" class="w-14 text-xs text-center" />
                </td>
                <td class="p-1 text-center font-bold text-amber-900">
                  {{ cs.getAttackBonus(attack) >= 0 ? '+' : '' }}{{ cs.getAttackBonus(attack) }}
                </td>
                <td class="p-1">
                  <input pInputText [(ngModel)]="attack.damageDice" (ngModelChange)="updateAttacks()" class="w-14 text-xs text-center" />
                </td>
                <td class="p-1 text-center font-bold text-amber-900">
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
                  />
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
      <div class="flex gap-2 mt-2">
        <p-button label="Angriff hinzufügen" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addAttack()" />
      </div>
      <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-2 border-t border-gray-200 pt-1">
        Waffen & Angriffszauber
      </div>
    </div>
  `,
})
export class AttacksComponent {
  cs = inject(CharacterService);

  damageTypes = DAMAGE_TYPES;

  abilityOptions = [
    { label: 'Stä', value: 'str' },
    { label: 'Ges', value: 'dex' },
    { label: 'Kon', value: 'con' },
    { label: 'Int', value: 'int' },
    { label: 'Wei', value: 'wis' },
    { label: 'Cha', value: 'cha' },
  ];

  addAttack(): void {
    const char = this.cs.character();
    const attacks = [...char.attacks, {
      name: '',
      proficient: true,
      attribute: 'str',
      range: '1,5m',
      damageDice: '1d8',
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
