import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { PrimeNG } from 'primeng/config';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from './core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  readonly currentUser$ = this.authService.currentUser$;
  isSidebarCollapsed = true;
  readonly useLegacyShell = signal(true);

  constructor(
    private authService: AuthService,
    private router: Router,
    private primeng: PrimeNG,
    private confirmationService: ConfirmationService
  ) {
    // Configurar PrimeNG en español
    this.primeng.setTranslation({
      firstDayOfWeek: 1,
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      today: 'Hoy',
      clear: 'Limpiar',
      weekHeader: 'Sem',
      dateFormat: 'dd/mm/yy',
      accept: 'Aceptar',
      reject: 'Cancelar',
      emptyMessage: 'No se encontraron resultados',
      emptyFilterMessage: 'No se encontraron resultados',
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      this.useLegacyShell.set(this.isLegacyRoute(url));
    });
  }

  private isLegacyRoute(url: string): boolean {
    if (url.startsWith('/busqueda')) return false;
    if (url.startsWith('/admin/')) return false;
    if (url.startsWith('/reportes')) return false;
    if (url.startsWith('/presentacion/')) return false;
    if (/\/expedientes\/[^/]+$/.test(url)) return false;
    if (/\/expedientes\/[^/]+\?/.test(url)) return false;
    return true;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onLogout(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea cerrar sesión?',
      header: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      acceptLabel: 'Cerrar Sesión',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.authService.logout().subscribe(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }

  onRapidSearch(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    const query = (target.value ?? '').trim().slice(0, 100);
    if (query) {
      this.router.navigate(['/busqueda'], { queryParams: { numero: query } });
    }
  }
}

