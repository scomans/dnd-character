import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-walking-speed',
  templateUrl: './walking-speed.component.html',
  styleUrl: './walking-speed.component.scss',
  imports: [FormsModule, InputGroup, InputNumber],
})
export class WalkingSpeedComponent {
  protected readonly cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);
}
