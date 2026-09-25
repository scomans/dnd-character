import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  SecurityContext,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Textarea } from '@openng/optimus-ui/textarea';
import { Marked } from 'marked';
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

  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('ta');
  private preInputScrollTop = 0;

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

  /**
   * The autoResize directive briefly collapses the textarea to measure its
   * scrollHeight on every keystroke. If the content is taller than the
   * viewport, that collapse shrinks the scrollable area below the current
   * scroll position, so the browser clamps scrollTop down and never restores
   * it. Capture the position beforehand so it can be corrected afterwards.
   */
  onBeforeInput(): void {
    const scrollParent = this.getScrollParent();
    this.preInputScrollTop = scrollParent?.scrollTop ?? 0;
  }

  onInput(): void {
    const scrollParent = this.getScrollParent();
    if (!scrollParent) return;
    const capturedScrollTop = this.preInputScrollTop;
    requestAnimationFrame(() => {
      const maxScrollTop = scrollParent.scrollHeight - scrollParent.clientHeight;
      if (scrollParent.scrollTop < capturedScrollTop && capturedScrollTop <= maxScrollTop) {
        scrollParent.scrollTop = capturedScrollTop;
      }
    });
  }

  private getScrollParent(): HTMLElement | null {
    let el: HTMLElement | null = this.textareaRef()?.nativeElement ?? null;
    while (el) {
      const style = getComputedStyle(el);
      if (
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        el.scrollHeight > el.clientHeight
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return document.scrollingElement as HTMLElement | null;
  }
}
