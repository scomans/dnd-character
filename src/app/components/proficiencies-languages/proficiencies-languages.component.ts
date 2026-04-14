import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputText } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { Tooltip } from 'primeng/tooltip';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-proficiencies-languages',
  imports: [FormsModule, InputText, Checkbox, Button, Fieldset, Tooltip, MarkdownEditorComponent],
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
