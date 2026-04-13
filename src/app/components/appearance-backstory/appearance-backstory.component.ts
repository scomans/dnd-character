import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import { ImagePickerComponent } from '../image-picker/image-picker.component';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';


@Component({
  selector: 'app-appearance-backstory',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
    FieldsetModule,
    TooltipModule,
    IftaLabelModule,
    MarkdownEditorComponent,
    ImagePickerComponent,
    InputNumber,
  ],
  template: `
    <div class="space-y-3">
      <!-- Physical Characteristics + Character Image at top -->
      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <p-fieldset legend="Merkmale">
          <div class="grid grid-cols-3 gap-2 text-xs">
            <p-iftalabel>
              <p-input-number
                [ngModel]="cs.character().age"
                (ngModelChange)="cs.update({ age: $event })"
                [showButtons]="false"
                [min]="0"
                [minFractionDigits]="0"
                [maxFractionDigits]="0"
                class="w-full text-xs"
                id="phys-age"
                size="small"
              />
              <label for="phys-age">Alter</label>
            </p-iftalabel>
            <p-iftalabel>
              <p-input-number
                [ngModel]="cs.character().height"
                (ngModelChange)="cs.update({ height: $event })"
                [showButtons]="false"
                [min]="0"
                [minFractionDigits]="0"
                [maxFractionDigits]="2"
                class="w-full text-xs"
                id="phys-height"
                suffix="m"
                size="small"
              />
              <label for="phys-height">Größe (m)</label>
            </p-iftalabel>
            <p-iftalabel>
              <p-input-number
                [ngModel]="cs.character().weight"
                (ngModelChange)="cs.update({ weight: $event })"
                [showButtons]="false"
                [min]="0"
                [minFractionDigits]="0"
                [maxFractionDigits]="2"
                class="w-full text-xs"
                id="phys-weight"
                suffix="kg"
                size="small"
              />
              <label for="phys-weight">Gewicht</label>
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
            <p-iftalabel>
              <input pInputText [ngModel]="cs.character().gender" (ngModelChange)="cs.update({ gender: $event })" class="w-full text-xs" id="phys-gender" />
              <label for="phys-gender">Geschlecht</label>
            </p-iftalabel>
            <p-iftalabel>
              <input pInputText [ngModel]="cs.character().faith" (ngModelChange)="cs.update({ faith: $event })" class="w-full text-xs" id="phys-faith" />
              <label for="phys-faith">Glaube / Gottheit</label>
            </p-iftalabel>
            <p-iftalabel>
              <p-select
                [ngModel]="cs.character().sizeCategory"
                (ngModelChange)="cs.update({ sizeCategory: $event })"
                [options]="sizeCategories"
                optionLabel="label"
                optionValue="value"
                placeholder=" "
                [style]="{ width: '100%', fontSize: '0.75rem' }"
                appendTo="body"
                inputId="phys-size"
              />
              <label for="phys-size">Größenkategorie</label>
            </p-iftalabel>
          </div>
        </p-fieldset>

        <p-fieldset legend="Charakterbild">
          <app-image-picker
            [imageData]="cs.character().characterImage"
            alt="Charakterbild"
            placeholder="Bild auswählen"
            imageClass="w-50 h-70"
            placeholderClass="w-50 h-70"
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

  sizeCategories = [
    { value: '', label: 'Keine' },
    { value: 'Winzig', label: 'Winzig' },
    { value: 'Klein', label: 'Klein' },
    { value: 'Mittelgroß', label: 'Mittelgroß' },
    { value: 'Groß', label: 'Groß (Large)' },
    { value: 'Riesig', label: 'Riesig' },
    { value: 'Gigantisch', label: 'Gigantisch' },
  ];
}
