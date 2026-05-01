import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  SecurityContext,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Marked } from 'marked';
import { Textarea } from 'primeng/textarea';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';
import { markedAccordionExtension } from '../../utils/marked-accordion-extension';
import { markedPlaceholderExtension } from '../../utils/placeholder-replacer';

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Textarea],
})
export class MarkdownEditorComponent {
  value = input<string>('');
  placeholder = input<string>('');
  minRows = input<number>(3);
  readonly = input<boolean>(false);
  valueChange = output<string>();

  protected readonly editMode = inject(EditModeService);

  private readonly sanitizer = inject(DomSanitizer);
  private readonly cs = inject(CharacterService);
  private readonly marked = new Marked(
    markedAccordionExtension(),
    markedPlaceholderExtension(this.cs),
  );

  renderedHtml(): SafeHtml {
    let val = this.value();
    if (!val) return '';
    val = val.replace(/\n(?=\n)/g, '\n\n<br/>\n');
    const html = this.marked.parse(val, { async: false, gfm: true, breaks: true }) as string;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  onValueChange(newValue: string): void {
    this.valueChange.emit(newValue);
  }
}
