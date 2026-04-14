import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { DocumentosService } from '../../../core/services/documentos.service';
import { Documento } from '../../documentos/models/documento.model';
import { DocumentoViewerComponent } from './documento-viewer.component';

describe('DocumentoViewerComponent', () => {
  let component: DocumentoViewerComponent;
  let fixture: ComponentFixture<DocumentoViewerComponent>;
  let documentosService: jasmine.SpyObj<DocumentosService>;

  const buildDoc = (extension: string): Documento => ({
    id: 1,
    expedienteId: 10,
    nombreOriginal: `archivo.${extension}`,
    tipoDocumento: 'Tipo',
    tamanio: 1234,
    mimeType: 'application/octet-stream',
    extension,
    categoria: 'DOC',
    usuarioCreacion: 'jperez',
    fechaCreacion: '2026-01-01T10:00:00'
  });

  beforeEach(async () => {
    documentosService = jasmine.createSpyObj('DocumentosService', ['fetchContenidoBlob']);
    documentosService.fetchContenidoBlob.and.returnValue(of('blob:testurl'));

    await TestBed.configureTestingModule({
      imports: [DocumentoViewerComponent],
      providers: [{ provide: DocumentosService, useValue: documentosService }]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentoViewerComponent);
    component = fixture.componentInstance;
  });

  it('should render iframe for pdf', () => {
    const doc = buildDoc('pdf');
    component.documento = doc;
    component.ngOnChanges({ documento: new SimpleChange(null, doc, true) });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('iframe'))).toBeTruthy();
  });

  it('should render image for jpg', () => {
    const doc = buildDoc('jpg');
    component.documento = doc;
    component.ngOnChanges({ documento: new SimpleChange(null, doc, true) });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('img'))).toBeTruthy();
  });

  it('should render audio for mp3', () => {
    const doc = buildDoc('mp3');
    component.documento = doc;
    component.ngOnChanges({ documento: new SimpleChange(null, doc, true) });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('audio'))).toBeTruthy();
  });

  it('should render video for mp4', () => {
    const doc = buildDoc('mp4');
    component.documento = doc;
    component.ngOnChanges({ documento: new SimpleChange(null, doc, true) });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('video'))).toBeTruthy();
  });

  it('should show message for word documents', () => {
    const doc = buildDoc('docx');
    component.documento = doc;
    component.ngOnChanges({ documento: new SimpleChange(null, doc, true) });
    fixture.detectChanges();
    const notice = fixture.debugElement.query(By.css('.viewer-notice p'));
    expect(notice).toBeTruthy();
    expect(notice.nativeElement.textContent).toContain('no se puede previsualizar');
  });
});
