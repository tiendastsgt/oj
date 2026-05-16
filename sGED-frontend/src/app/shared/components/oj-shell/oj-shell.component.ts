import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OjShellBreadcrumbItem, OjShellSection, OjShellUser } from './oj-shell.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-oj-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './oj-shell.component.html',
  styleUrls: ['./oj-shell.component.scss']
})
export class OjShellComponent {
  @Input({ required: true }) sections: OjShellSection[] = [];
  @Input({ required: true }) title = '';
  @Input() breadcrumb: OjShellBreadcrumbItem[] = [];
  @Input() user: OjShellUser | null = null;
  @Input() logoutRoute = '/login';
}
