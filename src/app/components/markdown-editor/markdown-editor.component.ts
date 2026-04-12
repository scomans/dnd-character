import {
  Component,
  input,
  output,
  signal,
  SecurityContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, TextareaModule],
  template: `
    @if (editing()) {
      <textarea
        pTextarea
        [autoResize]="true"
        [rows]="minRows()"
        [ngModel]="value()"
        (ngModelChange)="onValueChange($event)"
        (blur)="editing.set(false)"
        class="w-full text-sm"
        [placeholder]="placeholder()"
      ></textarea>
    } @else {
      <div
        class="cursor-pointer min-h-8 p-1 border border-transparent rounded hover:border-amber-600/30 hover:bg-amber-50 text-sm leading-snug whitespace-pre-wrap break-words markdown-content"
        [class.text-gray-400]="!value()"
        [class.italic]="!value()"
        (click)="editing.set(true)"
        [innerHTML]="renderedHtml()"
      ></div>
      @if (!value()) {
        <span class="text-gray-400 italic text-xs" (click)="editing.set(true)">Klicken zum Bearbeiten...</span>
      }
    }
  `,
})
export class MarkdownEditorComponent {
  value = input<string>('');
  placeholder = input<string>('');
  minRows = input<number>(3);
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

