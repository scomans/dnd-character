import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [
    `:host {
      display: block;
      min-height: 100dvh;
      width: 100%;
      background: #f5f5f5;
      transition: background-color 0.2s ease;
    }`,
    `:host-context(.dark-mode) {
      background: #1a1d23;
    }`,
  ],
})
export class App {
  // Inject ThemeService to ensure it initializes early and applies the dark-mode class
  private readonly theme = inject(ThemeService);
}
