import { type MarkedExtension, type Tokens } from 'marked';

/**
 * Custom marked extension for accordion/expandable text blocks.
 * Syntax is compatible with @fsegurai/marked-extended-accordion for future migration.
 *
 * Syntax:
 *   ::::accordion{title="Section Title" expanded="true"}
 *   Hidden content that supports **markdown**
 *   ::::accordionend
 *
 * Aliases for start: `:accordion`, `:acd`
 * Aliases for end:   `:accordionend`, `:acdend`
 *
 * Parameters:
 *   - title:    Header text (default: "Details")
 *   - expanded: Whether open by default ("true"/"false", default: "false")
 *
 * Renders as native HTML <details>/<summary> for expand/collapse.
 */

const START_TAGS = [':accordion', ':acd', ':spoiler', '++++'];
const END_TAGS = [':accordionend', ':acdend', ':spoilerend', '++++'];

const PROP_REGEX = /\s*(\w+)="([^"]+)"/g;

interface AccordionProps {
  title: string;
  expanded: boolean;
}

function parseProps(propString: string): AccordionProps {
  const props: AccordionProps = { title: 'Details', expanded: false };
  let match: RegExpExecArray | null;
  PROP_REGEX.lastIndex = 0;
  while ((match = PROP_REGEX.exec(propString)) !== null) {
    const [, key, value] = match;
    if (key === 'title') props.title = value;
    if (key === 'expanded') props.expanded = value === 'true';
  }
  return props;
}

function matchAccordionBlock(
  src: string,
): [raw: string, propString: string, content: string] | null {
  // Find which start tag matches at position 0
  let startTag = '';
  for (const tag of START_TAGS) {
    if (src.startsWith(tag)) {
      startTag = tag;
      break;
    }
  }
  if (!startTag) return null;

  // Expect a props block `{...}` right after the start tag
  const afterTag = src.substring(startTag.length);
  const braceOpen = afterTag.indexOf('{');
  if (braceOpen !== 0) return null;
  const braceClose = afterTag.indexOf('}');
  if (braceClose === -1) return null;

  const propString = afterTag.substring(0, braceClose + 1);
  const contentStart = startTag.length + braceClose + 1;

  // Find the matching end tag, supporting nesting
  let depth = 1;
  let pos = contentStart;
  while (pos < src.length && depth > 0) {
    // Check for nested start tags
    let nearestStart = -1;
    let nearestStartLen = 0;
    for (const tag of START_TAGS) {
      const idx = src.indexOf(tag, pos);
      if (idx !== -1 && (nearestStart === -1 || idx < nearestStart)) {
        nearestStart = idx;
        nearestStartLen = tag.length;
      }
    }

    // Check for end tags
    let nearestEnd = -1;
    let nearestEndLen = 0;
    for (const tag of END_TAGS) {
      const idx = src.indexOf(tag, pos);
      if (idx !== -1 && (nearestEnd === -1 || idx < nearestEnd)) {
        nearestEnd = idx;
        nearestEndLen = tag.length;
      }
    }

    if (nearestEnd === -1) return null; // No closing tag found.

    if (nearestStart !== -1 && nearestStart < nearestEnd) {
      depth++;
      pos = nearestStart + nearestStartLen;
    } else {
      depth--;
      if (depth === 0) {
        const content = src.substring(contentStart, nearestEnd);
        const raw = src.substring(0, nearestEnd + nearestEndLen);
        return [raw, propString, content];
      }
      pos = nearestEnd + nearestEndLen;
    }
  }

  return null;
}

export function markedAccordionExtension(): MarkedExtension {
  return {
    extensions: [
      {
        name: 'accordion',
        level: 'block' as const,
        start(src: string) {
          for (const tag of START_TAGS) {
            const idx = src.indexOf(tag);
            if (idx !== -1) return idx;
          }
          return -1;
        },
        tokenizer(src: string) {
          const result = matchAccordionBlock(src);
          if (!result) return undefined;

          const [raw, propString, content] = result;
          const props = parseProps(propString);

          return {
            type: 'accordion',
            raw,
            title: props.title,
            expanded: props.expanded,
            tokens: this.lexer.blockTokens(content.trim()),
          };
        },
        renderer(token: Tokens.Generic) {
          const title = token['title'] as string;
          const expanded = token['expanded'] as boolean;
          const tokens = token['tokens'] as Tokens.Generic[];
          const renderedBody = (
            this as unknown as { parser: { parse(tokens: Tokens.Generic[]): string } }
          ).parser.parse(tokens);
          const openAttr = expanded ? ' open' : '';
          return (
            `<details class="accordion"${openAttr}>` +
            `<summary class="accordion-header">${title}</summary>` +
            `<div class="accordion-content">${renderedBody}</div>` +
            `</details>`
          );
        },
      },
    ],
  };
}
