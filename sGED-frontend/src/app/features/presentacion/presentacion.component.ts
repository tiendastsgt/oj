import {
  ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentacionService } from './presentacion.service';
import { environment } from '../../../environments/environment';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-presentacion',
  standalone: true,
  imports: [CommonModule],
  providers: [PresentacionService],
  templateUrl: './presentacion.component.html',
  styleUrls: ['./presentacion.component.scss']
})
export class PresentacionComponent implements OnInit, OnDestroy {
  protected svc = inject(PresentacionService);
  protected dto = this.svc.dto;
  protected readonly useMocks = environment.useMocks;

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  scrollToDoc(idx: number): void {
    document.getElementById(`pres-doc-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.dto.activeDocIdx.set(idx);
  }

  print(): void {
    window.print();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void { this.svc.exit(); }
}
