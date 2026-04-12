import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, MarkdownEditorComponent],
  template: `
    <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
      <app-markdown-editor
        [value]="cs.character().featuresAndTraits"
        (valueChange)="cs.update({ featuresAndTraits: $event })"
        placeholder="Klassenmerkmale, Fähigkeiten und Talente..."
        [minRows]="10"
      />
      <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-2 border-t border-gray-200 pt-1">
        Klassenmerkmale
      </div>
    </div>
  `,
})
export class FeaturesComponent {
  cs = inject(CharacterService);
}
