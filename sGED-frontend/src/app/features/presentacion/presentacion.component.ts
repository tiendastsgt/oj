import {
  ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoViewerComponent } from '../expedientes/documento-viewer/documento-viewer.component';
import { PresentacionService } from './presentacion.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-presentacion',
  standalone: true,
  imports: [CommonModule, DocumentoViewerComponent],
  providers: [PresentacionService],
  templateUrl: './presentacion.component.html',
  styleUrls: ['./presentacion.component.scss']
})
export class PresentacionComponent implements OnInit, OnDestroy {
  protected svc = inject(PresentacionService);
  protected dto = this.svc.dto;

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('window:keydown.escape')
  onEscape(): void { this.svc.exit(); }

  @HostListener('window:keydown.arrowRight')
  onRight(): void { this.svc.next(); }

  @HostListener('window:keydown.arrowLeft')
  onLeft(): void { this.svc.prev(); }
}
