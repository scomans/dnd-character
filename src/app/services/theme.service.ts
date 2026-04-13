import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'dnd-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Whether dark mode is currently active */
  readonly darkMode = signal(this.loadInitialState());

  constructor() {
    effect(() => {
      const isDark = this.darkMode();
      if (this.isBrowser) {
        document.documentElement.classList.toggle('dark-mode', isDark);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isDark));
      }
    });
  }

  /** Toggle dark mode on/off */
  toggleDarkMode(): void {
    this.darkMode.update((v) => !v);
  }

  private loadInitialState(): boolean {
    if (!this.isBrowser) return false;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored) === true;
    }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
