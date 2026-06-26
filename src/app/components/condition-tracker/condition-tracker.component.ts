import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import {
  Condition,
  CONDITIONS,
  Environment,
  ENVIRONMENTS,
  EXHAUSTION_EFFECTS,
} from '../../models/character.model';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faExclamationTriangle,
  faMinus,
  faPlus,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-condition-tracker',
  templateUrl: './condition-tracker.component.html',
  styleUrl: './condition-tracker.component.scss',
  imports: [
    Button,
    Checkbox,
    Dialog,
    FaIconComponent,
    FormsModule,
    InputNumber,
    Message,
    Tooltip,
  ],
})
export class ConditionTrackerComponent {
  protected readonly cs = inject(CharacterService);
  protected readonly conditions = CONDITIONS;
  protected readonly environments = ENVIRONMENTS;
  protected readonly exhaustionEffects = EXHAUSTION_EFFECTS;
  protected readonly fasPlus = faPlus;
  protected readonly fasMinus = faMinus;
  protected readonly fasTimes = faTimes;
  protected readonly fasWarning = faExclamationTriangle;

  showDialog = signal(false);

  activeConditions = computed(() => {
    const char = this.cs.character();
    return CONDITIONS.filter((c) => (char.conditions ?? []).includes(c.key));
  });

  activeEnvironments = computed(() => {
    const char = this.cs.character();
    return ENVIRONMENTS.filter((e) => (char.environments ?? []).includes(e.key));
  });

  activeExhaustion = computed(() => {
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

  openDialog(): void {
    this.showDialog.set(true);
  }

  isConditionActive(key: Condition): boolean {
    return (this.cs.character().conditions ?? []).includes(key);
  }

  toggleCondition(key: Condition): void {
    const current = this.cs.character().conditions ?? [];
    const updated = current.includes(key)
      ? current.filter((c) => c !== key)
      : [...current, key];
    this.cs.update({ conditions: updated });
  }

  isEnvironmentActive(key: Environment): boolean {
    return (this.cs.character().environments ?? []).includes(key);
  }

  toggleEnvironment(key: Environment): void {
    const current = this.cs.character().environments ?? [];
    const updated = current.includes(key)
      ? current.filter((e) => e !== key)
      : [...current, key];
    this.cs.update({ environments: updated });
  }

  getExhaustionLevel(): number {
    return this.cs.character().exhaustionLevel ?? 0;
  }

  setExhaustionLevel(level: number): void {
    this.cs.update({ exhaustionLevel: Math.max(0, Math.min(6, level)) });
  }

  resetAll(): void {
    this.cs.update({
      conditions: [],
      exhaustionLevel: 0,
      environments: [],
      inspiration: false,
    });
  }
}
