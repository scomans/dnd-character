import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-walking-speed',
  templateUrl: './walking-speed.component.html',
  styleUrl: './walking-speed.component.scss',
  imports: [FormsModule, InputNumber],
})
export class WalkingSpeedComponent {
  protected readonly cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);

  protected readonly speed = computed(() => {
    const baseSpeed = this.cs.character().speed;

    let speedModifier = this.cs.character().exhaustionLevel >= 2 ? 0.5 : 1;

    for (const condition of this.cs.character().conditions) {
      switch (condition) {
        case 'paralyzed':
        case 'restrained':
        case 'unconscious':
        case 'grappled':
        case 'petrified':
          speedModifier = 0;
          break;
      }
    }
    if (this.cs.character().hitPointsCurrent === 0) {
      speedModifier = 0;
    }
    return baseSpeed * speedModifier;
  });
}
