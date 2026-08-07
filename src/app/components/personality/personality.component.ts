import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-personality',
  templateUrl: './personality.component.html',
  styleUrl: './personality.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Fieldset, MarkdownEditorComponent],
})
export class PersonalityComponent {
  cs = inject(CharacterService);
}
