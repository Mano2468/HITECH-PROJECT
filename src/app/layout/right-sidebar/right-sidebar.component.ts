import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeName, ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-right-sidebar',
  imports: [MatButtonToggleModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './right-sidebar.component.html',
  styleUrl: './right-sidebar.component.css'
})
export class RightSidebarComponent {
  @Input() open = false;
  @Output() closePanel = new EventEmitter<void>();

  private readonly themeService = inject(ThemeService);

  readonly selectedTheme = this.themeService.theme;
  readonly darkMode = this.themeService.darkMode;
  readonly themes: ThemeName[] = ['ocean', 'royal', 'sunset'];

  setTheme(theme: ThemeName): void {
    this.themeService.setTheme(theme);
  }

  setDarkMode(enabled: boolean): void {
    this.themeService.setDarkMode(enabled);
  }
}
