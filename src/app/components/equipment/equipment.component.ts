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
import { faBars, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { ConfirmDialog } from '@openng/optimus-ui/confirmdialog';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Equipment } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { EditModeService } from '../../services/edit-mode.service';
import { NumberInputComponent } from '../number-input/number-input.component';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    ConfirmDialog,
    DecimalPipe,
    FaIconComponent,
    Fieldset,
    FormsModule,
    InputNumber,
    InputText,
    NumberInputComponent,
    Tooltip,
  ],
  providers: [ConfirmationService],
})
export class EquipmentComponent {
  public readonly fasBars = faBars;
  public readonly fasPlus = faPlus;
  public readonly fasTrash = faTrash;
  protected readonly cs = inject(CharacterService);
  private readonly confirmationService = inject(ConfirmationService);
  protected readonly isEditMode = inject(EditModeService).isEditMode;

  // Reversed order: highest value first
  coins = [
    { key: 'pp', label: 'PM', tooltip: 'Platinmünzen' },
    { key: 'gp', label: 'GM', tooltip: 'Goldmünzen' },
    { key: 'ep', label: 'EM', tooltip: 'Elektrummünzen' },
    { key: 'sp', label: 'SM', tooltip: 'Silbermünzen' },
    { key: 'cp', label: 'KM', tooltip: 'Kupfermünzen' },
  ];

  getCurrency(key: string): number {
    const char = this.cs.character();
    return (char.currency as unknown as Record<string, number>)[key] ?? 0;
  }

  updateCurrency(key: string, value: number | null): void {
    const char = this.cs.character();
    this.cs.update({ currency: { ...char.currency, [key]: value ?? 0 } });
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
