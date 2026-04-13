import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { ImagePickerComponent } from '../image-picker/image-picker.component';
import { ClickOutside } from 'ngxtension/click-outside';

@Component({
  selector: 'app-appearance-backstory',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputGroupModule, InputGroupAddonModule, FieldsetModule, TooltipModule, MarkdownEditorComponent, ImagePickerComponent, ClickOutside],
  template: `
    <div class="space-y-3">
      <!-- Physical Characteristics + Character Image at top -->
      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <p-fieldset legend="Körperliche Merkmale">
          <div class="grid grid-cols-3 gap-2 text-xs">
            <!-- Alter -->
            <div class="flex flex-col">
              @if (editingField() === 'age') {
                <input pInputText [ngModel]="cs.character().age" (ngModelChange)="cs.update({ age: $event })" class="w-full text-xs" (clickOutside)="editingField.set(null)" autofocus />
              } @else {
                <span class="text-sm text-slate-700 cursor-pointer hover:text-slate-500 border border-transparent hover:border-slate-300 rounded px-1 py-0.5 min-h-[1.5rem]" (click)="editingField.set('age')" pTooltip="Klicken zum Bearbeiten" tooltipPosition="top">{{ cs.character().age || 'Klicken zum Bearbeiten' }}</span>
              }
              <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Alter</label>
            </div>
            <!-- Größe -->
            <div class="flex flex-col">
              @if (editingField() === 'height') {
                <p-inputgroup (clickOutside)="editingField.set(null)">
                  <input pInputText [ngModel]="cs.character().height" (ngModelChange)="cs.update({ height: $event })" class="w-full text-xs" autofocus />
                  <p-inputgroup-addon>m</p-inputgroup-addon>
                </p-inputgroup>
              } @else {
                <span class="text-sm text-slate-700 cursor-pointer hover:text-slate-500 border border-transparent hover:border-slate-300 rounded px-1 py-0.5 min-h-[1.5rem]" (click)="editingField.set('height')" pTooltip="Klicken zum Bearbeiten" tooltipPosition="top">{{ cs.character().height ? cs.character().height + ' m' : 'Klicken zum Bearbeiten' }}</span>
              }
              <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Größe</label>
            </div>
            <!-- Gewicht -->
            <div class="flex flex-col">
              @if (editingField() === 'weight') {
                <p-inputgroup (clickOutside)="editingField.set(null)">
                  <input pInputText [ngModel]="cs.character().weight" (ngModelChange)="cs.update({ weight: $event })" class="w-full text-xs" autofocus />
                  <p-inputgroup-addon>kg</p-inputgroup-addon>
                </p-inputgroup>
              } @else {
                <span class="text-sm text-slate-700 cursor-pointer hover:text-slate-500 border border-transparent hover:border-slate-300 rounded px-1 py-0.5 min-h-[1.5rem]" (click)="editingField.set('weight')" pTooltip="Klicken zum Bearbeiten" tooltipPosition="top">{{ cs.character().weight ? cs.character().weight + ' kg' : 'Klicken zum Bearbeiten' }}</span>
              }
              <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Gewicht</label>
            </div>
            <!-- Augen -->
            <div class="flex flex-col">
              @if (editingField() === 'eyes') {
                <input pInputText [ngModel]="cs.character().eyes" (ngModelChange)="cs.update({ eyes: $event })" class="w-full text-xs" (clickOutside)="editingField.set(null)" autofocus />
              } @else {
                <span class="text-sm text-slate-700 cursor-pointer hover:text-slate-500 border border-transparent hover:border-slate-300 rounded px-1 py-0.5 min-h-[1.5rem]" (click)="editingField.set('eyes')" pTooltip="Klicken zum Bearbeiten" tooltipPosition="top">{{ cs.character().eyes || 'Klicken zum Bearbeiten' }}</span>
              }
              <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Augen</label>
            </div>
            <!-- Haut -->
            <div class="flex flex-col">
              @if (editingField() === 'skin') {
                <input pInputText [ngModel]="cs.character().skin" (ngModelChange)="cs.update({ skin: $event })" class="w-full text-xs" (clickOutside)="editingField.set(null)" autofocus />
              } @else {
                <span class="text-sm text-slate-700 cursor-pointer hover:text-slate-500 border border-transparent hover:border-slate-300 rounded px-1 py-0.5 min-h-[1.5rem]" (click)="editingField.set('skin')" pTooltip="Klicken zum Bearbeiten" tooltipPosition="top">{{ cs.character().skin || 'Klicken zum Bearbeiten' }}</span>
              }
              <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Haut</label>
            </div>
            <!-- Haar -->
            <div class="flex flex-col">
              @if (editingField() === 'hair') {
                <input pInputText [ngModel]="cs.character().hair" (ngModelChange)="cs.update({ hair: $event })" class="w-full text-xs" (clickOutside)="editingField.set(null)" autofocus />
              } @else {
                <span class="text-sm text-slate-700 cursor-pointer hover:text-slate-500 border border-transparent hover:border-slate-300 rounded px-1 py-0.5 min-h-[1.5rem]" (click)="editingField.set('hair')" pTooltip="Klicken zum Bearbeiten" tooltipPosition="top">{{ cs.character().hair || 'Klicken zum Bearbeiten' }}</span>
              }
              <label class="text-[0.6rem] font-bold uppercase text-gray-600 text-center mt-0.5">Haar</label>
            </div>
          </div>
        </p-fieldset>

        <p-fieldset legend="Charakterbild">
          <app-image-picker
            [imageData]="cs.character().characterImage"
            alt="Charakterbild"
            placeholder="Bild auswählen"
            imageClass="w-40 h-40"
            placeholderClass="w-40 h-40"
            (imageChange)="cs.update({ characterImage: $event })"
          />
        </p-fieldset>
      </div>

      <!-- Appearance -->
      <p-fieldset legend="Aussehen des Charakters">
        <app-markdown-editor
          [value]="cs.character().appearance"
          (valueChange)="cs.update({ appearance: $event })"
          placeholder="Aussehen des Charakters..."
          [minRows]="4"
        />
      </p-fieldset>

      <!-- Backstory -->
      <p-fieldset legend="Hintergrundgeschichte">
        <app-markdown-editor
          [value]="cs.character().backstory"
          (valueChange)="cs.update({ backstory: $event })"
          placeholder="Hintergrundgeschichte..."
          [minRows]="8"
        />
      </p-fieldset>

      <!-- Allies & Organizations -->
      <p-fieldset legend="Verbündete & Organisationen">
        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <app-markdown-editor
            [value]="cs.character().alliesAndOrganizations"
            (valueChange)="cs.update({ alliesAndOrganizations: $event })"
            placeholder="Verbündete & Organisationen..."
            [minRows]="4"
          />
          <app-image-picker
            [imageData]="cs.character().organizationLogo"
            alt="Organisationslogo"
            placeholder="Logo auswählen"
            imageClass="w-28 h-28"
            placeholderClass="w-28 h-28"
            (imageChange)="cs.update({ organizationLogo: $event })"
          />
        </div>
      </p-fieldset>

      <!-- Treasure -->
      <p-fieldset legend="Schätze">
        <app-markdown-editor
          [value]="cs.character().treasure"
          (valueChange)="cs.update({ treasure: $event })"
          placeholder="Schätze..."
          [minRows]="3"
        />
      </p-fieldset>
    </div>
  `,
})
export class AppearanceBackstoryComponent {
  cs = inject(CharacterService);
  editingField = signal<string | null>(null);
}
