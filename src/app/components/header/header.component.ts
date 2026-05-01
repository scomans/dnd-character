import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabel } from 'primeng/iftalabel';
import { Image } from 'primeng/image';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputText, InputNumber, IftaLabel, Image],
})
export class HeaderComponent {
  cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);
}
