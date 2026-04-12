export interface AbilityScore {
  base: number;
}

export interface SavingThrow {
  proficient: boolean;
}

export interface Skill {
  proficient: boolean;
  expertise: boolean;
}

export interface Attack {
  name: string;
  proficient: boolean;
  attribute: string; // 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
  range: string;
  damageDice: string;
  damageType: string;
  description: string;
}

export interface SpellSlot {
  max: number;
  used: number;
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
}

export interface Equipment {
  name: string;
  quantity: number;
  weight: number;
  description: string;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface DndCharacter {
  // Meta
  version: number;

  // Header
  characterName: string;
  className: string;
  level: number;
  /** @deprecated Use className + level instead */
  classAndLevel?: string;
  playerName: string;
  background: string;
  race: string;
  experiencePoints: number;

  // Ability Scores
  abilities: {
    str: AbilityScore;
    dex: AbilityScore;
    con: AbilityScore;
    int: AbilityScore;
    wis: AbilityScore;
    cha: AbilityScore;
  };

  // Inspiration
  inspiration: boolean;

  // Saving Throws proficiencies
  savingThrows: {
    str: SavingThrow;
    dex: SavingThrow;
    con: SavingThrow;
    int: SavingThrow;
    wis: SavingThrow;
    cha: SavingThrow;
  };

  // Skills
  skills: {
    acrobatics: Skill;
    animalHandling: Skill;
    arcana: Skill;
    athletics: Skill;
    deception: Skill;
    history: Skill;
    insight: Skill;
    intimidation: Skill;
    investigation: Skill;
    medicine: Skill;
    nature: Skill;
    perception: Skill;
    performance: Skill;
    persuasion: Skill;
    religion: Skill;
    sleightOfHand: Skill;
    stealth: Skill;
    survival: Skill;
  };

  // Combat
  armorClass: number;
  armorValue: number;
  hasShield: boolean;
  speed: number;
  hitPointsMax: number;
  hitPointsCurrent: number;
  hitPointsTemp: number;
  hitDiceTotal: string;
  hitDiceUsed: number;
  deathSaves: DeathSaves;

  // Proficiency bonus override (null = auto-compute from level)
  proficiencyBonusOverride: number | null;

  // Personality
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;

  // Attacks
  attacks: Attack[];

  // Proficiencies
  armorProficiencies: {
    light: boolean;
    medium: boolean;
    heavy: boolean;
    shields: boolean;
  };
  weaponProficiencies: {
    simple: boolean;
    martial: boolean;
    other: string;
  };
  languages: string;
  toolsAndOther: string;

  // Equipment
  equipment: Equipment[];
  currency: Currency;

  // Features and Traits
  featuresAndTraits: string;

  // Spellcasting
  spellcastingAbility: string;
  spellSlots: { [level: number]: SpellSlot };
  spells: Spell[];

  // Appearance & Backstory
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  appearance: string;
  backstory: string;
  alliesAndOrganizations: string;
  treasure: string;
  characterImage: string;
  organizationLogo: string;
}

export const ABILITY_LABELS: { [key: string]: string } = {
  str: 'Stärke',
  dex: 'Geschicklichkeit',
  con: 'Konstitution',
  int: 'Intelligenz',
  wis: 'Weisheit',
  cha: 'Charisma',
};

export const ABILITY_SHORT_LABELS: { [key: string]: string } = {
  str: 'Stä',
  dex: 'Ges',
  con: 'Kon',
  int: 'Int',
  wis: 'Wei',
  cha: 'Cha',
};

export const SKILL_ABILITY_MAP: { [key: string]: string } = {
  acrobatics: 'dex',
  animalHandling: 'wis',
  arcana: 'int',
  athletics: 'str',
  deception: 'cha',
  history: 'int',
  insight: 'wis',
  intimidation: 'cha',
  investigation: 'int',
  medicine: 'wis',
  nature: 'int',
  perception: 'wis',
  performance: 'cha',
  persuasion: 'cha',
  religion: 'int',
  sleightOfHand: 'dex',
  stealth: 'dex',
  survival: 'wis',
};

export const SKILL_LABELS: { [key: string]: string } = {
  acrobatics: 'Akrobatik',
  animalHandling: 'Mit Tieren umgehen',
  arcana: 'Arkane Kunde',
  athletics: 'Athletik',
  deception: 'Täuschen',
  history: 'Geschichte',
  insight: 'Motiv erkennen',
  intimidation: 'Einschüchtern',
  investigation: 'Nachforschungen',
  medicine: 'Heilkunde',
  nature: 'Naturkunde',
  perception: 'Wahrnehmung',
  performance: 'Auftreten',
  persuasion: 'Überzeugen',
  religion: 'Religion',
  sleightOfHand: 'Fingerfertigkeit',
  stealth: 'Heimlichkeit',
  survival: 'Überlebenskunst',
};

export const DAMAGE_TYPES: { value: string; label: string }[] = [
  { value: 'Wucht', label: 'Wuchtschaden (Bludgeoning)' },
  { value: 'Stich', label: 'Stichschaden (Piercing)' },
  { value: 'Hieb', label: 'Hiebschaden (Slashing)' },
  { value: 'Säure', label: 'Säureschaden (Acid)' },
  { value: 'Kälte', label: 'Kälteschaden (Cold)' },
  { value: 'Feuer', label: 'Feuerschaden (Fire)' },
  { value: 'Kraft', label: 'Kraftschaden (Force)' },
  { value: 'Blitz', label: 'Blitzschaden (Lightning)' },
  { value: 'Nekrotisch', label: 'Nekrotisch (Necrotic)' },
  { value: 'Gift', label: 'Gift (Poison)' },
  { value: 'Psychisch', label: 'Psychisch (Psychic)' },
  { value: 'Strahlung', label: 'Strahlung (Radiant)' },
  { value: 'Donner', label: 'Donnerschaden (Thunder)' },
];

export function createDefaultCharacter(): DndCharacter {
  return {
    version: 1,
    characterName: '',
    className: '',
    level: 1,
    playerName: '',
    background: '',
    race: '',
    experiencePoints: 0,
    abilities: {
      str: { base: 10 },
      dex: { base: 10 },
      con: { base: 10 },
      int: { base: 10 },
      wis: { base: 10 },
      cha: { base: 10 },
    },
    inspiration: false,
    savingThrows: {
      str: { proficient: false },
      dex: { proficient: false },
      con: { proficient: false },
      int: { proficient: false },
      wis: { proficient: false },
      cha: { proficient: false },
    },
    skills: {
      acrobatics: { proficient: false, expertise: false },
      animalHandling: { proficient: false, expertise: false },
      arcana: { proficient: false, expertise: false },
      athletics: { proficient: false, expertise: false },
      deception: { proficient: false, expertise: false },
      history: { proficient: false, expertise: false },
      insight: { proficient: false, expertise: false },
      intimidation: { proficient: false, expertise: false },
      investigation: { proficient: false, expertise: false },
      medicine: { proficient: false, expertise: false },
      nature: { proficient: false, expertise: false },
      perception: { proficient: false, expertise: false },
      performance: { proficient: false, expertise: false },
      persuasion: { proficient: false, expertise: false },
      religion: { proficient: false, expertise: false },
      sleightOfHand: { proficient: false, expertise: false },
      stealth: { proficient: false, expertise: false },
      survival: { proficient: false, expertise: false },
    },
    armorClass: 10,
    armorValue: 10,
    hasShield: false,
    speed: 30,
    hitPointsMax: 10,
    hitPointsCurrent: 10,
    hitPointsTemp: 0,
    hitDiceTotal: '1W10',
    hitDiceUsed: 0,
    deathSaves: { successes: 0, failures: 0 },
    proficiencyBonusOverride: null,
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    attacks: [],
    armorProficiencies: {
      light: false,
      medium: false,
      heavy: false,
      shields: false,
    },
    weaponProficiencies: {
      simple: false,
      martial: false,
      other: '',
    },
    languages: '',
    toolsAndOther: '',
    equipment: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    featuresAndTraits: '',
    spellcastingAbility: '',
    spellSlots: {},
    spells: [],
    age: '',
    height: '',
    weight: '',
    eyes: '',
    skin: '',
    hair: '',
    appearance: '',
    backstory: '',
    alliesAndOrganizations: '',
    treasure: '',
    characterImage: '',
    organizationLogo: '',
  };
}
