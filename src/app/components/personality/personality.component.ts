import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { FieldsetModule } from 'primeng/fieldset';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-personality',
  standalone: true,
  imports: [CommonModule, FormsModule, FieldsetModule, MarkdownEditorComponent],
  template: `
    <div class="space-y-2">
      <p-fieldset legend="Persönlichkeitsmerkmale">
        <app-markdown-editor
          [value]="cs.character().personalityTraits"
          (valueChange)="cs.update({ personalityTraits: $event })"
          placeholder="Persönlichkeitsmerkmale..."
          [minRows]="3"
        />
      </p-fieldset>

      <p-fieldset legend="Ideale">
        <app-markdown-editor
          [value]="cs.character().ideals"
          (valueChange)="cs.update({ ideals: $event })"
          placeholder="Ideale..."
          [minRows]="2"
        />
      </p-fieldset>

      <p-fieldset legend="Bindungen">
        <app-markdown-editor
          [value]="cs.character().bonds"
          (valueChange)="cs.update({ bonds: $event })"
          placeholder="Bindungen..."
          [minRows]="2"
        />
      </p-fieldset>

      <p-fieldset legend="Makel">
        <app-markdown-editor
          [value]="cs.character().flaws"
          (valueChange)="cs.update({ flaws: $event })"
          placeholder="Makel..."
          [minRows]="2"
        />
      </p-fieldset>
    </div>
  `,
})
export class PersonalityComponent {
  cs = inject(CharacterService);
}
