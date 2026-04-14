import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutside } from 'ngxtension/click-outside';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';


@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    InputTextModule,
    InputNumberModule,
    TooltipModule,
    IftaLabelModule,
    ImageModule,
    ClickOutside,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  cs = inject(CharacterService);
  editingName = signal(false);
}
