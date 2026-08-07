import { Component, computed, inject } from '@angular/core';
import { Message } from '@openng/optimus-ui/message';
import { CharacterService } from '../../services/character.service';
import { computeActiveEffects } from '../../models/character.model';

@Component({
  selector: 'app-condition-effects',
  templateUrl: './condition-effects.component.html',
  styleUrl: './condition-effects.component.scss',
  imports: [Message],
})
export class ConditionEffectsComponent {
  private readonly cs = inject(CharacterService);

  allActiveEffects = computed(() => computeActiveEffects(this.cs.character()));
  hasAnyActive = computed(() => this.allActiveEffects().length > 0);
}
