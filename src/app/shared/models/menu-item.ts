export interface MenuItem {
  path: string;
  title: string;
  icon: string;
  class: string;
  groupTitle: boolean;
  role: string[];
  moduleId: number;
  submoduleId?: number;
  permission?: string;
  submenu: MenuItem[];
}
