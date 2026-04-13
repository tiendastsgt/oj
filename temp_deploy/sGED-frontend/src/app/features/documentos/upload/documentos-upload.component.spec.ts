import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentosUploadComponent } from './documentos-upload.component';
import { DocumentosService } from '../../../core/services/documentos.service';

describe('DocumentosUploadComponent', () => {
  let component: DocumentosUploadComponent;
  let fixture: ComponentFixture<DocumentosUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentosUploadComponent],
      providers: [
        { provide: DocumentosService, useValue: { cargar: () => ({ subscribe: () => null }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentosUploadComponent);
    component = fixture.componentInstance;
    component.expedienteId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reject invalid extension', () => {
    const file = new File(['test'], 'archivo.exe', { type: 'application/octet-stream' });
    (component as any).upload(file);
    expect(component.errorMessage).toContain('Formato no permitido');
  });
});
