import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuItem } from '../../shared/models/menu-item';

export interface AppUser {
  username: string;
  fullName: string;
  userId: string;
  roleId: string;
  businessAreaId: string;
  businessSegmentsId: string;
  legalEntityId: string;
  locationId: string;
  departmentId: string;
  deptName: string;
  roleName?: string;
  clientName?: string;
  label?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'fresh-angular21-user';
  private readonly menuStorageKey = 'fresh-angular21-menu';
  private readonly http = inject(HttpClient);
  private readonly currentUserState = signal<AppUser | null>(this.readUser());
  private readonly menuState = signal<MenuItem[]>(this.readMenu());

  readonly currentUser = this.currentUserState.asReadonly();
  readonly menuList = this.menuState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserState());

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<any>(`${environment.apiUrl}/loginApi.php`, { username, password })
      .pipe(
        switchMap((response) => {
          if (!response?.result) {
            return of(false);
          }

          const result = response.result;
          const user: AppUser = {
            username: result.userName || username,
            fullName: result.userFullName || result.userName || username,
            userId: String(result.userId ?? ''),
            roleId: String(result.roleId?.split?.(',')?.[0] ?? result.roleId ?? ''),
            businessAreaId: String(result.businessAreaId ?? 0),
            businessSegmentsId: String(result.businessSegmentsId ?? 0),
            legalEntityId: String(result.legalEntityId ?? 0),
            locationId: String(result.locationId ?? 0),
            departmentId: String(result.departmentId ?? 0),
            deptName: String(result.deptName ?? ''),
            roleName: result.roleName ?? 'Admin',
            clientName: result.clientName ?? '',
            label: result.label ?? ''
          };

          this.persistUser(user, result);
          return this.loadSidebarMenu().pipe(map(() => true));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.menuStorageKey);
    this.currentUserState.set(null);
    this.menuState.set([]);
  }

  loadSidebarMenu(): Observable<MenuItem[]> {
    const user = this.currentUserState();
    if (!user?.userId || !user.roleId) {
      this.menuState.set([]);
      return of([]);
    }

    return this.viewModule(
      user.userId,
      user.roleId,
      user.legalEntityId,
      user.businessSegmentsId,
      user.businessAreaId
    ).pipe(
      switchMap((modules: any[]) => {
        const moduleItems = (modules || []).map((module) => ({
          path: '/dashboard',
          title: module.moduleName,
          icon: module.moduleIcon || 'folder',
          class: 'menu-toggle',
          groupTitle: false,
          role: ['Admin'],
          moduleId: Number(module.moduleId),
          submenu: []
        } satisfies MenuItem));

        if (!moduleItems.length) {
          this.menuState.set([]);
          localStorage.setItem(this.menuStorageKey, JSON.stringify([]));
          return of([]);
        }

        return forkJoin(
          moduleItems.map((module) =>
            this.subModuleList(
              module.moduleId,
              user.userId,
              user.roleId,
              user.legalEntityId,
              user.businessSegmentsId,
              user.businessAreaId
            ).pipe(
              map((submodules: any[]) => ({
                ...module,
                submenu: (submodules || []).map((submodule) => ({
                  path: '/dashboard',
                  title: submodule.subModuleName,
                  icon: submodule.icon || 'chevron_right',
                  class: 'ml-menu',
                  groupTitle: false,
                  role: ['Admin'],
                  moduleId: module.moduleId,
                  submoduleId: Number(submodule.submoduleId),
                  submenu: []
                } satisfies MenuItem))
              }))
            )
          )
        ).pipe(
          tap((menu) => {
            localStorage.setItem(this.menuStorageKey, JSON.stringify(menu));
            this.menuState.set(menu);
          })
        );
      })
    );
  }

  viewLeafMenu(submoduleId: number, moduleId: number): Observable<any[]> {
    const user = this.currentUserState();
    if (!user?.userId || !user.roleId) {
      return of([]);
    }

    return this.http
      .get<any[]>(
        `${environment.apiUrl}/ManuViewAllApi.php?id=${submoduleId}&mid=${moduleId}&userId=${user.userId}&roleId=${user.roleId}`
      )
      .pipe(map((res) => res || []));
  }

  private readUser(): AppUser | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) as AppUser : null;
  }

  private readMenu(): MenuItem[] {
    const raw = localStorage.getItem(this.menuStorageKey);
    return raw ? JSON.parse(raw) as MenuItem[] : [];
  }

  private persistUser(user: AppUser, rawResult: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(rawResult));
    localStorage.setItem('userId', user.userId);
    localStorage.setItem('roleId', user.roleId);
    localStorage.setItem('userName', user.username);
    localStorage.setItem('userFullName', user.fullName);
    localStorage.setItem('businessAreaId', user.businessAreaId);
    localStorage.setItem('businessSegmentsId', user.businessSegmentsId);
    localStorage.setItem('legalEntityId', user.legalEntityId);
    localStorage.setItem('locationId', user.locationId);
    localStorage.setItem('departmentId', user.departmentId);
    localStorage.setItem('deptName', user.deptName);
    localStorage.setItem('roleName', user.roleName ?? '');
    localStorage.setItem('clientName', user.clientName ?? '');
    localStorage.setItem('label', user.label ?? '');
    this.currentUserState.set(user);
  }

  private viewModule(id: string, roleId: string, legalEntityId: string, bus: string, b: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/ViewModuleApi.php?userId=${id}&roleId=${roleId}&legalentityid=${legalEntityId}&businessverticalid=${bus}&businessareaid=${b}`
    );
  }

  private subModuleList(
    id: number,
    userId: string,
    roleId: string,
    legalEntityId: string,
    bus: string,
    b: string
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/subModuleViewApi.php?id=${id}&userId=${userId}&roleId=${roleId}&legalentityid=${legalEntityId}&businessverticalid=${bus}&businessareaid=${b}`
    );
  }


  updateSubmoduleSubmenu(parentModuleId: number, childSubmoduleId: number, submenu: MenuItem[]): void {
    const currentMenu = this.menuState();
    const updatedMenu = currentMenu.map((module) => {
      if (module.moduleId !== parentModuleId) {
        return module;
      }

      return {
        ...module,
        submenu: module.submenu.map((child) => {
          if (child.submoduleId !== childSubmoduleId) {
            return child;
          }

          return {
            ...child,
            submenu
          };
        })
      };
    });

    this.menuState.set(updatedMenu);
    localStorage.setItem(this.menuStorageKey, JSON.stringify(updatedMenu));
  }
  subSubModuleList(
    submoduleId: number,
    moduleId: number,
    userId: string,
    roleId: string
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/ManuViewAllApi.php?id=${submoduleId}&mid=${moduleId}&userId=${userId}&roleId=${roleId}`
    );
  }
}
