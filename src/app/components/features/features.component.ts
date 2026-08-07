import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CharacterService } from '../../services/character.service';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Fieldset, MarkdownEditorComponent],
})
export class FeaturesComponent {
  cs = inject(CharacterService);
}
