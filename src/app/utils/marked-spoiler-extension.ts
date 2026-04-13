import { type MarkedExtension, type TokenizerAndRendererExtension, marked } from 'marked';

/**
 * Custom marked extension for spoiler/expandable text blocks.
 *
 * Syntax:
 *   :::spoiler Title text
 *   Hidden content (supports **markdown**)
 *   :::
 *
 * Renders as an HTML <details>/<summary> element for native expand/collapse.
 */
export function markedSpoilerExtension(): MarkedExtension {
  const spoilerBlock: TokenizerAndRendererExtension = {
    name: 'spoiler',
    level: 'block',
    start(src: string) {
      return src.match(/^:::spoiler/m)?.index;
    },
    tokenizer(src: string) {
      const match = src.match(
        /^:::spoiler(?:[^\S\r\n]+([^\n]*))?\n([\s\S]*?)\n:::\s*(?:\n|$)/,
      );
      if (!match) return undefined;

      return {
        type: 'spoiler',
        raw: match[0],
        title: (match[1] ?? 'Spoiler').trim(),
        body: match[2].trim(),
      };
    },
    renderer(token) {
      // @ts-expect-error marked extension token typing
      const title: string = token.title;
      // @ts-expect-error marked extension token typing
      const body: string = token.body;
      const renderedBody = marked.parse(body, { async: false }) as string;
      return `<details class="spoiler"><summary>${title}</summary><div class="spoiler-content">${renderedBody}</div></details>`;
    },
  };

  return {
    extensions: [spoilerBlock],
  };
}
