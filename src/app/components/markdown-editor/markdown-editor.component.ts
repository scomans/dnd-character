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
import { ClickOutside } from 'ngxtension/click-outside';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [FormsModule, TextareaModule, ClickOutside],
  template: `
    @if (editing()) {
      <div (clickOutside)="editing.set(false)">
        <textarea
          pTextarea
          [autoResize]="true"
          [rows]="minRows()"
          [ngModel]="value()"
          (ngModelChange)="onValueChange($event)"
          class="w-full text-sm"
          [placeholder]="placeholder()"
        ></textarea>
      </div>
    } @else {
      <div
        class="cursor-pointer min-h-8 p-1 border border-transparent rounded hover:border-slate-400/30 hover:bg-slate-50 text-sm leading-snug whitespace-pre-wrap break-words markdown-content"
        [class.text-gray-400]="!value()"
        [class.italic]="!value()"
        (click)="editing.set(true)"
      >
        @if (value()) {
          <span [innerHTML]="renderedHtml()"></span>
        } @else {
          <span class="text-gray-400 italic text-xs">Klicken zum Bearbeiten...</span>
        }
      </div>
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
