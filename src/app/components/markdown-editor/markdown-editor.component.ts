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
        class="w-full markdown-textarea"
        [placeholder]="placeholder()"
      ></textarea>
    } @else {
      <div
        class="markdown-display"
        [class.empty]="!value()"
        (click)="editing.set(true)"
        [innerHTML]="renderedHtml()"
      ></div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .markdown-display {
        cursor: pointer;
        min-height: 2em;
        padding: 0.25rem;
        border: 1px solid transparent;
        border-radius: 4px;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-size: 0.85rem;
        line-height: 1.3;
      }
      .markdown-display:hover {
        border-color: var(--p-primary-color, #6366f1);
        background-color: rgba(99, 102, 241, 0.05);
      }
      .markdown-display.empty {
        color: #999;
        font-style: italic;
      }
      .markdown-display.empty::after {
        content: 'Klicken zum Bearbeiten...';
      }
      .markdown-textarea {
        width: 100%;
        font-size: 0.85rem;
      }
      :host ::ng-deep .markdown-display p {
        margin: 0 0 0.3em 0;
      }
      :host ::ng-deep .markdown-display p:last-child {
        margin-bottom: 0;
      }
      :host ::ng-deep .markdown-display ul,
      :host ::ng-deep .markdown-display ol {
        margin: 0 0 0.3em 0;
        padding-left: 1.2em;
      }
    `,
  ],
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
