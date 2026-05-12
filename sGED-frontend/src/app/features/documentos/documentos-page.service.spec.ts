import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DocumentosPageService } from './documentos-page.service';
import { DocumentosService } from '../../core/services/documentos.service';
import { LoadState } from './documentos-page.types';
import { Documento } from './models/documento.model';
import { ApiResponse } from '../../core/models/api-response.model';

const mockDoc: Documento = {
  id: 1,
  expedienteId: 5,
  nombreOriginal: 'acta.pdf',
  tamanio: 512,
  mimeType: 'application/pdf',
  extension: 'pdf',
  categoria: 'PDF',
  usuarioCreacion: 'admin',
  fechaCreacion: '2025-01-01',
};

const buildResponse = (items: Documento[] = []): ApiResponse<Documento[]> => ({
  success: true,
  data: items,
});

describe('DocumentosPageService', () => {
  let service: DocumentosPageService;
  let docsSpy: jasmine.SpyObj<DocumentosService>;

  function setup(routeId: string | null = '5') {
    docsSpy = jasmine.createSpyObj('DocumentosService', [
      'listar', 'getContenidoUrl', 'registrarImpresion', 'eliminar',
    ]);
    docsSpy.listar.and.returnValue(of(buildResponse([mockDoc])));
    docsSpy.getContenidoUrl.and.callFake((id: number, modo?: 'inline' | 'attachment') => `/api/doc/${id}?modo=${modo ?? 'inline'}`);
    docsSpy.registrarImpresion.and.returnValue(of({ success: true, data: undefined }));
    docsSpy.eliminar.and.returnValue(of({ success: true, data: undefined }));

    TestBed.configureTestingModule({
      providers: [
        DocumentosPageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DocumentosService, useValue: docsSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => routeId }) },
        },
      ],
    });

    service = TestBed.inject(DocumentosPageService);
  }

  // ─── Constructor ───

  it('carga documentos al iniciar con id válido', () => {
    setup('5');
    expect(docsSpy.listar).toHaveBeenCalledWith(5);
    expect(service.dto.expedienteId()).toBe(5);
    expect(service.dto.documentos().length).toBe(1);
    expect(service.dto.state()).toBe(LoadState.Success);
  });

  it('no llama a listar si el id del route es inválido', () => {
    setup(null);
    expect(docsSpy.listar).not.toHaveBeenCalled();
  });

  it('pone state en Error si listar falla', () => {
    docsSpy = jasmine.createSpyObj('DocumentosService', [
      'listar', 'getContenidoUrl', 'registrarImpresion', 'eliminar',
    ]);
    docsSpy.listar.and.returnValue(throwError(() => ({ error: { message: 'Sin conexión' } })));
    docsSpy.getContenidoUrl.and.returnValue('');
    docsSpy.registrarImpresion.and.returnValue(of({ success: true, data: undefined }));
    docsSpy.eliminar.and.returnValue(of({ success: true, data: undefined }));

    TestBed.configureTestingModule({
      providers: [
        DocumentosPageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DocumentosService, useValue: docsSpy },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => '5' }) } },
      ],
    });
    service = TestBed.inject(DocumentosPageService);

    expect(service.dto.state()).toBe(LoadState.Error);
    expect(service.dto.errorMessage()).toBe('Sin conexión');
  });

  // ─── onVer ───

  it('onVer abre el visor para PDF', () => {
    setup('5');
    service.onVer(mockDoc);
    expect(service.dto.viewerType()).toBe('PDF');
    expect(service.dto.selectedDocumento()).toEqual(mockDoc);
    expect(service.dto.viewerVisible()).toBe(true);
  });

  it('onVer llama a getContenidoUrl con modo inline para PDF', () => {
    setup('5');
    service.onVer(mockDoc);
    expect(docsSpy.getContenidoUrl).toHaveBeenCalledWith(mockDoc.id, 'inline');
  });

  it('onVer descarga directamente para extensión avi', () => {
    setup('5');
    const docAvi: Documento = { ...mockDoc, extension: 'avi' };
    spyOn(window, 'open');
    service.onVer(docAvi);
    expect(window.open).toHaveBeenCalled();
    expect(service.dto.viewerType()).toBeNull();
  });

  // ─── cerrarVisor ───

  it('cerrarVisor resetea el estado del visor', () => {
    setup('5');
    service.onVer(mockDoc);
    service.cerrarVisor();
    expect(service.dto.viewerType()).toBeNull();
    expect(service.dto.viewerUrl()).toBe('');
    expect(service.dto.selectedDocumento()).toBeNull();
  });

  // ─── onEliminar ───

  it('onEliminar llama a eliminar y recarga la lista', () => {
    setup('5');
    service.onEliminar(mockDoc);
    expect(docsSpy.eliminar).toHaveBeenCalledWith(mockDoc.id);
    expect(docsSpy.listar).toHaveBeenCalledTimes(2);
  });
});
