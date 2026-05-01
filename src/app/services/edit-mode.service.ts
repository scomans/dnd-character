import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EditModeService {
  readonly isEditMode = signal(false);

  toggle(): void {
    this.isEditMode.update((v) => !v);
  }
}
