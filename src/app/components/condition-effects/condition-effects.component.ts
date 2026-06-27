import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Message } from 'primeng/message';
import { CharacterService } from '../../services/character.service';
import { CONDITIONS, ENVIRONMENTS, EXHAUSTION_EFFECTS } from '../../models/character.model';

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

  private readonly activeConditions = computed(() => {
    const char = this.cs.character();
    return CONDITIONS.filter((c) => (char.conditions ?? []).includes(c.key));
  });

  private readonly activeEnvironments = computed(() => {
    const char = this.cs.character();
    return ENVIRONMENTS.filter((e) => (char.environments ?? []).includes(e.key));
  });

  private readonly activeExhaustion = computed(() => {
    const level = this.cs.character().exhaustionLevel ?? 0;
    return level > 0 ? EXHAUSTION_EFFECTS.slice(0, level) : [];
  });

  allActiveEffects = computed(() => {
    const effects: { severity: 'error' | 'warn' | 'info' | 'secondary'; text: string }[] = [];

    for (const cond of this.activeConditions()) {
      for (const effect of cond.effects) {
        effects.push({ severity: 'error', text: `${cond.icon} ${cond.label}: ${effect}` });
      }
    }

    for (const effect of this.activeExhaustion()) {
      effects.push({ severity: 'warn', text: `⚠️ ${effect}` });
    }

    for (const env of this.activeEnvironments()) {
      for (const effect of env.effects) {
        effects.push({ severity: 'info', text: `${env.icon} ${env.label}: ${effect}` });
      }
    }

    if (this.cs.character().inspiration) {
      effects.push({ severity: 'secondary', text: '⭐ Inspiration aktiv' });
    }

    return effects;
  });

  hasAnyActive = computed(() => this.allActiveEffects().length > 0);
}
