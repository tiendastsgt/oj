import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['requiredRole'];
    const currentUser = this.authService.getCurrentUser();

    if (!requiredRole) {
      return true;
    }

    if (currentUser && currentUser.rol === requiredRole) {
      return true;
    }

    this.router.navigate(['/expedientes']);
    return false;
  }
}
