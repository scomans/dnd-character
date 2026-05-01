import { Injectable, signal, effect, PLATFORM_ID, inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'dnd-wake-lock';

@Injectable({ providedIn: 'root' })
export class WakeLockService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Whether the wake lock (always-on screen) is enabled */
  readonly enabled = signal(this.loadInitialState());

  private wakeLock: WakeLockSentinel | null = null;

  /** Whether the Wake Lock API is supported in this browser */
  readonly supported = this.isBrowser && 'wakeLock' in navigator;

  constructor() {
    effect(() => {
      const isEnabled = this.enabled();
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isEnabled));
        if (isEnabled) {
          void this.requestWakeLock();
        } else {
          void this.releaseWakeLock();
        }
      }
    });

    // Re-acquire wake lock when the page becomes visible again
    if (this.isBrowser) {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
    void this.releaseWakeLock();
  }

  toggle(): void {
    this.enabled.update((v) => !v);
  }

  private onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && this.enabled()) {
      void this.requestWakeLock();
    }
  };

  private async requestWakeLock(): Promise<void> {
    if (!this.supported || this.wakeLock) return;
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });
    } catch {
      // Wake lock request failed (e.g., low battery, page not visible)
    }
  }

  private async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  private loadInitialState(): boolean {
    if (!this.isBrowser) return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored) === true;
    }
    return false;
  }
}
