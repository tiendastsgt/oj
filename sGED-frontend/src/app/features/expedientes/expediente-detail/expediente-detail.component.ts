import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { EstadoExpediente, Juzgado, TipoProceso } from '../../../core/models/catalogos.model';
import { AuthService } from '../../../core/services/auth.service';
import { AuthUser } from '../../../core/models/auth-user.model';
import { DocumentosListComponent } from '../documentos-list/documentos-list.component';
import { DocumentoViewerComponent } from '../documento-viewer/documento-viewer.component';
import { Documento } from '../../documentos/models/documento.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-expediente-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    MessageModule,
    TabsModule,
    DocumentosListComponent,
    DocumentoViewerComponent,
    StatusBadgeComponent,
    TooltipModule
  ],
  templateUrl: './expediente-detail.component.html',
  styleUrls: ['./expediente-detail.component.scss']
})
export class ExpedienteDetailComponent implements OnInit {
  expediente?: ExpedienteResponse;
  loading = false;
  errorMessage = '';

  tiposProceso: TipoProceso[] = [];
  estados: EstadoExpediente[] = [];
  juzgados: Juzgado[] = [];
  currentUser: AuthUser | null = null;
  selectedDocumento: Documento | null = null;

  constructor(
    private route: ActivatedRoute,
    private expedientesService: ExpedientesService,
    private catalogosService: CatalogosService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Expediente inválido';
      return;
    }
    this.cargarCatalogos();
    this.cargarExpediente(id);
  }

  canEdit(): boolean {
    return ['ADMINISTRADOR', 'SECRETARIO'].includes(this.currentUser?.rol ?? '');
  }

  getTipoProcesoName(id: number): string {
    return this.tiposProceso.find((item) => item.id === id)?.nombre ?? String(id);
  }

  getEstadoName(id: number): string {
    return this.estados.find((item) => item.id === id)?.nombre ?? String(id);
  }

  getJuzgadoName(id: number): string {
    return this.juzgados.find((item) => item.id === id)?.nombre ?? String(id);
  }

  onViewDocumento(documento: Documento): void {
    this.selectedDocumento = documento;
  }

  onCloseViewer(): void {
    this.selectedDocumento = null;
  }

  private cargarExpediente(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.expedientesService.getExpediente(id).subscribe({
      next: (response) => {
        this.expediente = response.data;
        this.loading = false;
        if (!this.expediente) {
          this.errorMessage = 'Expediente no encontrado';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Error al cargar el expediente';
        this.cdr.detectChanges();
      }
    });
  }

  private cargarCatalogos(): void {
    this.catalogosService.getTiposProceso().subscribe({
      next: (response) => (this.tiposProceso = response.data ?? []),
      error: () => (this.tiposProceso = [])
    });
    this.catalogosService.getEstadosExpediente().subscribe({
      next: (response) => (this.estados = response.data ?? []),
      error: () => (this.estados = [])
    });
    this.catalogosService.getJuzgados().subscribe({
      next: (response) => (this.juzgados = response.data ?? []),
      error: () => (this.juzgados = [])
    });
  }
}
