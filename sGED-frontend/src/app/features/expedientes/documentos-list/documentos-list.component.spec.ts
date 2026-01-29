import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentosService } from '../../../core/services/documentos.service';
import { Documento } from '../../documentos/models/documento.model';
import { DocumentosListComponent } from './documentos-list.component';

describe('DocumentosListComponent', () => {
  let component: DocumentosListComponent;
  let fixture: ComponentFixture<DocumentosListComponent>;
  let documentosService: jasmine.SpyObj<DocumentosService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockDocs: Documento[] = [
    {
      id: 1,
      expedienteId: 10,
      nombreOriginal: 'archivo.pdf',
      tipoDocumento: 'PDF',
      tamanio: 1234,
      mimeType: 'application/pdf',
      extension: 'pdf',
      categoria: 'PDF',
      usuarioCreacion: 'jperez',
      fechaCreacion: '2026-01-01T10:00:00'
    }
  ];

  beforeEach(async () => {
    documentosService = jasmine.createSpyObj('DocumentosService', ['getDocumentos', 'downloadDocumento', 'streamDocumento', 'registrarImpresion', 'eliminar']);
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    documentosService.getDocumentos.and.returnValue(of({ success: true, data: mockDocs } as ApiResponse<Documento[]>));
    documentosService.downloadDocumento.and.returnValue('http://download');
    documentosService.streamDocumento.and.returnValue('http://inline');
    documentosService.registrarImpresion.and.returnValue(of({ success: true }));
    documentosService.eliminar.and.returnValue(of({ success: true }));
    authService.getCurrentUser.and.returnValue({
      username: 'admin',
      nombreCompleto: 'Admin',
      rol: 'ADMINISTRADOR',
      debeCambiarPassword: false
    } as AuthUser);

    await TestBed.configureTestingModule({
      imports: [DocumentosListComponent],
      providers: [
        { provide: DocumentosService, useValue: documentosService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentosListComponent);
    component = fixture.componentInstance;
    component.expedienteId = 10;
    fixture.detectChanges();
  });

  it('should render list with documents', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(1);
    expect(rows[0].nativeElement.textContent).toContain('archivo.pdf');
  });

  it('should show upload button for admin', () => {
    const uploadButton = fixture.debugElement.query(By.css('.upload-button'));
    expect(uploadButton).toBeTruthy();
  });

  it('should hide upload button for consulta', () => {
    authService.getCurrentUser.and.returnValue({
      username: 'consulta',
      nombreCompleto: 'Consulta',
      rol: 'CONSULTA',
      debeCambiarPassword: false
    } as AuthUser);
    fixture = TestBed.createComponent(DocumentosListComponent);
    component = fixture.componentInstance;
    component.expedienteId = 10;
    fixture.detectChanges();

    const uploadButton = fixture.debugElement.query(By.css('.upload-button'));
    expect(uploadButton).toBeFalsy();
  });

  it('should validate file size and extension', () => {
    const invalidExt = new File(['test'], 'archivo.exe');
    expect(component.validateFile(invalidExt)).toBe('Formato de archivo no permitido.');

    const validFile = new File(['test'], 'archivo.pdf');
    Object.defineProperty(validFile, 'size', { value: 100 * 1024 * 1024 + 1 });
    expect(component.validateFile(validFile)).toBe('El archivo excede el límite de 100 MB.');
  });
});
