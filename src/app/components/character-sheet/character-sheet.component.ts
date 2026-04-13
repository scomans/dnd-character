import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AbilityScoresComponent } from '../ability-scores/ability-scores.component';
import { AppearanceBackstoryComponent } from '../appearance-backstory/appearance-backstory.component';
import { AttacksComponent } from '../attacks/attacks.component';
import { CombatComponent } from '../combat/combat.component';
import { EquipmentComponent } from '../equipment/equipment.component';
import { FeaturesComponent } from '../features/features.component';
import { HeaderComponent } from '../header/header.component';
import { LifestyleJumpComponent } from '../lifestyle-jump/lifestyle-jump.component';
import { PersonalityComponent } from '../personality/personality.component';
import { ProficienciesLanguagesComponent } from '../proficiencies-languages/proficiencies-languages.component';
import { SavingThrowsComponent } from '../saving-throws/saving-throws.component';
import { SkillsComponent } from '../skills/skills.component';
import { SpellcastingComponent } from '../spellcasting/spellcasting.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { NotesComponent } from '../notes/notes.component';


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
    LifestyleJumpComponent,
    SpellcastingComponent,
    AppearanceBackstoryComponent,
    NotesComponent,
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
          <p-tab value="4">Notizen</p-tab>
        </p-tablist>
        <p-tabpanels>
          <!-- Page 1: Main Character Sheet -->
          <p-tabpanel value="0">
            <div class="flex flex-wrap gap-4 overflow-x-hidden">
              <!-- Column 1: Ability Scores -->
              <div class="max-sm:w-full">
                <app-ability-scores />
              </div>

              <!-- Column 2: Saving Throws + Skills -->
              <div class="flex max-sm:w-full flex-col sm:flex-row-reverse md:flex-col justify-end gap-4">
                <app-saving-throws />
                <app-skills />
              </div>

              <!-- Column 3: Combat, Attacks, Features (Klassenmerkmale) -->
              <div class="flex-1">
                <app-combat />
              </div>

              <div class="w-full overflow-x-auto">
                <app-attacks />
              </div>

              <div class="w-full">
                <app-features />
              </div>

              <!-- Proficiencies directly below Ability Scores + Skills columns -->
              <div class="flex-1">
                <app-proficiencies-languages />
              </div>
              <div class="flex-1">
                <app-lifestyle-jump />
              </div>
            </div>
          </p-tabpanel>

          <!-- Page 2: Equipment -->
          <p-tabpanel value="1">
            <div class="mt-4">
              <app-equipment />
            </div>
          </p-tabpanel>

          <!-- Page 3: Spellcasting -->
          <p-tabpanel value="2">
            <div class="mt-4">
              <app-spellcasting />
            </div>
          </p-tabpanel>

          <!-- Page 4: Appearance, Personality & Backstory -->
          <p-tabpanel value="3">
            <div class="mt-4 space-y-4">
              <app-appearance-backstory />
              <app-personality />
            </div>
          </p-tabpanel>

          <!-- Page 5: Notes -->
          <p-tabpanel value="4">
            <app-notes />
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </div>
  `,
})
export class CharacterSheetComponent {}
