import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/character-sheet/character-sheet.component').then(
        (m) => m.CharacterSheetComponent
      ),
  },
];
