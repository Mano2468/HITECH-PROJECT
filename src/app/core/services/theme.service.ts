import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';

export type ThemeName = 'ocean' | 'royal' | 'sunset';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeKey = 'fresh-angular21-theme';
  private readonly darkKey = 'fresh-angular21-dark';

  private readonly themeState = signal<ThemeName>('ocean');
  private readonly darkState = signal(false);

  readonly theme = this.themeState.asReadonly();
  readonly darkMode = this.darkState.asReadonly();

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  initialize(): void {
    const savedTheme = (localStorage.getItem(this.themeKey) as ThemeName | null) ?? 'ocean';
    const savedDark = localStorage.getItem(this.darkKey) === 'true';
    this.setTheme(savedTheme);
    this.setDarkMode(savedDark);
  }

  setTheme(theme: ThemeName): void {
    const body = this.document.body;
    body.classList.remove('theme-ocean', 'theme-royal', 'theme-sunset');
    body.classList.add(`theme-${theme}`);
    localStorage.setItem(this.themeKey, theme);
    this.themeState.set(theme);
  }

  setDarkMode(enabled: boolean): void {
    this.document.body.classList.toggle('dark-shell', enabled);
    localStorage.setItem(this.darkKey, String(enabled));
    this.darkState.set(enabled);
  }
}
