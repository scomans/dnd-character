import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { FieldsetModule } from 'primeng/fieldset';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-personality',
  imports: [FormsModule, FieldsetModule, MarkdownEditorComponent],
  templateUrl: './personality.component.html',
  styleUrl: './personality.component.scss',
})
export class PersonalityComponent {
  cs = inject(CharacterService);
}
