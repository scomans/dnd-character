import { TreeNode } from 'primeng/api';

export interface NoteNode {
  id: string;
  label: string;
  content: string;
  children: NoteNode[];
  expanded?: boolean;
}

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
  mastery: string;
  magicBonus: number;
}

export const WEAPON_MASTERIES: { value: string; label: string; description: string }[] = [
  { value: '', label: 'Keine', description: '' },
  {
    value: 'Spalten',
    label: 'Spalten (Cleave)',
    description:
      'Bei einem Treffer: Ein weiteres Ziel in Reichweite erleidet den Fähigkeitsmodifikator als Schaden.',
  },
  {
    value: 'Streifen',
    label: 'Streifen (Graze)',
    description: 'Bei einem Fehlschlag: Das Ziel erleidet den Fähigkeitsmodifikator als Schaden.',
  },
  {
    value: 'Schnitt',
    label: 'Schnitt (Nick)',
    description:
      'Angriff mit dieser Waffe als Teil der Bonusaktion, wenn eine leichte Waffe im Hauptangriff genutzt wurde.',
  },
  {
    value: 'Stoßen',
    label: 'Stoßen (Push)',
    description:
      'Bei einem Treffer: Das Ziel wird 3m zurückgeschoben (Große oder kleinere Kreatur).',
  },
  {
    value: 'Schwächen',
    label: 'Schwächen (Sap)',
    description:
      'Bei einem Treffer: Das Ziel hat Nachteil auf seinen nächsten Angriffswurf vor Beginn deines nächsten Zuges.',
  },
  {
    value: 'Verlangsamen',
    label: 'Verlangsamen (Slow)',
    description:
      'Bei einem Treffer: Die Geschwindigkeit des Ziels wird um 3m reduziert bis zum Beginn deines nächsten Zuges.',
  },
  {
    value: 'Umwerfen',
    label: 'Umwerfen (Topple)',
    description:
      'Bei einem Treffer: Das Ziel muss einen Konstitutions-Rettungswurf bestehen oder wird liegend.',
  },
  {
    value: 'Reizen',
    label: 'Reizen (Vex)',
    description:
      'Bei einem Treffer: Du hast Vorteil auf deinen nächsten Angriffswurf gegen das Ziel vor dem Ende deines nächsten Zuges.',
  },
];

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

export interface Counter {
  name: string;
  maxValue: number;
  currentValue: number;
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
  hitDice: string;
  hitDiceCurrent: number;
  hitDiceMax: number;
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
  senses: string;

  // Spellcasting
  spellcastingClass: string;
  spellcastingAbility: string;
  spellSlots: { [level: number]: SpellSlot };
  spells: Spell[];

  // Additional Equipment
  additionalEquipment: Equipment[];

  // Appearance & Backstory
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  gender: string;
  faith: string;
  sizeCategory: string;
  appearance: string;
  backstory: string;
  alliesAndOrganizations: string;
  enemies: string;
  treasure: string;
  characterImage: string;
  organizationLogo: string;

  // Notes
  notes: NoteNode[];

