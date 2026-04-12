import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-personality',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownEditorComponent],
  template: `
    <div class="space-y-2">
      <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
        <app-markdown-editor
          [value]="cs.character().personalityTraits"
          (valueChange)="cs.update({ personalityTraits: $event })"
          placeholder="Persönlichkeitsmerkmale..."
          [minRows]="3"
        />
        <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-1 border-t border-gray-200 pt-1">
          Persönlichkeitsmerkmale
        </div>
      </div>

      <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
        <app-markdown-editor
          [value]="cs.character().ideals"
          (valueChange)="cs.update({ ideals: $event })"
          placeholder="Ideale..."
          [minRows]="2"
        />
        <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-1 border-t border-gray-200 pt-1">
          Ideale
        </div>
      </div>

      <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
        <app-markdown-editor
          [value]="cs.character().bonds"
          (valueChange)="cs.update({ bonds: $event })"
          placeholder="Bindungen..."
          [minRows]="2"
        />
        <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-1 border-t border-gray-200 pt-1">
          Bindungen
        </div>
      </div>

      <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
        <app-markdown-editor
          [value]="cs.character().flaws"
          (valueChange)="cs.update({ flaws: $event })"
          placeholder="Makel..."
          [minRows]="2"
        />
        <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-1 border-t border-gray-200 pt-1">
          Makel
        </div>
      </div>
    </div>
  `,
})
export class PersonalityComponent {
  cs = inject(CharacterService);
}
