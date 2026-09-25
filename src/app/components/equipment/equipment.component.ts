import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars, faMinus, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '@openng/optimus-ui/api';
import { Button, ButtonDirective } from '@openng/optimus-ui/button';
import { ConfirmDialog } from '@openng/optimus-ui/confirmdialog';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Currency, Equipment } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    ButtonDirective,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    ConfirmDialog,
    DecimalPipe,
    FaIconComponent,
    Fieldset,
    FormsModule,
    InputGroup,
    InputGroupAddon,
    InputNumber,
    InputText,
    Tooltip,
  ],
  providers: [ConfirmationService],
})
export class EquipmentComponent {
  public readonly fasBars = faBars;
  public readonly fasMinus = faMinus;
  public readonly fasPlus = faPlus;
  public readonly fasTrash = faTrash;
  protected readonly cs = inject(CharacterService);
  private readonly confirmationService = inject(ConfirmationService);
  protected readonly isEditMode = inject(EditModeService).isEditMode;

  // Reversed order: highest value first
  coins = [
    { key: 'pp', label: 'PM', tooltip: 'Platinmünzen' },
    { key: 'gp', label: 'GM', tooltip: 'Goldmünzen' },
    { key: 'sp', label: 'SM', tooltip: 'Silbermünzen' },
    { key: 'cp', label: 'KM', tooltip: 'Kupfermünzen' },
  ];

  // Value of each coin denomination, expressed in copper pieces
  private readonly coinValueInCopper: Record<string, number> = {
    cp: 1,
    sp: 10,
    gp: 100,
    pp: 1000,
  };

  getCurrency(key: string): number {
    const char = this.cs.character();
    return (char.currency as unknown as Record<string, number>)[key] ?? 0;
  }

  updateCurrency(key: string, value: number | null): void {
    const char = this.cs.character();
    this.cs.update({ currency: { ...char.currency, [key]: Math.max(0, value ?? 0) } });
  }

  onCurrencyInput(key: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = raw === '' ? 0 : Number(raw);
    if (!Number.isNaN(value)) {
      this.updateCurrency(key, value);
    }
  }

  /** Adjust a coin denomination by one, exchanging into bigger/smaller coins as needed. */
  adjustCurrency(key: string, direction: 1 | -1): void {
    const totalCopper = this.getTotalCopper() + direction * this.coinValueInCopper[key];
    this.cs.update({ currency: this.copperToCurrency(Math.max(0, totalCopper)) });
  }

  private getTotalCopper(): number {
    const { cp, sp, gp, pp } = this.cs.character().currency;
    return cp + sp * 10 + gp * 100 + pp * 1000;
  }

  private copperToCurrency(totalCopper: number): Currency {
    const pp = Math.floor(totalCopper / 1000);
    const gp = Math.floor((totalCopper % 1000) / 100);
    const sp = Math.floor((totalCopper % 100) / 10);
    const cp = totalCopper % 10;
    return { cp, sp, gp, pp };
  }

  // === Main Equipment ===

  addItem(): void {
    const char = this.cs.character();
    const equipment = [...char.equipment, { name: '', quantity: 1, weight: 0, description: '' }];
    this.cs.update({ equipment });
  }

  confirmRemoveItem(index: number, name: string): void {
    this.confirmationService.confirm({
      message: `„${name || 'Unbenannt'}" wirklich löschen?`,
      header: 'Gegenstand löschen',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.removeItem(index),
    });
  }

  removeItem(index: number): void {
    const char = this.cs.character();
    const equipment = char.equipment.filter((_, i) => i !== index);
    this.cs.update({ equipment });
  }

  updateEquipment(): void {
    const char = this.cs.character();
    this.cs.update({ equipment: [...char.equipment] });
  }

  dropEquipment(event: CdkDragDrop<Equipment[]>): void {
    const char = this.cs.character();
    const equipment = [...char.equipment];
    moveItemInArray(equipment, event.previousIndex, event.currentIndex);
    this.cs.update({ equipment });
  }

  getTotalWeight(): number {
    return this.cs
      .character()
      .equipment.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  }

  // === Additional Equipment ===

  addAdditionalItem(): void {
    const char = this.cs.character();
    const additionalEquipment = [
      ...(char.additionalEquipment ?? []),
      { name: '', quantity: 1, weight: 0, description: '' },
    ];
    this.cs.update({ additionalEquipment });
  }

  confirmRemoveAdditionalItem(index: number, name: string): void {
    this.confirmationService.confirm({
      message: `„${name || 'Unbenannt'}" wirklich löschen?`,
      header: 'Gegenstand löschen',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.removeAdditionalItem(index),
    });
  }

  removeAdditionalItem(index: number): void {
    const char = this.cs.character();
    const additionalEquipment = (char.additionalEquipment ?? []).filter((_, i) => i !== index);
    this.cs.update({ additionalEquipment });
  }

  updateAdditionalEquipment(): void {
    const char = this.cs.character();
    this.cs.update({ additionalEquipment: [...(char.additionalEquipment ?? [])] });
  }

  dropAdditionalEquipment(event: CdkDragDrop<Equipment[]>): void {
    const char = this.cs.character();
    const additionalEquipment = [...(char.additionalEquipment ?? [])];
    moveItemInArray(additionalEquipment, event.previousIndex, event.currentIndex);
    this.cs.update({ additionalEquipment });
  }

  getAdditionalTotalWeight(): number {
    return (this.cs.character().additionalEquipment ?? []).reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0,
    );
  }
}