  // Counters / Trackers
  counters: Counter[];
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

export const DICE_TYPES: { value: string; label: string }[] = [
  { value: 'W4', label: 'W4' },
  { value: 'W6', label: 'W6' },
  { value: 'W8', label: 'W8' },
  { value: 'W10', label: 'W10' },
  { value: 'W12', label: 'W12' },
  { value: 'W20', label: 'W20' },
  { value: 'W100', label: 'W100' },
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

export const DND_RACES: string[] = [
  'Mensch',
  'Elf',
  'Hochelf',
  'Waldelf',
  'Drow',
  'Zwerg',
  'Hügelzwerg',
  'Bergzwerg',
  'Halbling',
  'Leichtfuß-Halbling',
  'Pfähler-Halbling',
  'Gnom',
  'Waldgnom',
  'Felsgnom',
  'Halbelf',
  'Halbork',
  'Tiefling',
  'Drachenblütiger',
  'Aarakocra',
  'Genasi',
  'Goliath',
  'Tabaxi',
  'Kenku',
  'Firbolg',
  'Tortle',
  'Aasimar',
  'Bugbear',
  'Goblin',
  'Hobgoblin',
  'Kobold',
  'Lizardfolk',
  'Orc',
  'Yuan-Ti',
  'Changeling',
  'Kalashtar',
  'Shifter',
  'Warforged',
  'Satyr',
  'Fee',
  'Harengon',
  'Owlin',
];

export const DND_BACKGROUNDS: string[] = [
  'Akolyth',
  'Charlatan',
  'Krimineller',
  'Entertainer',
  'Volksheld',
  'Gildenhandwerker',
  'Einsiedler',
  'Adliger',
  'Ausgestoßener',
  'Weiser',
  'Seefahrer',
  'Soldat',
  'Straßenkind',
  'Stammesangehöriger',
  'Archäologe',
  'Stadtwache',
  'Spion',
  'Kopfgeldjäger',
  'Pirat',
  'Fernhändler',
  'Ritter',
  'Falkner',
];

export const DND_CLASS_TREE: TreeNode[] = [
  {
    key: 'Barbar',
    label: 'Barbar',
    data: '',
    selectable: true,
  },
  {
    key: 'Barbar',
    label: 'Barbar',
    data: 'Barbar',
    selectable: true,
    children: [
      { key: 'Barbar (Berserker)', label: 'Berserker', data: 'Barbar (Berserker)' },
      { key: 'Barbar (Totemkrieger)', label: 'Totemkrieger', data: 'Barbar (Totemkrieger)' },
      { key: 'Barbar (Sturmherold)', label: 'Sturmherold', data: 'Barbar (Sturmherold)' },
      { key: 'Barbar (Zelot)', label: 'Zelot', data: 'Barbar (Zelot)' },
      { key: 'Barbar (Tierherz)', label: 'Tierherz', data: 'Barbar (Tierherz)' },
      { key: 'Barbar (Wilder Magier)', label: 'Wilder Magier', data: 'Barbar (Wilder Magier)' },
    ],
  },
  {
    key: 'Barde',
    label: 'Barde',
    data: 'Barde',
    selectable: true,
    children: [
      {
        key: 'Barde (Kolleg der Kunde)',
        label: 'Kolleg der Kunde',
        data: 'Barde (Kolleg der Kunde)',
      },
      {
        key: 'Barde (Kolleg der Tapferkeit)',
        label: 'Kolleg der Tapferkeit',
        data: 'Barde (Kolleg der Tapferkeit)',
      },
      {
        key: 'Barde (Kolleg der Schwerter)',
        label: 'Kolleg der Schwerter',
        data: 'Barde (Kolleg der Schwerter)',
      },
      {
        key: 'Barde (Kolleg der Flüstern)',
        label: 'Kolleg der Flüstern',
        data: 'Barde (Kolleg der Flüstern)',
      },
      {
        key: 'Barde (Kolleg der Zauberkunst)',
        label: 'Kolleg der Zauberkunst',
        data: 'Barde (Kolleg der Zauberkunst)',
      },
      {
        key: 'Barde (Kolleg der Geister)',
        label: 'Kolleg der Geister',
        data: 'Barde (Kolleg der Geister)',
      },
    ],
  },
  {
    key: 'Druide',
    label: 'Druide',
    data: 'Druide',
    selectable: true,
    children: [
      {
        key: 'Druide (Kreis des Landes)',
        label: 'Kreis des Landes',
        data: 'Druide (Kreis des Landes)',
      },
      {
        key: 'Druide (Kreis des Mondes)',
        label: 'Kreis des Mondes',
        data: 'Druide (Kreis des Mondes)',
      },
      {
        key: 'Druide (Kreis der Träume)',
        label: 'Kreis der Träume',
        data: 'Druide (Kreis der Träume)',
      },
      {
        key: 'Druide (Kreis des Hirten)',
        label: 'Kreis des Hirten',
        data: 'Druide (Kreis des Hirten)',
      },
      {
        key: 'Druide (Kreis der Sporen)',
        label: 'Kreis der Sporen',
        data: 'Druide (Kreis der Sporen)',
      },
      {
        key: 'Druide (Kreis der Sterne)',
        label: 'Kreis der Sterne',
        data: 'Druide (Kreis der Sterne)',
      },
      {
        key: 'Druide (Kreis des Feuers)',
        label: 'Kreis des Feuers',
        data: 'Druide (Kreis des Feuers)',
      },
    ],
  },
  {
    key: 'Hexenmeister',
    label: 'Hexenmeister',
    data: 'Hexenmeister',
    selectable: true,
    children: [
      { key: 'Hexenmeister (Archfey)', label: 'Der Archfey', data: 'Hexenmeister (Archfey)' },
      { key: 'Hexenmeister (Einhüller)', label: 'Der Einhüller', data: 'Hexenmeister (Einhüller)' },
      { key: 'Hexenmeister (Untote)', label: 'Der Untote', data: 'Hexenmeister (Untote)' },
      {
        key: 'Hexenmeister (Celestisch)',
        label: 'Das Celestische',
        data: 'Hexenmeister (Celestisch)',
      },
      {
        key: 'Hexenmeister (Hexenklinge)',
        label: 'Der Hexenklinge',
        data: 'Hexenmeister (Hexenklinge)',
      },
      {
        key: 'Hexenmeister (Großer Alter)',
        label: 'Der Große Alte',
        data: 'Hexenmeister (Großer Alter)',
      },
    ],
  },
  {
    key: 'Kämpfer',
    label: 'Kämpfer',
    data: 'Kämpfer',
    selectable: true,
    children: [
      { key: 'Kämpfer (Champion)', label: 'Champion', data: 'Kämpfer (Champion)' },
      { key: 'Kämpfer (Kampfmeister)', label: 'Kampfmeister', data: 'Kämpfer (Kampfmeister)' },
      {
        key: 'Kämpfer (Eldritch Ritter)',
        label: 'Eldritch Ritter',
        data: 'Kämpfer (Eldritch Ritter)',
      },
      { key: 'Kämpfer (Kavalier)', label: 'Kavalier', data: 'Kämpfer (Kavalier)' },
      { key: 'Kämpfer (Samurai)', label: 'Samurai', data: 'Kämpfer (Samurai)' },
      { key: 'Kämpfer (Psi-Krieger)', label: 'Psi-Krieger', data: 'Kämpfer (Psi-Krieger)' },
      { key: 'Kämpfer (Runenritter)', label: 'Runenritter', data: 'Kämpfer (Runenritter)' },
    ],
  },
  {
    key: 'Kleriker',
    label: 'Kleriker',
    data: 'Kleriker',
    selectable: true,
    children: [
      { key: 'Kleriker (Leben)', label: 'Lebensdomäne', data: 'Kleriker (Leben)' },
      { key: 'Kleriker (Licht)', label: 'Lichtdomäne', data: 'Kleriker (Licht)' },
      { key: 'Kleriker (Natur)', label: 'Naturdomäne', data: 'Kleriker (Natur)' },
      { key: 'Kleriker (Sturm)', label: 'Sturmdomäne', data: 'Kleriker (Sturm)' },
      { key: 'Kleriker (Wissen)', label: 'Wissensdomäne', data: 'Kleriker (Wissen)' },
      { key: 'Kleriker (Krieg)', label: 'Kriegsdomäne', data: 'Kleriker (Krieg)' },
      { key: 'Kleriker (Tricks)', label: 'Tricksdomäne', data: 'Kleriker (Tricks)' },
      { key: 'Kleriker (Tod)', label: 'Todesdomäne', data: 'Kleriker (Tod)' },
      { key: 'Kleriker (Schmiede)', label: 'Schmiededomäne', data: 'Kleriker (Schmiede)' },
      { key: 'Kleriker (Frieden)', label: 'Friedensdomäne', data: 'Kleriker (Frieden)' },
      { key: 'Kleriker (Zwielicht)', label: 'Zwielichtdomäne', data: 'Kleriker (Zwielicht)' },
      { key: 'Kleriker (Ordnung)', label: 'Ordnungsdomäne', data: 'Kleriker (Ordnung)' },
    ],
  },
  {
    key: 'Magier',
    label: 'Magier',
    data: 'Magier',
    selectable: true,
    children: [
      { key: 'Magier (Bannzauberei)', label: 'Bannzauberei', data: 'Magier (Bannzauberei)' },
      { key: 'Magier (Beschwörung)', label: 'Beschwörung', data: 'Magier (Beschwörung)' },
      {
        key: 'Magier (Erkenntnismagie)',
        label: 'Erkenntnismagie',
        data: 'Magier (Erkenntnismagie)',
      },
      { key: 'Magier (Hervorrufung)', label: 'Hervorrufung', data: 'Magier (Hervorrufung)' },
      { key: 'Magier (Illusion)', label: 'Illusion', data: 'Magier (Illusion)' },
      { key: 'Magier (Nekromantie)', label: 'Nekromantie', data: 'Magier (Nekromantie)' },
      { key: 'Magier (Transmutation)', label: 'Transmutation', data: 'Magier (Transmutation)' },
      { key: 'Magier (Verzauberung)', label: 'Verzauberung', data: 'Magier (Verzauberung)' },
      { key: 'Magier (Kriegsmagie)', label: 'Kriegsmagie', data: 'Magier (Kriegsmagie)' },
      { key: 'Magier (Chronurgie)', label: 'Chronurgie', data: 'Magier (Chronurgie)' },
      { key: 'Magier (Graviturgie)', label: 'Graviturgie', data: 'Magier (Graviturgie)' },
      { key: 'Magier (Klingengesang)', label: 'Klingengesang', data: 'Magier (Klingengesang)' },
    ],
  },
  {
    key: 'Mönch',
    label: 'Mönch',
    data: 'Mönch',
    selectable: true,
    children: [
      { key: 'Mönch (Offene Hand)', label: 'Weg der offenen Hand', data: 'Mönch (Offene Hand)' },
      { key: 'Mönch (Schatten)', label: 'Weg des Schattens', data: 'Mönch (Schatten)' },
      {
        key: 'Mönch (Vier Elemente)',
        label: 'Weg der vier Elemente',
        data: 'Mönch (Vier Elemente)',
      },
      { key: 'Mönch (Trunkenheit)', label: 'Weg der Trunkenheit', data: 'Mönch (Trunkenheit)' },
      { key: 'Mönch (Sonne)', label: 'Weg der Sonne', data: 'Mönch (Sonne)' },
      { key: 'Mönch (Kensai)', label: 'Weg des Kensai', data: 'Mönch (Kensai)' },
      {
        key: 'Mönch (Astral-Selbst)',
        label: 'Weg des Astral-Selbst',
        data: 'Mönch (Astral-Selbst)',
      },
      { key: 'Mönch (Gnade)', label: 'Weg der Gnade', data: 'Mönch (Gnade)' },
    ],
  },
  {
    key: 'Paladin',
    label: 'Paladin',
    data: 'Paladin',
    selectable: true,
    children: [
      { key: 'Paladin (Hingabe)', label: 'Eid der Hingabe', data: 'Paladin (Hingabe)' },
      { key: 'Paladin (Ahnen)', label: 'Eid der Ahnen', data: 'Paladin (Ahnen)' },
      { key: 'Paladin (Rache)', label: 'Eid der Rache', data: 'Paladin (Rache)' },
      { key: 'Paladin (Krone)', label: 'Eid der Krone', data: 'Paladin (Krone)' },
      { key: 'Paladin (Eroberung)', label: 'Eid der Eroberung', data: 'Paladin (Eroberung)' },
      { key: 'Paladin (Erlösung)', label: 'Eid der Erlösung', data: 'Paladin (Erlösung)' },
      { key: 'Paladin (Wächter)', label: 'Eid der Wächter', data: 'Paladin (Wächter)' },
      {
        key: 'Paladin (Herrlichkeit)',
        label: 'Eid der Herrlichkeit',
        data: 'Paladin (Herrlichkeit)',
      },
      { key: 'Paladin (Eidbrecher)', label: 'Eidbrecher', data: 'Paladin (Eidbrecher)' },
    ],
  },
  {
    key: 'Schurke',
    label: 'Schurke',
    data: 'Schurke',
    selectable: true,
    children: [
      { key: 'Schurke (Dieb)', label: 'Dieb', data: 'Schurke (Dieb)' },
      { key: 'Schurke (Assassine)', label: 'Assassine', data: 'Schurke (Assassine)' },
      {
        key: 'Schurke (Arkaner Trickser)',
        label: 'Arkaner Trickser',
        data: 'Schurke (Arkaner Trickser)',
      },
      { key: 'Schurke (Meistergeist)', label: 'Meistergeist', data: 'Schurke (Meistergeist)' },
      { key: 'Schurke (Inquisiteur)', label: 'Inquisiteur', data: 'Schurke (Inquisiteur)' },
      { key: 'Schurke (Kundschafter)', label: 'Kundschafter', data: 'Schurke (Kundschafter)' },
      { key: 'Schurke (Swashbuckler)', label: 'Swashbuckler', data: 'Schurke (Swashbuckler)' },
      { key: 'Schurke (Phantom)', label: 'Phantom', data: 'Schurke (Phantom)' },
      { key: 'Schurke (Seelenklinge)', label: 'Seelenklinge', data: 'Schurke (Seelenklinge)' },
    ],
  },
  {
    key: 'Waldläufer',
    label: 'Waldläufer',
    data: 'Waldläufer',
    selectable: true,
    children: [
      { key: 'Waldläufer (Jäger)', label: 'Jäger', data: 'Waldläufer (Jäger)' },
      { key: 'Waldläufer (Tiermeister)', label: 'Tiermeister', data: 'Waldläufer (Tiermeister)' },
      {
        key: 'Waldläufer (Horizontwanderer)',
        label: 'Horizontwanderer',
        data: 'Waldläufer (Horizontwanderer)',
      },
      { key: 'Waldläufer (Gleiter)', label: 'Gleiter', data: 'Waldläufer (Gleiter)' },
      {
        key: 'Waldläufer (Monsterhetzer)',
        label: 'Monsterhetzer',
        data: 'Waldläufer (Monsterhetzer)',
      },
      {
        key: 'Waldläufer (Fey-Wanderer)',
        label: 'Fey-Wanderer',
        data: 'Waldläufer (Fey-Wanderer)',
      },
      {
        key: 'Waldläufer (Schwarmwächter)',
        label: 'Schwarmwächter',
        data: 'Waldläufer (Schwarmwächter)',
      },
      {
        key: 'Waldläufer (Drakonischer Wanderer)',
        label: 'Drakonischer Wanderer',
        data: 'Waldläufer (Drakonischer Wanderer)',
      },
    ],
  },
  {
    key: 'Zauberer',
    label: 'Zauberer',
    data: 'Zauberer',
    selectable: true,
    children: [
      {
        key: 'Zauberer (Drakonisches Blut)',
        label: 'Drakonisches Blut',
        data: 'Zauberer (Drakonisches Blut)',
      },
      { key: 'Zauberer (Wilde Magie)', label: 'Wilde Magie', data: 'Zauberer (Wilde Magie)' },
      {
        key: 'Zauberer (Göttliche Seele)',
        label: 'Göttliche Seele',
        data: 'Zauberer (Göttliche Seele)',
      },
      { key: 'Zauberer (Schattenmagie)', label: 'Schattenmagie', data: 'Zauberer (Schattenmagie)' },
      { key: 'Zauberer (Sturmzauberei)', label: 'Sturmzauberei', data: 'Zauberer (Sturmzauberei)' },
      { key: 'Zauberer (Aberrant Mind)', label: 'Aberrant Mind', data: 'Zauberer (Aberrant Mind)' },
      { key: 'Zauberer (Uhrmacher)', label: 'Uhrmacher', data: 'Zauberer (Uhrmacher)' },
      {
        key: 'Zauberer (Lunarer Zauberer)',
        label: 'Lunarer Zauberer',
        data: 'Zauberer (Lunarer Zauberer)',
      },
    ],
  },
];

export const LIFESTYLES: { value: string; label: string; cost: string }[] = [
  { value: 'elend', label: 'Elend', cost: '-' },
  { value: 'armselig', label: 'Armselig', cost: '1 SM' },
  { value: 'arm', label: 'Arm', cost: '2 SM' },
  { value: 'bescheiden', label: 'Bescheiden', cost: '1 GM' },
  { value: 'bequem', label: 'Bequem', cost: '2 GM' },
  { value: 'wohlhabend', label: 'Wohlhabend', cost: '4 GM' },
  { value: 'aristokratisch', label: 'Aristokratisch', cost: '10 GM min.' },
];

/** Classes (and subclasses) that can cast spells, with their default spellcasting ability */
export const SPELLCASTING_CLASSES: { value: string; label: string; ability: string | null }[] = [
  { value: '-', label: '-', ability: null },
  { value: 'Barde', label: 'Barde', ability: 'cha' },
  { value: 'Druide', label: 'Druide', ability: 'wis' },
  { value: 'Hexenmeister', label: 'Hexenmeister', ability: 'cha' },
  { value: 'Kämpfer (Eldritch Ritter)', label: 'Kämpfer (Eldritch Ritter)', ability: 'int' },
  { value: 'Kleriker', label: 'Kleriker', ability: 'wis' },
  { value: 'Magier', label: 'Magier', ability: 'int' },
  { value: 'Paladin', label: 'Paladin', ability: 'cha' },
  { value: 'Schurke (Arkaner Trickser)', label: 'Schurke (Arkaner Trickser)', ability: 'int' },
  { value: 'Waldläufer', label: 'Waldläufer', ability: 'wis' },
  { value: 'Zauberer', label: 'Zauberer', ability: 'cha' },
];

export function createDefaultCharacter(): DndCharacter {
  return {
    version: 1,
    characterName: 'Neuer Charakter',
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
    hitDice: 'W10',
    hitDiceCurrent: 0,
    hitDiceMax: 1,
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
    additionalEquipment: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    featuresAndTraits: '',
    racialTraits: '',
    senses: '',
    spellcastingClass: '',
    spellcastingAbility: '',
    spellSlots: {},
    spells: [],
    age: '',
    height: '',
    weight: '',
    eyes: '',
    skin: '',
    hair: '',
    gender: '',
    faith: '',
    sizeCategory: '',
    appearance: '',
    backstory: '',
    alliesAndOrganizations: '',
    enemies: '',
    treasure: '',
    characterImage: '',
    organizationLogo: '',
    notes: [],
    counters: [],
  };
}
