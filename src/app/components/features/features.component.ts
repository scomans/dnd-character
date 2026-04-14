import { Component, inject } from '@angular/core';
import { CharacterService } from '../../services/character.service';
import { Fieldset } from 'primeng/fieldset';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-features',
  imports: [Fieldset, MarkdownEditorComponent],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  cs = inject(CharacterService);
}
