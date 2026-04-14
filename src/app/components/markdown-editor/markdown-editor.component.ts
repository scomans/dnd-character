import { NgClass } from '@angular/common';
import { Component, input, output, SecurityContext, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ClickOutside } from 'ngxtension/click-outside';
import { Button } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { markedAccordionExtension } from '../../utils/marked-accordion-extension';


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
    let val = this.value();
    if (!val) return '';
    val = val.replace(/\n(?=\n)/g, '\n\n<br/>\n');
    const html = marked.parse(val, { async: false, gfm: true, breaks: true }) as string;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  onValueChange(newValue: string): void {
    this.valueChange.emit(newValue);
  }
}
