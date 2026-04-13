import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { ImagePickerComponent } from '../image-picker/image-picker.component';

@Component({
  selector: 'app-appearance-backstory',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputGroupModule, InputGroupAddonModule, FieldsetModule, TooltipModule, IftaLabelModule, MarkdownEditorComponent, ImagePickerComponent],
  template: `
    <div class="space-y-3">
      <!-- Physical Characteristics + Character Image at top -->
      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <p-fieldset legend="Körperliche Merkmale">
          <div class="grid grid-cols-3 gap-2 text-xs">
            <p-iftalabel>
              <input pInputText [ngModel]="cs.character().age" (ngModelChange)="cs.update({ age: $event })" class="w-full text-xs" id="phys-age" />
              <label for="phys-age">Alter</label>
            </p-iftalabel>
            <p-iftalabel>
              <input pInputText [ngModel]="cs.character().height" (ngModelChange)="cs.update({ height: $event })" class="w-full text-xs" id="phys-height" />
              <label for="phys-height">Größe (m)</label>
            </p-iftalabel>
            <p-iftalabel>
              <input pInputText [ngModel]="cs.character().weight" (ngModelChange)="cs.update({ weight: $event })" class="w-full text-xs" id="phys-weight" />
              <label for="phys-weight">Gewicht (kg)</label>
            </p-iftalabel>
            <p-iftalabel>
              <input pInputText [ngModel]="cs.character().eyes" (ngModelChange)="cs.update({ eyes: $event })" class="w-full text-xs" id="phys-eyes" />
              <label for="phys-eyes">Augenfarbe</label>
            </p-iftalabel>
            <p-iftalabel>
              <input pInputText [ngModel]="cs.character().skin" (ngModelChange)="cs.update({ skin: $event })" class="w-full text-xs" id="phys-skin" />
              <label for="phys-skin">Hautfarbe</label>
            </p-iftalabel>
            <p-iftalabel>
              <input pInputText [ngModel]="cs.character().hair" (ngModelChange)="cs.update({ hair: $event })" class="w-full text-xs" id="phys-hair" />
              <label for="phys-hair">Haarfarbe</label>
            </p-iftalabel>
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
}
