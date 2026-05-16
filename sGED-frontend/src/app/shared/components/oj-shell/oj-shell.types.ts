export interface OjShellNavItem {
  label: string;
  icon: string;
  route?: string;
  badge?: string | number;
  active?: boolean;
}

export interface OjShellSection {
  label: string;
  items: OjShellNavItem[];
}

export interface OjShellBreadcrumbItem {
  label: string;
  route?: string;
}

export interface OjShellUser {
  name: string;
  role: string;
  initials: string;
}
