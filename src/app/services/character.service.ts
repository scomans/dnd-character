import { Injectable, signal, computed, effect } from '@angular/core';
import {
  DndCharacter,
  createDefaultCharacter,
  SKILL_ABILITY_MAP,
} from '../models/character.model';

const STORAGE_KEY = 'dnd-character-data';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  readonly character = signal<DndCharacter>(this.loadCharacter());

  constructor() {
    // Auto-save to localStorage whenever character changes
    effect(() => {
      const char = this.character();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(char));
      } catch (e) {
        // If quota exceeded (e.g. large images), try saving without images
        console.warn('localStorage quota exceeded, saving without images:', e);
        try {
          const slim = { ...char, characterImage: '', organizationLogo: '' };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
        } catch {
          // Ignore further errors
        }
      }
    });
  }

  private loadCharacter(): DndCharacter {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old classAndLevel field to className + level
        if (parsed.classAndLevel && !parsed.className) {
          const match = parsed.classAndLevel.match(/^(.*?)\s*(\d+)$/);
          if (match) {
            parsed.className = match[1].trim();
            parsed.level = parseInt(match[2], 10);
          } else {
            parsed.className = parsed.classAndLevel;
            parsed.level = 1;
          }
          delete parsed.classAndLevel;
        }
        // Merge with defaults to handle new fields added in future versions
        return { ...createDefaultCharacter(), ...parsed };
      }
    } catch {
      // ignore parse errors
    }
    return createDefaultCharacter();
  }

  update(partial: Partial<DndCharacter>): void {
    this.character.update((c) => ({ ...c, ...partial }));
  }

  updateNested<K extends keyof DndCharacter>(
    key: K,
    value: DndCharacter[K]
  ): void {
    this.character.update((c) => ({ ...c, [key]: value }));
  }

  // === Computed Values (DND 2024 5E Rules) ===

  /** Extract numeric level from the level field */
  getLevel(): number {
    return this.character().level || 1;
  }

  /** Proficiency bonus based on level (DND 5E 2024), or override */
  getProficiencyBonus(): number {
    const char = this.character();
    if (char.proficiencyBonusOverride != null) {
      return char.proficiencyBonusOverride;
    }
    const level = this.getLevel();
    return Math.floor((level - 1) / 4) + 2;
  }

  /** Ability modifier = floor((score - 10) / 2) */
  getAbilityModifier(ability: string): number {
    const char = this.character();
    const score = (char.abilities as Record<string, { base: number }>)[ability]
      ?.base;
    if (score === undefined) return 0;
    return Math.floor((score - 10) / 2);
  }

  /** Saving throw modifier */
  getSavingThrowModifier(ability: string): number {
    const char = this.character();
    const mod = this.getAbilityModifier(ability);
    const proficient = (
      char.savingThrows as Record<string, { proficient: boolean }>
    )[ability]?.proficient;
    return proficient ? mod + this.getProficiencyBonus() : mod;
  }

  /** Skill modifier */
  getSkillModifier(skill: string): number {
    const char = this.character();
    const ability = SKILL_ABILITY_MAP[skill];
    const mod = this.getAbilityModifier(ability);
    const skillData = (
      char.skills as Record<string, { proficient: boolean; expertise: boolean }>
    )[skill];
    if (!skillData) return mod;
    const profBonus = this.getProficiencyBonus();
    if (skillData.expertise) return mod + profBonus * 2;
    if (skillData.proficient) return mod + profBonus;
    return mod;
  }

  /** Initiative modifier (DND 2024: DEX modifier) */
  getInitiative(): number {
    return this.getAbilityModifier('dex');
  }

  /** Computed Armor Class = DEX modifier + armor value + 2 if shield */
  getComputedArmorClass(): number {
    const char = this.character();
    const dexMod = this.getAbilityModifier('dex');
    return dexMod + (char.armorValue ?? 10) + (char.hasShield ? 2 : 0);
  }

  /** Passive Perception = 10 + Perception modifier */
  getPassivePerception(): number {
    return 10 + this.getSkillModifier('perception');
  }

  /** Attack bonus for a weapon */
  getAttackBonus(attack: {
    proficient: boolean;
    attribute: string;
  }): number {
    const mod = this.getAbilityModifier(attack.attribute);
    return attack.proficient ? mod + this.getProficiencyBonus() : mod;
  }

  /** Damage bonus for a weapon (ability modifier) */
  getDamageBonus(attack: { attribute: string }): number {
    return this.getAbilityModifier(attack.attribute);
  }

  /** Spell save DC = 8 + proficiency + spellcasting ability modifier */
  getSpellSaveDC(): number {
    const char = this.character();
    if (!char.spellcastingAbility) return 0;
    return (
      8 +
      this.getProficiencyBonus() +
      this.getAbilityModifier(char.spellcastingAbility)
    );
  }

  /** Spell attack bonus = proficiency + spellcasting ability modifier */
  getSpellAttackBonus(): number {
    const char = this.character();
    if (!char.spellcastingAbility) return 0;
    return (
      this.getProficiencyBonus() +
      this.getAbilityModifier(char.spellcastingAbility)
    );
  }

  // === Export / Import ===

  exportJSON(): string {
    return JSON.stringify(this.character(), null, 2);
  }

  importJSON(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      const merged = { ...createDefaultCharacter(), ...parsed };
      this.character.set(merged);
      return true;
    } catch {
      return false;
    }
  }

  resetCharacter(): void {
    this.character.set(createDefaultCharacter());
  }
}
