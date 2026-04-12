import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { HeaderComponent } from '../header/header.component';
import { AbilityScoresComponent } from '../ability-scores/ability-scores.component';
import { SavingThrowsComponent } from '../saving-throws/saving-throws.component';
import { SkillsComponent } from '../skills/skills.component';
import { CombatComponent } from '../combat/combat.component';
import { PersonalityComponent } from '../personality/personality.component';
import { AttacksComponent } from '../attacks/attacks.component';
import { ProficienciesLanguagesComponent } from '../proficiencies-languages/proficiencies-languages.component';
import { EquipmentComponent } from '../equipment/equipment.component';
import { FeaturesComponent } from '../features/features.component';
import { SpellcastingComponent } from '../spellcasting/spellcasting.component';
import { AppearanceBackstoryComponent } from '../appearance-backstory/appearance-backstory.component';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [
    CommonModule,
    TabsModule,
    ToolbarComponent,
    HeaderComponent,
    AbilityScoresComponent,
    SavingThrowsComponent,
    SkillsComponent,
    CombatComponent,
    PersonalityComponent,
    AttacksComponent,
    ProficienciesLanguagesComponent,
    EquipmentComponent,
    FeaturesComponent,
    SpellcastingComponent,
    AppearanceBackstoryComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto p-4">
      <app-toolbar />
      <app-header />

      <p-tabs value="0">
        <p-tablist>
          <p-tab value="0">Hauptseite</p-tab>
          <p-tab value="1">Ausrüstung</p-tab>
          <p-tab value="2">Zauberwirken</p-tab>
          <p-tab value="3">Hintergrund</p-tab>
        </p-tablist>
        <p-tabpanels>
          <!-- Page 1: Main Character Sheet -->
          <p-tabpanel value="0">
            <div class="grid grid-cols-1 md:grid-cols-[auto_auto_1fr] gap-4 mt-4">
              <!-- Column 1: Ability Scores -->
              <div class="space-y-3 w-full md:w-36">
                <app-ability-scores />
              </div>

              <!-- Column 2: Saving Throws + Skills + Proficiencies -->
              <div class="space-y-3 w-full md:w-64">
                <app-saving-throws />
                <app-skills />
                <app-proficiencies-languages />
              </div>

              <!-- Column 3: Combat, Attacks, Features (Klassenmerkmale) -->
              <div class="space-y-3">
                <app-combat />
                <app-attacks />
                <app-features />
              </div>
            </div>
          </p-tabpanel>

          <!-- Page 2: Equipment -->
          <p-tabpanel value="1">
            <div class="mt-4 max-w-2xl">
              <app-equipment />
            </div>
          </p-tabpanel>

          <!-- Page 3: Spellcasting -->
          <p-tabpanel value="2">
            <div class="mt-4 max-w-4xl">
              <app-spellcasting />
            </div>
          </p-tabpanel>

          <!-- Page 4: Appearance, Personality & Backstory -->
          <p-tabpanel value="3">
            <div class="mt-4 max-w-3xl space-y-4">
              <app-personality />
              <app-appearance-backstory />
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </div>
  `,
})
export class CharacterSheetComponent {}
