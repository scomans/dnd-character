import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { IftaLabel } from '@openng/optimus-ui/iftalabel';
import { Image } from '@openng/optimus-ui/image';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { XP_THRESHOLDS } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    Dialog,
    FaIconComponent,
    FormsModule,
    IftaLabel,
    Image,
    InputGroup,
    InputGroupAddon,
    InputNumber,
    InputText,
    Tooltip,
  ],
})
export class HeaderComponent {
  protected readonly cs = inject(CharacterService);
  protected readonly editMode = inject(EditModeService);
  protected readonly fasPlus = faPlus;
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
