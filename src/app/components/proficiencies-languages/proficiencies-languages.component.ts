import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-proficiencies-languages',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, CheckboxModule, MarkdownEditorComponent],
  template: `
    <div class="bg-white border-2 border-amber-800 rounded-lg p-2 space-y-3">
      <!-- Armor Proficiencies -->
      <div>
        <span class="text-[0.65rem] font-bold uppercase text-gray-600">Rüstung</span>
        <div class="flex flex-wrap gap-3 mt-1">
          <label class="flex items-center gap-1 text-xs">
            <p-checkbox [ngModel]="cs.character().armorProficiencies.light" (ngModelChange)="updateArmor('light', $event)" [binary]="true" />
            Leichte
          </label>
          <label class="flex items-center gap-1 text-xs">
            <p-checkbox [ngModel]="cs.character().armorProficiencies.medium" (ngModelChange)="updateArmor('medium', $event)" [binary]="true" />
            Mittlere
          </label>
          <label class="flex items-center gap-1 text-xs">
            <p-checkbox [ngModel]="cs.character().armorProficiencies.heavy" (ngModelChange)="updateArmor('heavy', $event)" [binary]="true" />
            Schwere
          </label>
          <label class="flex items-center gap-1 text-xs">
            <p-checkbox [ngModel]="cs.character().armorProficiencies.shields" (ngModelChange)="updateArmor('shields', $event)" [binary]="true" />
            Schilde
          </label>
        </div>
      </div>

      <!-- Weapon Proficiencies -->
      <div>
        <span class="text-[0.65rem] font-bold uppercase text-gray-600">Waffen</span>
        <div class="flex flex-wrap gap-3 mt-1">
          <label class="flex items-center gap-1 text-xs">
            <p-checkbox [ngModel]="cs.character().weaponProficiencies.simple" (ngModelChange)="updateWeapon('simple', $event)" [binary]="true" />
            Einfache
          </label>
          <label class="flex items-center gap-1 text-xs">
            <p-checkbox [ngModel]="cs.character().weaponProficiencies.martial" (ngModelChange)="updateWeapon('martial', $event)" [binary]="true" />
            Kriegswaffen
          </label>
        </div>
        <div class="mt-1 flex items-center gap-1 text-xs">
          <span>Sonstige Waffen:</span>
          <input pInputText [ngModel]="cs.character().weaponProficiencies.other" (ngModelChange)="updateWeaponOther($event)" class="flex-1 text-xs" />
        </div>
      </div>

      <!-- Languages -->
      <div>
        <span class="text-[0.65rem] font-bold uppercase text-gray-600">Sprachen</span>
        <app-markdown-editor
          [value]="cs.character().languages"
          (valueChange)="cs.update({ languages: $event })"
          placeholder="Sprachen..."
          [minRows]="2"
        />
      </div>

      <!-- Tools & Other -->
      <div>
        <span class="text-[0.65rem] font-bold uppercase text-gray-600">Werkzeuge & Andere</span>
        <app-markdown-editor
          [value]="cs.character().toolsAndOther"
          (valueChange)="cs.update({ toolsAndOther: $event })"
          placeholder="Werkzeuge..."
          [minRows]="2"
        />
      </div>

      <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center border-t border-gray-200 pt-1">
        Übung und Sprachen
      </div>
    </div>
  `,
})
export class ProficienciesLanguagesComponent {
  cs = inject(CharacterService);

  updateArmor(key: string, value: boolean): void {
    const char = this.cs.character();
    this.cs.update({
      armorProficiencies: { ...char.armorProficiencies, [key]: value },
    });
  }

  updateWeapon(key: string, value: boolean): void {
    const char = this.cs.character();
    this.cs.update({
      weaponProficiencies: { ...char.weaponProficiencies, [key]: value },
    });
  }

  updateWeaponOther(value: string): void {
    const char = this.cs.character();
    this.cs.update({
      weaponProficiencies: { ...char.weaponProficiencies, other: value },
    });
  }
}
