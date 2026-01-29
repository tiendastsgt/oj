import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [RouterModule, LoginComponent, ChangePasswordComponent],
  exports: [LoginComponent, ChangePasswordComponent]
})
export class AuthModule {}
