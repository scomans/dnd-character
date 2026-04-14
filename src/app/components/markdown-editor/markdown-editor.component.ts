import { NgClass } from '@angular/common';
import { Component, inject, input, output, SecurityContext, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Marked } from 'marked';
import { ClickOutside } from 'ngxtension/click-outside';
import { Button } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import { markedAccordionExtension } from '../../utils/marked-accordion-extension';
import { markedPlaceholderExtension, replacePlaceholderMarkers } from '../../utils/placeholder-replacer';

@Component({
  selector: 'app-markdown-editor',
  imports: [FormsModule, NgClass, TextareaModule, ClickOutside, Button, Tooltip],
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.scss',
})
export class MarkdownEditorComponent {
  value = input<string>('');
  placeholder = input<string>('');
  minRows = input<number>(3);
  readonly = input<boolean>(false);
  valueChange = output<string>();

  editing = signal(false);

  private sanitizer = inject(DomSanitizer);
  private cs = inject(CharacterService);
  private marked = new Marked(markedAccordionExtension(), markedPlaceholderExtension());

  renderedHtml(): SafeHtml {
    let val = this.value();
    if (!val) return '';
    val = val.replace(/\n(?=\n)/g, '\n\n<br/>\n');
    const html = this.marked.parse(val, { async: false, gfm: true, breaks: true }) as string;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    const withPlaceholders = replacePlaceholderMarkers(sanitized, this.cs);
    return this.sanitizer.bypassSecurityTrustHtml(withPlaceholders);
  }

  onValueChange(newValue: string): void {
    this.valueChange.emit(newValue);
  }
}
