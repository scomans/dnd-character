import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck as fasCheck, faPencil as fasPencil } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-proficiencies-languages',
  imports: [
    Button,
    Checkbox,
    FaIconComponent,
    Fieldset,
    FormsModule,
    InputText,
    MarkdownEditorComponent,
    Tooltip,
  ],
  templateUrl: './proficiencies-languages.component.html',
  styleUrl: './proficiencies-languages.component.scss',
})
export class ProficienciesLanguagesComponent {
  cs = inject(CharacterService);
  editing = signal(false);

  protected readonly fasCheck = fasCheck;
  protected readonly fasPencil = fasPencil;

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
