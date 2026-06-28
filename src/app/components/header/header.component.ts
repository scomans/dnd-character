import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { IftaLabel } from 'primeng/iftalabel';
import { Image } from 'primeng/image';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { XP_THRESHOLDS } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputText, InputNumber, IftaLabel, Image, Button, Dialog, FaIconComponent, Tooltip],
})
export class HeaderComponent {
  cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);
  protected readonly fasPlus = faPlus;
  protected readonly fasMinus = faMinus;
  protected readonly showEpDialog = signal(false);
  protected readonly epOptions = [50, 100, 200, 500, 1000, 2000, 5000];

  getNextLevelXP(): number | null {
    const level = this.cs.character().level ?? 1;
    if (level >= 20 || level + 1 >= XP_THRESHOLDS.length) return null;
    return XP_THRESHOLDS[level + 1] ?? null;
  }

  addEP(amount: number): void {
    const current = this.cs.character().experiencePoints ?? 0;
    this.cs.update({ experiencePoints: current + amount });
    this.showEpDialog.set(false);
  }
}
