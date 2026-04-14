import { type MarkedExtension, type Tokens } from 'marked';
import { CharacterService } from '../services/character.service';
import { SKILL_LABELS } from '../models/character.model';

/**
 * Custom marked inline extension for character-value placeholders.
 *
 * Syntax:  {{key}}
 *
 * Supported keys (case-insensitive):
 *   Ability modifiers:  stä, ges, kon, int, wei, cha
 *   Combat / special:   üb, rk, br, ini, tp, maxtp, tw, zsg, zattk, lvl
 *   Skills (German):    e.g. "Arkane Kunde", "Heimlichkeit", …
 *
 * The extension tokenizes {{key}} during parsing and renders a safe text
 * marker (⟦PH:key⟧) that survives Angular's HTML sanitization.
 * Call `replacePlaceholderMarkers()` after sanitization to inject the
 * final tooltip HTML.
 *
 * Unknown keys are rendered as the original {{key}} text.
 */

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

const ABILITY_PLACEHOLDER_MAP: Record<string, string> = {
  'stä': 'str',
  'ges': 'dex',
  'kon': 'con',
  'int': 'int',
  'wei': 'wis',
  'cha': 'cha',
};

const ABILITY_TOOLTIP: Record<string, string> = {
  'stä': 'Stärke',
  'ges': 'Geschicklichkeit',
  'kon': 'Konstitution',
  'int': 'Intelligenz',
  'wei': 'Weisheit',
  'cha': 'Charisma',
};

const SPECIAL_TOOLTIP: Record<string, string> = {
  'üb': 'Übungsbonus',
  'rk': 'Rüstungsklasse',
  'br': 'Bewegungsrate',
  'ini': 'Initiative',
  'tp': 'Trefferpunkte',
  'maxtp': 'Maximale Trefferpunkte',
  'tw': 'Trefferwürfel',
  'zsg': 'Zauber-SG',
  'zattk': 'Zauberangriff',
  'lvl': 'Level',
};

/** Reverse map: German skill label (lowercase) → internal skill key. */
const SKILL_LABEL_TO_KEY: Record<string, string> = {};
for (const [key, label] of Object.entries(SKILL_LABELS)) {
  SKILL_LABEL_TO_KEY[label.toLowerCase()] = key;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function withTooltip(value: string, tooltip: string): string {
  return `<span title="${escapeHtml(tooltip)}" class="placeholder-value">${escapeHtml(value)}</span>`;
}

/**
 * Resolve a placeholder key to { value, tooltip } or null if unknown.
 */
function resolvePlaceholder(
  key: string,
  cs: CharacterService,
): { value: string; tooltip: string } | null {
  // 1. Ability modifiers
  const abilityKey = ABILITY_PLACEHOLDER_MAP[key];
  if (abilityKey) {
    return {
      value: formatModifier(cs.getAbilityModifier(abilityKey)),
      tooltip: ABILITY_TOOLTIP[key],
    };
  }

  // 2. Special / combat placeholders
  const char = cs.character();
  switch (key) {
    case 'üb':
      return { value: formatModifier(cs.getProficiencyBonus()), tooltip: SPECIAL_TOOLTIP[key] };
    case 'rk':
      return { value: String(cs.getComputedArmorClass()), tooltip: SPECIAL_TOOLTIP[key] };
    case 'br':
      return { value: String(char.speed), tooltip: SPECIAL_TOOLTIP[key] };
    case 'ini':
      return { value: formatModifier(cs.getInitiative()), tooltip: SPECIAL_TOOLTIP[key] };
    case 'tp':
      return { value: String(char.hitPointsCurrent), tooltip: SPECIAL_TOOLTIP[key] };
    case 'maxtp':
      return { value: String(char.hitPointsMax), tooltip: SPECIAL_TOOLTIP[key] };
    case 'tw':
      return { value: char.hitDiceTotal || '—', tooltip: SPECIAL_TOOLTIP[key] };
    case 'zsg':
      return { value: String(cs.getSpellSaveDC()), tooltip: SPECIAL_TOOLTIP[key] };
    case 'zattk':
      return { value: formatModifier(cs.getSpellAttackBonus()), tooltip: SPECIAL_TOOLTIP[key] };
    case 'lvl':
      return { value: String(cs.getLevel()), tooltip: SPECIAL_TOOLTIP[key] };
    default:
      break;
  }

  // 3. Skill modifiers by German label
  const skillKey = SKILL_LABEL_TO_KEY[key];
  if (skillKey) {
    return {
      value: formatModifier(cs.getSkillModifier(skillKey)),
      tooltip: SKILL_LABELS[skillKey] ?? key,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Marker format: ⟦PH:key⟧  (uses Unicode brackets to avoid collisions)
// ---------------------------------------------------------------------------

const MARKER_PREFIX = '\u27E6PH:';
const MARKER_SUFFIX = '\u27E7';
const MARKER_REGEX = /\u27E6PH:([^\u27E7]+)\u27E7/g;

/**
 * Creates a markedjs inline extension that tokenizes `{{key}}` placeholders
 * and renders safe text markers during parsing.
 *
 * The markers survive Angular's HTML sanitization and are later replaced
 * with tooltip HTML by `replacePlaceholderMarkers()`.
 */
export function markedPlaceholderExtension(): MarkedExtension {
  return {
    extensions: [
      {
        name: 'placeholder',
        level: 'inline' as const,
        start(src: string) {
          return src.indexOf('{{');
        },
        tokenizer(src: string) {
          const match = /^\{\{([^}]+)\}\}/.exec(src);
          if (!match) return undefined;
          return {
            type: 'placeholder',
            raw: match[0],
            key: match[1].trim().toLowerCase(),
          };
        },
        renderer(token: Tokens.Generic) {
          const key = token['key'] as string;
          // Emit a safe text marker that survives sanitization.
          return `${MARKER_PREFIX}${escapeHtml(key)}${MARKER_SUFFIX}`;
        },
      },
    ],
  };
}

/**
 * Replace placeholder markers (emitted by the marked extension) with
 * the actual tooltip HTML. Call this **after** Angular HTML sanitization.
 */
export function replacePlaceholderMarkers(html: string, cs: CharacterService): string {
  return html.replace(MARKER_REGEX, (_, key: string) => {
    const resolved = resolvePlaceholder(key, cs);
    if (resolved) {
      return withTooltip(resolved.value, resolved.tooltip);
    }
    // Unknown placeholder – render original syntax
    return escapeHtml(`{{${key}}}`);
  });
}
