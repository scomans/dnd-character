import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-proficiencies-languages',
  imports: [FormsModule, InputTextModule, CheckboxModule, ButtonModule, FieldsetModule, TooltipModule, MarkdownEditorComponent],
  templateUrl: './proficiencies-languages.component.html',
  styleUrl: './proficiencies-languages.component.scss',
})
export class ProficienciesLanguagesComponent {
  cs = inject(CharacterService);
  editing = signal(false);

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
