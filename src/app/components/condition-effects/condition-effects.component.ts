import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Message } from 'primeng/message';
import { CharacterService } from '../../services/character.service';
import { computeActiveEffects } from '../../models/character.model';

@Component({
  selector: 'app-condition-effects',
  template: `
    @if (hasAnyActive()) {
      <div class="mt-2 space-y-1 w-full">
        @for (effect of allActiveEffects(); track effect.text) {
          <p-message [severity]="effect.severity" class="w-full">
            <span class="text-xs">{{ effect.text }}</span>
          </p-message>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Message],
})
export class ConditionEffectsComponent {
  private readonly cs = inject(CharacterService);

  allActiveEffects = computed(() => computeActiveEffects(this.cs.character()));

  hasAnyActive = computed(() => this.allActiveEffects().length > 0);
}
