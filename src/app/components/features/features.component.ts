import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { FieldsetModule } from 'primeng/fieldset';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, FieldsetModule, MarkdownEditorComponent],
  template: `
    <div class="space-y-3">
      <p-fieldset legend="Klassenmerkmale">
        <app-markdown-editor
          [value]="cs.character().featuresAndTraits"
          (valueChange)="cs.update({ featuresAndTraits: $event })"
          placeholder="Klassenmerkmale, Fähigkeiten und Talente..."
          [minRows]="10"
        />
      </p-fieldset>
      <p-fieldset legend="Volksmerkmale">
        <app-markdown-editor
          [value]="cs.character().racialTraits"
          (valueChange)="cs.update({ racialTraits: $event })"
          placeholder="Volksmerkmale und rassische Fähigkeiten..."
          [minRows]="6"
        />
      </p-fieldset>
      <p-fieldset legend="Sinne">
        <app-markdown-editor
          [value]="cs.character().senses"
          (valueChange)="cs.update({ senses: $event })"
          placeholder="Sinne (z.B. Dunkelsicht 18m, Passive Wahrnehmung)..."
          [minRows]="3"
        />
      </p-fieldset>
    </div>
  `,
})
export class FeaturesComponent {
  cs = inject(CharacterService);
}
