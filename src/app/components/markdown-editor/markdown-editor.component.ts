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
import { markedAccordionExtension } from '../../utils/marked-accordion-extension';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

marked.use(markedAccordionExtension());

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [FormsModule, TextareaModule, ClickOutside, Button, Tooltip],
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
        class="relative group min-h-8 p-1 border border-transparent rounded hover:border-slate-400/30 hover:bg-slate-50 dark:hover:bg-gray-700 text-sm leading-snug whitespace-pre-wrap break-words markdown-content"
        [class.text-gray-400]="!value()"
        [class.italic]="!value()"
      >
        <p-button
          class="absolute top-1 right-1"
          [icon]="editing() ? 'pi pi-check' : 'pi pi-pencil'"
          [rounded]="true"
          [text]="true"
          size="small"
          (onClick)="editing.set(true)"
          [pTooltip]="'Bearbeiten'"
          tooltipPosition="top"
        />
        @if (value()) {
          <span [innerHTML]="renderedHtml()"></span>
        } @else {
          <button
            type="button"
            class="text-gray-400 dark:text-gray-500 italic text-xs cursor-pointer bg-transparent border-none p-0"
            (click)="editing.set(true)"
          >Klicken zum Bearbeiten...
          </button>
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
