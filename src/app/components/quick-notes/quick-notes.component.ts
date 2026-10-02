import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { Textarea } from '@openng/optimus-ui/textarea';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-quick-notes',
  templateUrl: './quick-notes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Fieldset, Textarea],
})
export class QuickNotesComponent {
  cs = inject(CharacterService);
}
