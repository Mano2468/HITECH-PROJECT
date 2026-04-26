import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MenuItem } from '../../shared/models/menu-item';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, NgFor, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapsed = new EventEmitter<void>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly items = this.auth.menuList;
  activeModuleId?: number;
  activeSubmoduleId?: number;
  activeSubSubmoduleId?: number;
  loadingSubmoduleId?: number;

  trackByModuleId(_: number, item: MenuItem): number {
    return item.moduleId;
  }

  trackBySubmoduleId(_: number, item: MenuItem): number {
    return item.submoduleId ?? item.moduleId;
  }

  isFontIcon(icon?: string): boolean {
    const value = icon?.trim();
    return !!value && (
      value.includes(' ') || value.includes('-') || /^(fa|ti|bx|la|icon|flaticon|simpleline|material-icons?)/.test(value)
    );
  }

  toggleTopMenu(item: MenuItem): void {
    if (this.collapsed) {
      this.toggleCollapsed.emit();
      return;
    }

    if (!item.submenu?.length) {
      this.router.navigateByUrl(item.path || '/dashboard');
      return;
    }

    if (this.activeModuleId === item.moduleId) {
      this.activeModuleId = undefined;
      this.activeSubmoduleId = undefined;
      this.activeSubSubmoduleId = undefined;
      return;
    }

    this.activeModuleId = item.moduleId;
    this.activeSubmoduleId = undefined;
    this.activeSubSubmoduleId = undefined;
  }

  toggleFirstLevel(parent: MenuItem, child: MenuItem, event: MouseEvent): void {
    event.stopPropagation();

    if (!child.submenu?.length && child.submoduleId) {
      this.activeModuleId = parent.moduleId;
      this.activeSubmoduleId = child.submoduleId;
      this.activeSubSubmoduleId = undefined;
      this.loadingSubmoduleId = child.submoduleId;
      this.loadSubSubmenu(parent, child);
      return;
    }

    if (!child.submenu?.length) {
      this.openLeafMenu(child);
      return;
    }

    if (this.activeSubmoduleId === child.submoduleId && this.activeModuleId === parent.moduleId) {
      this.activeSubmoduleId = undefined;
      this.activeSubSubmoduleId = undefined;
      return;
    }

    this.activeModuleId = parent.moduleId;
    this.activeSubmoduleId = child.submoduleId;
    this.activeSubSubmoduleId = undefined;
  }

  toggleSecondLevel(parent: MenuItem, child: MenuItem, grandChild: MenuItem, event: MouseEvent): void {
    event.stopPropagation();

    if (!grandChild.submenu?.length) {
      this.openLeafMenu(grandChild);
      return;
    }

    if (this.activeSubSubmoduleId === grandChild.submoduleId && this.activeSubmoduleId === child.submoduleId) {
      this.activeSubSubmoduleId = undefined;
      return;
    }

    this.activeModuleId = parent.moduleId;
    this.activeSubmoduleId = child.submoduleId;
    this.activeSubSubmoduleId = grandChild.submoduleId;
  }

  private loadSubSubmenu(parent: MenuItem, item: MenuItem): void {
    const user = this.auth.currentUser();
    if (!user?.userId || !user.roleId || !item.submoduleId) {
      this.openLeafMenu(item);
      return;
    }

    this.auth.subSubModuleList(item.submoduleId, parent.moduleId, user.userId, user.roleId).subscribe((res) => {
      const submenu = (res || []).map((entry: any) => ({
        path: entry.functionURL || '',
        title: entry.menuLinkName || entry.title || '',
        icon: entry.icon || '',
        class: entry.class || '',
        groupTitle: false,
        role: ['Admin'],
        moduleId: parent.moduleId,
        submoduleId: Number(entry.menuLinkId ?? entry.submoduleId ?? 0),
        permission: String(entry.permission ?? ''),
        submenu: []
      } as MenuItem));

      this.auth.updateSubmoduleSubmenu(parent.moduleId, item.submoduleId!, submenu);
      this.loadingSubmoduleId = undefined;
      this.activeModuleId = parent.moduleId;
      this.activeSubmoduleId = item.submoduleId;
      this.activeSubSubmoduleId = undefined;

      if (!submenu.length) {
        this.openLeafMenu(item);
      }
    }, () => {
      this.loadingSubmoduleId = undefined;
    });
  }

  openLeafMenu(item: MenuItem): void {
    if (!item.submoduleId || !item.moduleId) {
      this.router.navigateByUrl(item.path || '/dashboard');
      return;
    }

    this.auth.viewLeafMenu(item.submoduleId, item.moduleId).subscribe((res) => {
      const first = res?.[0];
      if (first?.functionURL) {
        localStorage.setItem('menuLinkId', String(first.menuLinkId ?? ''));
        localStorage.setItem('permission', String(first.permission ?? ''));
      }
      this.router.navigateByUrl(item.path || '/dashboard');
    });
  }
}
