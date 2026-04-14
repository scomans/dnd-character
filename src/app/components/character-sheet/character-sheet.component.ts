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
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.scss',
})
export class CharacterSheetComponent {}
