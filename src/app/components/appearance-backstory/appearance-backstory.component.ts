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
  templateUrl: './appearance-backstory.component.html',
  styleUrl: './appearance-backstory.component.scss',
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
