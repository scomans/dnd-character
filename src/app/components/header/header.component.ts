import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutside } from 'ngxtension/click-outside';
import { IftaLabel } from 'primeng/iftalabel';
import { Image } from 'primeng/image';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';


@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    InputText,
    InputNumber,
    Tooltip,
    IftaLabel,
    Image,
    ClickOutside,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  cs = inject(CharacterService);
  editingName = signal(false);
}
