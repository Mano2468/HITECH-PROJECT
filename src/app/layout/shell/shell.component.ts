import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RightSidebarComponent } from '../right-sidebar/right-sidebar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, RightSidebarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  settingsOpen = false;
  sidebarCollapsed = false;

  toggleSettingsPanel(): void {
    this.settingsOpen = !this.settingsOpen;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    if (this.sidebarCollapsed) {
      this.settingsOpen = false;
    }
  }
}
