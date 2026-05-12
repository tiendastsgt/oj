import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ChangePasswordService } from './change-password.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-change-password',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, CardModule, PasswordModule, ButtonModule, MessageModule],
  providers: [ChangePasswordService],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  protected svc = inject(ChangePasswordService);
  protected dto = this.svc.dto;
}
