import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CN_CONFIG, CnConfig, CnThemeName } from './canopy-config';

const THEME_CLASS_PREFIX = 'cn-theme-';
const ALL_THEMES: CnThemeName[] = ['light', 'high-contrast'];

/**
 * Switches the active Canopy theme by toggling `cn-theme-*` classes on `<html>`. The theme mixin
 * emits every variant, so no stylesheet is loaded at runtime.
 *
 * Respects `forced-colors` on first load when nothing is persisted.
 */
@Injectable({ providedIn: 'root' })
export class CnThemeService implements OnDestroy {
  private readonly current$ = new BehaviorSubject<CnThemeName>('light');
  private readonly mediaForced: MediaQueryList | null;
  private readonly onSystemChange = () => this.applySystemPreference();

  constructor(@Inject(DOCUMENT) private readonly document: Document,
              @Optional() @Inject(CN_CONFIG) private readonly config: CnConfig) {
    const win = this.document.defaultView;
    this.mediaForced = win && typeof win.matchMedia === 'function' ? win.matchMedia('(forced-colors: active)') : null;

    const persisted = this.readPersisted();
    if (persisted) {
      this.setTheme(persisted, false);
    } else {
      this.applySystemPreference();
    }
    this.mediaForced?.addEventListener?.('change', this.onSystemChange);
  }

  get theme(): CnThemeName {
    return this.current$.value;
  }

  get theme$(): Observable<CnThemeName> {
    return this.current$.asObservable();
  }

  setTheme(theme: CnThemeName, persist = true): void {
    const root = this.document.documentElement;
    ALL_THEMES.forEach(t => root.classList.remove(THEME_CLASS_PREFIX + t));
    root.classList.add(THEME_CLASS_PREFIX + theme);
    this.current$.next(theme);
    if (persist) {
      this.writePersisted(theme);
    }
  }

  ngOnDestroy(): void {
    this.mediaForced?.removeEventListener?.('change', this.onSystemChange);
  }

  private applySystemPreference(): void {
    if (this.readPersisted()) {
      return;
    }
    if (this.mediaForced?.matches) {
      this.setTheme('high-contrast', false);
    } else {
      this.setTheme(this.config?.defaultTheme ?? 'light', false);
    }
  }

  private readPersisted(): CnThemeName | null {
    const key = this.config?.themeStorageKey;
    if (!key) {
      return null;
    }
    try {
      const value = this.document.defaultView?.localStorage?.getItem(key);
      return ALL_THEMES.includes(value as CnThemeName) ? (value as CnThemeName) : null;
    } catch {
      // Safari private mode and the kiosk build throw on storage access.
      return null;
    }
  }

  private writePersisted(theme: CnThemeName): void {
    const key = this.config?.themeStorageKey;
    if (!key) {
      return;
    }
    try {
      this.document.defaultView?.localStorage?.setItem(key, theme);
    } catch {
      // ignore, see readPersisted
    }
  }
}
