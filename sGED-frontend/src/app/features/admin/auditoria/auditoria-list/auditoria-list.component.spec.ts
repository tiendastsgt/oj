import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuditoriaListComponent } from './auditoria-list.component';
import { AuditoriaService } from '../../../../core/services/auditoria.service';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuditoriaResponse } from '../../../../core/models/auditoria.model';
import { of } from 'rxjs';

describe('AuditoriaListComponent', () => {
  let component: AuditoriaListComponent;
  let fixture: ComponentFixture<AuditoriaListComponent>;
  let auditoriaService: AuditoriaService;

  const mockAuditoria: AuditoriaResponse[] = [
    {
      id: 1,
      fecha: '2026-01-20T10:00:00',
      usuario: 'admin1',
      ip: '192.168.1.1',
      accion: 'USUARIO_CREADO',
      modulo: 'ADMIN',
      recursoId: 1,
      detalle: 'Usuario creado'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditoriaListComponent, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [AuditoriaService, MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditoriaListComponent);
    component = fixture.componentInstance;
    auditoriaService = TestBed.inject(AuditoriaService);
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar con formulario de filtros vacío', () => {
    expect(component.filterForm.get('usuario')?.value).toBe('');
    expect(component.filterForm.get('modulo')?.value).toBe('');
    expect(component.filterForm.get('accion')?.value).toBe('');
  });

  it('debe cargar auditoría al inicializar', () => {
    const mockResponse = {
      data: {
        content: mockAuditoria,
        pageable: { totalElements: 1, pageNumber: 0, pageSize: 50, totalPages: 1 }
      }
    };
    spyOn(auditoriaService, 'getAuditoria').and.returnValue(of(mockResponse as any));

    component.ngOnInit();

    expect(component.auditoria.length).toBe(1);
    expect(component.totalRecords).toBe(1);
  });

  it('debe aplicar filtros y recargar auditoría', () => {
    spyOn(component, 'cargarAuditoria');
    component.filterForm.patchValue({ usuario: 'admin' });
    component.aplicarFiltros();
    expect(component.cargarAuditoria).toHaveBeenCalledWith(0);
  });

  it('debe establecer el tamaño de página correcto', () => {
    expect(component.pageSize).toBe(50);
  });

  it('debe manejar lazy loading correctamente', () => {
    spyOn(component, 'cargarAuditoria');
    const event = { first: 0, rows: 50 };
    component.onLazyLoad(event);
    expect(component.cargarAuditoria).toHaveBeenCalledWith(0);
  });

  it('debe calcular página correctamente en lazy loading', () => {
    spyOn(component, 'cargarAuditoria');
    const event = { first: 50, rows: 50 };
    component.onLazyLoad(event);
    expect(component.cargarAuditoria).toHaveBeenCalledWith(1);
  });
});
