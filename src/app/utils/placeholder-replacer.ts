import { CharacterService } from '../services/character.service';
import { SKILL_LABELS } from '../models/character.model';

/**
 * Maps German short-form placeholder keys (lowercase) to ability keys
 * used in CharacterService.
 */
const ABILITY_PLACEHOLDER_MAP: Record<string, string> = {
  'stä': 'str',
  'ges': 'dex',
  'kon': 'con',
  'int': 'int',
  'wei': 'wis',
  'cha': 'cha',
};

/** Full German labels for ability placeholders (used in tooltips). */
const ABILITY_TOOLTIP: Record<string, string> = {
  'stä': 'Stärke',
  'ges': 'Geschicklichkeit',
  'kon': 'Konstitution',
  'int': 'Intelligenz',
  'wei': 'Weisheit',
  'cha': 'Charisma',
};

/** Tooltip labels for special (non-ability, non-skill) placeholders. */
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
};

/**
 * Reverse map: German skill label (lowercase) → internal skill key.
 * Built once from the canonical SKILL_LABELS export.
 */
const SKILL_LABEL_TO_KEY: Record<string, string> = {};
for (const [key, label] of Object.entries(SKILL_LABELS)) {
  SKILL_LABEL_TO_KEY[label.toLowerCase()] = key;
}

/** Format a numeric modifier with explicit sign: +3, -1, +0. */
function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

/** Escape special characters for safe insertion into HTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Wrap a resolved value in a <span> with a tooltip. */
function withTooltip(value: string, tooltip: string): string {
  return `<span title="${escapeHtml(tooltip)}" class="placeholder-value">${escapeHtml(value)}</span>`;
}

/**
 * Resolve a single placeholder key against the current character state.
 * Returns the HTML snippet (with tooltip) or `null` if the key is unknown.
 */
function resolvePlaceholder(key: string, cs: CharacterService): string | null {
  // 1. Ability modifiers
  const abilityKey = ABILITY_PLACEHOLDER_MAP[key];
  if (abilityKey) {
    return withTooltip(
      formatModifier(cs.getAbilityModifier(abilityKey)),
      ABILITY_TOOLTIP[key],
    );
  }

  // 2. Special / combat placeholders
  const char = cs.character();
  switch (key) {
    case 'üb':
      return withTooltip(formatModifier(cs.getProficiencyBonus()), SPECIAL_TOOLTIP[key]);
    case 'rk':
      return withTooltip(String(cs.getComputedArmorClass()), SPECIAL_TOOLTIP[key]);
    case 'br':
      return withTooltip(String(char.speed), SPECIAL_TOOLTIP[key]);
    case 'ini':
      return withTooltip(formatModifier(cs.getInitiative()), SPECIAL_TOOLTIP[key]);
    case 'tp':
      return withTooltip(String(char.hitPointsCurrent), SPECIAL_TOOLTIP[key]);
    case 'maxtp':
      return withTooltip(String(char.hitPointsMax), SPECIAL_TOOLTIP[key]);
    case 'tw':
      return withTooltip(char.hitDiceTotal || '—', SPECIAL_TOOLTIP[key]);
    case 'zsg':
      return withTooltip(String(cs.getSpellSaveDC()), SPECIAL_TOOLTIP[key]);
    case 'zattk':
      return withTooltip(formatModifier(cs.getSpellAttackBonus()), SPECIAL_TOOLTIP[key]);
    default:
      break;
  }

  // 3. Skill modifiers by German label (e.g. "arkane kunde" → arcana)
  const skillKey = SKILL_LABEL_TO_KEY[key];
  if (skillKey) {
    const label = SKILL_LABELS[skillKey] ?? key;
    return withTooltip(formatModifier(cs.getSkillModifier(skillKey)), label);
  }

  return null;
}

/**
 * Replace all `{{placeholder}}` tokens in the given text with the
 * corresponding character values (wrapped in a tooltip span).
 *
 * Unknown placeholders are left unchanged.
 */
export function replacePlaceholders(text: string, cs: CharacterService): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder: string) => {
    const key = placeholder.trim().toLowerCase();
    return resolvePlaceholder(key, cs) ?? match;
  });
}
