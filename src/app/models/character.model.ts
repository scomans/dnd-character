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
  alignment: string;
  lifestyle: string;
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
  racialTraits: string;

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

export const ALIGNMENTS: { value: string; label: string }[] = [
  { value: 'LG', label: 'Rechtschaffen Gut' },
  { value: 'NG', label: 'Neutral Gut' },
  { value: 'CG', label: 'Chaotisch Gut' },
  { value: 'LN', label: 'Rechtschaffen Neutral' },
  { value: 'TN', label: 'Neutral' },
  { value: 'CN', label: 'Chaotisch Neutral' },
  { value: 'LE', label: 'Rechtschaffen Böse' },
  { value: 'NE', label: 'Neutral Böse' },
  { value: 'CE', label: 'Chaotisch Böse' },
];

export const DND_CLASSES: string[] = [
  'Barbar',
  'Barde',
  'Druide',
  'Hexenmeister',
  'Kämpfer',
  'Kleriker',
  'Magier',
  'Mönch',
  'Paladin',
  'Schurke',
  'Waldläufer',
  'Zauberer',
];

export interface ClassTreeNode {
  label: string;
  data: string;
  children?: ClassTreeNode[];
}

export const DND_CLASS_TREE: ClassTreeNode[] = [
  { label: 'Barbar', data: 'Barbar', children: [
    { label: 'Berserker', data: 'Barbar (Berserker)' },
    { label: 'Totemkrieger', data: 'Barbar (Totemkrieger)' },
    { label: 'Sturmherold', data: 'Barbar (Sturmherold)' },
    { label: 'Zelot', data: 'Barbar (Zelot)' },
    { label: 'Tierherz', data: 'Barbar (Tierherz)' },
    { label: 'Wilder Magier', data: 'Barbar (Wilder Magier)' },
  ]},
  { label: 'Barde', data: 'Barde', children: [
    { label: 'Kolleg der Kunde', data: 'Barde (Kolleg der Kunde)' },
    { label: 'Kolleg der Tapferkeit', data: 'Barde (Kolleg der Tapferkeit)' },
    { label: 'Kolleg der Schwerter', data: 'Barde (Kolleg der Schwerter)' },
    { label: 'Kolleg der Flüstern', data: 'Barde (Kolleg der Flüstern)' },
    { label: 'Kolleg der Zauberkunst', data: 'Barde (Kolleg der Zauberkunst)' },
    { label: 'Kolleg der Geister', data: 'Barde (Kolleg der Geister)' },
  ]},
  { label: 'Druide', data: 'Druide', children: [
    { label: 'Kreis des Landes', data: 'Druide (Kreis des Landes)' },
    { label: 'Kreis des Mondes', data: 'Druide (Kreis des Mondes)' },
    { label: 'Kreis der Träume', data: 'Druide (Kreis der Träume)' },
    { label: 'Kreis des Hirten', data: 'Druide (Kreis des Hirten)' },
    { label: 'Kreis der Sporen', data: 'Druide (Kreis der Sporen)' },
    { label: 'Kreis der Sterne', data: 'Druide (Kreis der Sterne)' },
    { label: 'Kreis des Feuers', data: 'Druide (Kreis des Feuers)' },
  ]},
  { label: 'Hexenmeister', data: 'Hexenmeister', children: [
    { label: 'Der Archfey', data: 'Hexenmeister (Archfey)' },
    { label: 'Der Einhüller', data: 'Hexenmeister (Einhüller)' },
    { label: 'Der Untote', data: 'Hexenmeister (Untote)' },
    { label: 'Das Celestische', data: 'Hexenmeister (Celestisch)' },
    { label: 'Der Hexenklinge', data: 'Hexenmeister (Hexenklinge)' },
    { label: 'Der Große Alte', data: 'Hexenmeister (Großer Alter)' },
  ]},
  { label: 'Kämpfer', data: 'Kämpfer', children: [
    { label: 'Champion', data: 'Kämpfer (Champion)' },
    { label: 'Kampfmeister', data: 'Kämpfer (Kampfmeister)' },
    { label: 'Eldritch Ritter', data: 'Kämpfer (Eldritch Ritter)' },
    { label: 'Kavalier', data: 'Kämpfer (Kavalier)' },
    { label: 'Samurai', data: 'Kämpfer (Samurai)' },
    { label: 'Psi-Krieger', data: 'Kämpfer (Psi-Krieger)' },
    { label: 'Runenritter', data: 'Kämpfer (Runenritter)' },
  ]},
  { label: 'Kleriker', data: 'Kleriker', children: [
    { label: 'Lebensdomäne', data: 'Kleriker (Leben)' },
    { label: 'Lichtdomäne', data: 'Kleriker (Licht)' },
    { label: 'Naturdomäne', data: 'Kleriker (Natur)' },
    { label: 'Sturmdomäne', data: 'Kleriker (Sturm)' },
    { label: 'Wissensdomäne', data: 'Kleriker (Wissen)' },
    { label: 'Kriegsdomäne', data: 'Kleriker (Krieg)' },
    { label: 'Tricksdomäne', data: 'Kleriker (Tricks)' },
    { label: 'Todesdomäne', data: 'Kleriker (Tod)' },
    { label: 'Schmiededomäne', data: 'Kleriker (Schmiede)' },
    { label: 'Friedensdomäne', data: 'Kleriker (Frieden)' },
    { label: 'Zwielichtdomäne', data: 'Kleriker (Zwielicht)' },
    { label: 'Ordnungsdomäne', data: 'Kleriker (Ordnung)' },
  ]},
  { label: 'Magier', data: 'Magier', children: [
    { label: 'Bannzauberei', data: 'Magier (Bannzauberei)' },
    { label: 'Beschwörung', data: 'Magier (Beschwörung)' },
    { label: 'Erkenntnismagie', data: 'Magier (Erkenntnismagie)' },
    { label: 'Hervorrufung', data: 'Magier (Hervorrufung)' },
    { label: 'Illusion', data: 'Magier (Illusion)' },
    { label: 'Nekromantie', data: 'Magier (Nekromantie)' },
    { label: 'Transmutation', data: 'Magier (Transmutation)' },
    { label: 'Verzauberung', data: 'Magier (Verzauberung)' },
    { label: 'Kriegsmagie', data: 'Magier (Kriegsmagie)' },
    { label: 'Chronurgie', data: 'Magier (Chronurgie)' },
    { label: 'Graviturgie', data: 'Magier (Graviturgie)' },
    { label: 'Klingengesang', data: 'Magier (Klingengesang)' },
  ]},
  { label: 'Mönch', data: 'Mönch', children: [
    { label: 'Weg der offenen Hand', data: 'Mönch (Offene Hand)' },
    { label: 'Weg des Schattens', data: 'Mönch (Schatten)' },
    { label: 'Weg der vier Elemente', data: 'Mönch (Vier Elemente)' },
    { label: 'Weg der Trunkenheit', data: 'Mönch (Trunkenheit)' },
    { label: 'Weg der Sonne', data: 'Mönch (Sonne)' },
    { label: 'Weg des Kensai', data: 'Mönch (Kensai)' },
    { label: 'Weg des Astral-Selbst', data: 'Mönch (Astral-Selbst)' },
    { label: 'Weg der Gnade', data: 'Mönch (Gnade)' },
  ]},
  { label: 'Paladin', data: 'Paladin', children: [
    { label: 'Eid der Hingabe', data: 'Paladin (Hingabe)' },
    { label: 'Eid der Ahnen', data: 'Paladin (Ahnen)' },
    { label: 'Eid der Rache', data: 'Paladin (Rache)' },
    { label: 'Eid der Krone', data: 'Paladin (Krone)' },
    { label: 'Eid der Eroberung', data: 'Paladin (Eroberung)' },
    { label: 'Eid der Erlösung', data: 'Paladin (Erlösung)' },
    { label: 'Eid der Wächter', data: 'Paladin (Wächter)' },
    { label: 'Eid der Herrlichkeit', data: 'Paladin (Herrlichkeit)' },
    { label: 'Eidbrecher', data: 'Paladin (Eidbrecher)' },
  ]},
  { label: 'Schurke', data: 'Schurke', children: [
    { label: 'Dieb', data: 'Schurke (Dieb)' },
    { label: 'Assassine', data: 'Schurke (Assassine)' },
    { label: 'Arkaner Trickser', data: 'Schurke (Arkaner Trickser)' },
    { label: 'Meistergeist', data: 'Schurke (Meistergeist)' },
    { label: 'Inquisiteur', data: 'Schurke (Inquisiteur)' },
    { label: 'Kundschafter', data: 'Schurke (Kundschafter)' },
    { label: 'Swashbuckler', data: 'Schurke (Swashbuckler)' },
    { label: 'Phantom', data: 'Schurke (Phantom)' },
    { label: 'Seelenklinge', data: 'Schurke (Seelenklinge)' },
  ]},
  { label: 'Waldläufer', data: 'Waldläufer', children: [
    { label: 'Jäger', data: 'Waldläufer (Jäger)' },
    { label: 'Tiermeister', data: 'Waldläufer (Tiermeister)' },
    { label: 'Horizontwanderer', data: 'Waldläufer (Horizontwanderer)' },
    { label: 'Gleiter', data: 'Waldläufer (Gleiter)' },
    { label: 'Monsterhetzer', data: 'Waldläufer (Monsterhetzer)' },
    { label: 'Fey-Wanderer', data: 'Waldläufer (Fey-Wanderer)' },
    { label: 'Schwarmwächter', data: 'Waldläufer (Schwarmwächter)' },
    { label: 'Drakonischer Wanderer', data: 'Waldläufer (Drakonischer Wanderer)' },
  ]},
  { label: 'Zauberer', data: 'Zauberer', children: [
    { label: 'Drakonisches Blut', data: 'Zauberer (Drakonisches Blut)' },
    { label: 'Wilde Magie', data: 'Zauberer (Wilde Magie)' },
    { label: 'Göttliche Seele', data: 'Zauberer (Göttliche Seele)' },
    { label: 'Schattenmagie', data: 'Zauberer (Schattenmagie)' },
    { label: 'Sturmzauberei', data: 'Zauberer (Sturmzauberei)' },
    { label: 'Aberrant Mind', data: 'Zauberer (Aberrant Mind)' },
    { label: 'Uhrmacher', data: 'Zauberer (Uhrmacher)' },
    { label: 'Lunarer Zauberer', data: 'Zauberer (Lunarer Zauberer)' },
  ]},
];

export const LIFESTYLES: { value: string; label: string; cost: string }[] = [
  { value: 'elend', label: 'Elend', cost: '—' },
  { value: 'armselig', label: 'Armselig', cost: '1 SM' },
  { value: 'arm', label: 'Arm', cost: '2 SM' },
  { value: 'bescheiden', label: 'Bescheiden', cost: '1 GM' },
  { value: 'bequem', label: 'Bequem', cost: '2 GM' },
  { value: 'wohlhabend', label: 'Wohlhabend', cost: '4 GM' },
  { value: 'aristokratisch', label: 'Aristokratisch', cost: '10 GM min.' },
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
    alignment: '',
    lifestyle: 'bescheiden',
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
    racialTraits: '',
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
