import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OjShellComponent } from '../../../shared/components/oj-shell/oj-shell.component';
import { BusquedaContainerService } from './busqueda-container.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-busqueda-container',
  standalone: true,
  imports: [CommonModule, RouterLink, OjShellComponent],
  providers: [BusquedaContainerService],
  templateUrl: './busqueda-container.component.html',
  styleUrls: ['./busqueda-container.component.scss']
})
export class BusquedaContainerComponent {
  protected svc = inject(BusquedaContainerService);
  protected dto = this.svc.dto;
}
