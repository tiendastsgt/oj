import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OjShellBreadcrumbItem, OjShellSection, OjShellUser } from './oj-shell.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-oj-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './oj-shell.component.html',
  styleUrls: ['./oj-shell.component.scss'],
})
export class OjShellComponent {
  sections = input.required<OjShellSection[]>();
  title = input.required<string>();
  breadcrumb = input<OjShellBreadcrumbItem[]>([]);
  user = input<OjShellUser | null>(null);
  logoutRoute = input<string>('/login');
}
