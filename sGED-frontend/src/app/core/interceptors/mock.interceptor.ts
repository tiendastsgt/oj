import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_EXPEDIENTES } from '../mocks/expedientes.mock';
import { MOCK_DOCUMENTOS_EXP1 } from '../mocks/documentos.mock';
import { MOCK_TIPOS_PROCESO, MOCK_ESTADOS, MOCK_JUZGADOS } from '../mocks/catalogos.mock';

@Injectable()
export class MockInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.useMocks) return next.handle(req);
    const url = req.url;

    if (url.endsWith('/auth/login') && req.method === 'POST') {
      const credentials = (req.body as Record<string, string>) ?? {};
      const mockUser = {
        token: 'demo.e30.mock',
        username: credentials['username'] || 'admin.qa',
        nombreCompleto: credentials['username'] === 'secretario.qa'
          ? 'Secretario de Audiencias'
          : 'Administrador QA',
        rol: credentials['username'] === 'secretario.qa' ? 'SECRETARIO' : 'ADMINISTRADOR',
        juzgado: 'Juzgado General de Pruebas',
        debeCambiarPassword: false
      };
      return of(new HttpResponse({ status: 200, body: { success: true, data: mockUser } }));
    }

    if (url.endsWith('/catalogos/tipos-proceso') && req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: { success: true, data: MOCK_TIPOS_PROCESO } }));
    }
    if (url.endsWith('/catalogos/estados-expediente') && req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: { success: true, data: MOCK_ESTADOS } }));
    }
    if (url.endsWith('/catalogos/juzgados') && req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: { success: true, data: MOCK_JUZGADOS } }));
    }

    const docsMatch = url.match(/\/expedientes\/([^/?]+)\/documentos/);
    if (docsMatch && req.method === 'GET') {
      const param = docsMatch[1];
      const numId = Number(param);
      const mockExp = numId
        ? (MOCK_EXPEDIENTES.find(e => e.id === numId) ?? MOCK_EXPEDIENTES[0])
        : (MOCK_EXPEDIENTES.find(e => e.numero === param) ?? MOCK_EXPEDIENTES[0]);
      const mappedDocs = MOCK_DOCUMENTOS_EXP1.map(d => ({
        ...d,
        expedienteId: mockExp.id,
        expedienteNumero: mockExp.numero
      }));
      return of(new HttpResponse({ status: 200, body: { success: true, data: mappedDocs } }));
    }

    const expMatch = url.match(/\/expedientes\/([^/?]+)$/);
    if (expMatch && req.method === 'GET') {
      const param = expMatch[1];
      const numId = Number(param);
      const mockExp = numId
        ? (MOCK_EXPEDIENTES.find(e => e.id === numId) ?? MOCK_EXPEDIENTES[0])
        : (MOCK_EXPEDIENTES.find(e => e.numero === param) ?? MOCK_EXPEDIENTES[0]);
      return of(new HttpResponse({ status: 200, body: { success: true, data: mockExp } }));
    }

    const contentMatch = url.match(/\/documentos\/(\d+)\/contenido/);
    if (contentMatch && req.method === 'GET') {
      const docId = Number(contentMatch[1]);
      const doc = MOCK_DOCUMENTOS_EXP1.find(d => d.id === docId);
      const name = doc?.nombreOriginal ?? 'sample-doc.pdf';
      const validSamples = [
        'Demanda_Inicial.pdf', 'Resolucion_Admision.pdf', 'Contestacion_Demanda.pdf',
        'Auto_Medida_Cautelar.pdf', 'Sentencia_Ordinario.pdf',
        'Acta_Audiencia_Penal.pdf', 'Cedula_Notificacion.pdf'
      ];
      let fileName: string;
      if (validSamples.includes(name)) {
        fileName = name;
      } else if (doc?.extension === 'jpg' || doc?.extension === 'jpeg') {
        fileName = 'sample.jpg';
      } else if (doc?.extension === 'mp3') {
        fileName = 'sample.mp3';
      } else {
        fileName = 'sample-doc.pdf';
      }
      return from(fetch(`/assets/demo/${fileName}`).then(r => r.blob())).pipe(
        map(blob => new HttpResponse({
          status: 200,
          body: blob,
          headers: new HttpHeaders({
            'Content-Type': blob.type,
            'X-SGED-Conversion-Failed': 'false'
          })
        }))
      );
    }

    return next.handle(req);
  }
}
