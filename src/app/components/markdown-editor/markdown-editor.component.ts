import {
  Component,
  input,
  output,
  signal,
  SecurityContext,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { TextareaModule } from 'primeng/textarea';
import { ClickOutside } from 'ngxtension/click-outside';
import { markedAccordionExtension } from '../../utils/marked-accordion-extension';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

marked.use(markedAccordionExtension());

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

  constructor(private sanitizer: DomSanitizer) {}

  renderedHtml(): SafeHtml {
    const val = this.value();
    if (!val) return '';
    const html = marked.parse(val, { async: false }) as string;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  onValueChange(newValue: string): void {
    this.valueChange.emit(newValue);
  }
}
