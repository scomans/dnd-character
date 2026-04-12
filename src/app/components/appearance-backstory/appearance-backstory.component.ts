import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-appearance-backstory',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputGroupModule, InputGroupAddonModule, MarkdownEditorComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
      <!-- Left Column: Appearance, Backstory, etc. -->
      <div class="space-y-3">
        <!-- Appearance -->
        <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
          <app-markdown-editor
            [value]="cs.character().appearance"
            (valueChange)="cs.update({ appearance: $event })"
            placeholder="Aussehen des Charakters..."
            [minRows]="4"
          />
          <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-1 border-t border-gray-200 pt-1">
            Aussehen des Charakters
          </div>
        </div>

        <!-- Backstory -->
        <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
          <app-markdown-editor
            [value]="cs.character().backstory"
            (valueChange)="cs.update({ backstory: $event })"
            placeholder="Hintergrundgeschichte..."
            [minRows]="8"
          />
          <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-1 border-t border-gray-200 pt-1">
            Hintergrundgeschichte
          </div>
        </div>

        <!-- Allies & Organizations -->
        <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
          <app-markdown-editor
            [value]="cs.character().alliesAndOrganizations"
            (valueChange)="cs.update({ alliesAndOrganizations: $event })"
            placeholder="Verbündete & Organisationen..."
            [minRows]="4"
          />
          <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-1 border-t border-gray-200 pt-1">
            Verbündete & Organisationen
          </div>
        </div>

        <!-- Treasure -->
        <div class="bg-white border-2 border-amber-800 rounded-lg p-2">
          <app-markdown-editor
            [value]="cs.character().treasure"
            (valueChange)="cs.update({ treasure: $event })"
            placeholder="Schätze..."
            [minRows]="3"
          />
          <div class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-1 border-t border-gray-200 pt-1">
            Schätze
          </div>
        </div>
      </div>

      <!-- Right Column: Physical Characteristics (vertical layout) -->
      <div class="bg-white border-2 border-amber-800 rounded-lg p-3 space-y-2 w-full md:w-48">
        <div class="flex flex-col">
          <input pInputText [ngModel]="cs.character().age" (ngModelChange)="cs.update({ age: $event })" class="w-full text-xs" />
          <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Alter</label>
        </div>
        <div class="flex flex-col">
          <p-inputgroup>
            <input pInputText [ngModel]="cs.character().height" (ngModelChange)="cs.update({ height: $event })" class="w-full text-xs" />
            <p-inputgroup-addon>m</p-inputgroup-addon>
          </p-inputgroup>
          <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Größe</label>
        </div>
        <div class="flex flex-col">
          <p-inputgroup>
            <input pInputText [ngModel]="cs.character().weight" (ngModelChange)="cs.update({ weight: $event })" class="w-full text-xs" />
            <p-inputgroup-addon>kg</p-inputgroup-addon>
          </p-inputgroup>
          <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Gewicht</label>
        </div>
        <div class="flex flex-col">
          <input pInputText [ngModel]="cs.character().eyes" (ngModelChange)="cs.update({ eyes: $event })" class="w-full text-xs" />
          <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Augen</label>
        </div>
        <div class="flex flex-col">
          <input pInputText [ngModel]="cs.character().skin" (ngModelChange)="cs.update({ skin: $event })" class="w-full text-xs" />
          <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Haut</label>
        </div>
        <div class="flex flex-col">
          <input pInputText [ngModel]="cs.character().hair" (ngModelChange)="cs.update({ hair: $event })" class="w-full text-xs" />
          <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Haar</label>
        </div>
      </div>
    </div>
  `,
})
export class AppearanceBackstoryComponent {
  cs = inject(CharacterService);
}
