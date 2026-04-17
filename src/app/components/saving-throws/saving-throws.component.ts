import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck as fasCheck, faPencil as fasPencil } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Fieldset } from 'primeng/fieldset';
import { Tooltip } from 'primeng/tooltip';
import { ABILITY_SHORT_LABELS } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-saving-throws',
  imports: [FormsModule, Checkbox, Button, Fieldset, Tooltip, FaIconComponent],
  templateUrl: './saving-throws.component.html',
  styleUrl: './saving-throws.component.scss',
})
export class SavingThrowsComponent {
  cs = inject(CharacterService);
  abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  editing = signal(false);

  protected readonly fasCheck = fasCheck;
  protected readonly fasPencil = fasPencil;

  private abilityLabels: Record<string, string> = {
    str: 'Stärke',
    dex: 'Geschicklichkeit',
    con: 'Konstitution',
    int: 'Intelligenz',
    wis: 'Weisheit',
    cha: 'Charisma',
  };

  getLabel(ability: string): string {
    return this.abilityLabels[ability] || ability;
  }

  getShort(ability: string): string {
    return ABILITY_SHORT_LABELS[ability] || ability;
  }

  isProficient(ability: string): boolean {
    const char = this.cs.character();
    return (
      (char.savingThrows as Record<string, { proficient: boolean }>)[ability]?.proficient ?? false
    );
  }

  toggleProficiency(ability: string, value: boolean): void {
    const char = this.cs.character();
    const savingThrows = { ...char.savingThrows, [ability]: { proficient: value } };
    this.cs.update({ savingThrows });
  }
}
