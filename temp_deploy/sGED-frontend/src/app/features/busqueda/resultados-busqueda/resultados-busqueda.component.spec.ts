import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { ResultadosBusquedaComponent } from './resultados-busqueda.component';
import { Page } from '../../../core/models/page.model';
import { ExpedienteBusquedaResponse } from '../../../core/models/busqueda.model';

describe('ResultadosBusquedaComponent', () => {
  let component: ResultadosBusquedaComponent;
  let fixture: ComponentFixture<ResultadosBusquedaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosBusquedaComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultadosBusquedaComponent);
    component = fixture.componentInstance;
  });

  it('should render rows and show navigation for SGED', () => {
    const data: Page<ExpedienteBusquedaResponse> = {
      content: [
        {
          id: 1,
          numero: 'EXP-1',
          juzgado: 'Juzgado Primero',
          estado: 'Activo',
          tipoProceso: 'Civil',
          fechaInicio: '2026-01-01',
          fuente: 'SGED'
        },
        {
          id: null,
          numero: 'EXP-2',
          juzgado: 'SGT',
          estado: 'Activo',
          tipoProceso: 'Civil',
          fechaInicio: '2026-01-02',
          fuente: 'SGTV2'
        }
      ],
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1
    };
    component.resultados = data;
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const verButtons = buttons.filter((btn) => btn.nativeElement.textContent.includes('Ver'));
    expect(verButtons.length).toBe(1);
  });
});
