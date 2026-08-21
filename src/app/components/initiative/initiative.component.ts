import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-initiative',
  templateUrl: './initiative.component.html',
  styleUrl: './initiative.component.scss',
  imports: [FormsModule, Tooltip],
})
export class InitiativeComponent {
  protected readonly cs = inject(CharacterService);
}
