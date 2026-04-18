import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  SecurityContext,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Marked } from 'marked';
import { ClickOutside } from 'ngxtension/click-outside';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import { markedAccordionExtension } from '../../utils/marked-accordion-extension';
import { markedPlaceholderExtension } from '../../utils/placeholder-replacer';
import { faCheck, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, FormsModule, NgClass, Textarea, ClickOutside, Button, Tooltip],
})
export class MarkdownEditorComponent {
  value = input<string>('');
  placeholder = input<string>('');
  minRows = input<number>(3);
  readonly = input<boolean>(false);
  valueChange = output<string>();

  editing = signal(false);

  public readonly fasCheck = faCheck;
  public readonly fasPencil = faPencil;

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
