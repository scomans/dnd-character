import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { Tooltip } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import {
  Condition,
  CONDITIONS,
  computeActiveEffects,
  Environment,
  ENVIRONMENTS,
  EXHAUSTION_EFFECTS,
} from '../../models/character.model';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faHeartPulse,
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
  protected readonly fasWarning = faHeartPulse;

  showDialog = signal(false);

  allActiveEffects = computed(() => computeActiveEffects(this.cs.character()));

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
