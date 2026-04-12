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
    <p-fieldset legend="Klassenmerkmale">
      <app-markdown-editor
        [value]="cs.character().featuresAndTraits"
        (valueChange)="cs.update({ featuresAndTraits: $event })"
        placeholder="Klassenmerkmale, Fähigkeiten und Talente..."
        [minRows]="10"
      />
    </p-fieldset>
  `,
})
export class FeaturesComponent {
  cs = inject(CharacterService);
}
