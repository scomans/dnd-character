import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@openng/optimus-ui/tabs';
import { AbilityScoresComponent } from '../ability-scores/ability-scores.component';
import { AppearanceBackstoryComponent } from '../appearance-backstory/appearance-backstory.component';
import { AttacksComponent } from '../attacks/attacks.component';
import { ConditionEffectsComponent } from '../condition-effects/condition-effects.component';
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
import { EditModeService } from '../../services/edit-mode.service';
import { ProficiencyComponent } from '../proficiency/proficiency.component';
import { HealthComponent } from '../health/health.component';
import { WalkingSpeedComponent } from '../walking-speed/walking-speed.component';
import { InitiativeComponent } from '../initiative/initiative.component';
import { ArmorClassComponent } from '../armor-class/armor-class.component';
import { CountersComponent } from '../counters/counters.component';

@Component({
  selector: 'app-character-sheet',
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AbilityScoresComponent,
    AppearanceBackstoryComponent,
    ArmorClassComponent,
    AttacksComponent,
    ConditionEffectsComponent,
    CountersComponent,
    EquipmentComponent,
    FeaturesComponent,
    HeaderComponent,
    HealthComponent,
    InitiativeComponent,
    LifestyleJumpComponent,
    NotesComponent,
    PersonalityComponent,
    ProficienciesLanguagesComponent,
    ProficiencyComponent,
    SavingThrowsComponent,
    SkillsComponent,
    SpellcastingComponent,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    ToolbarComponent,
    WalkingSpeedComponent,
  ],
})
export class CharacterSheetComponent {
  protected readonly isEditMode = inject(EditModeService).isEditMode;
}
