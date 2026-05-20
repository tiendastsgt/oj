import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DTO_EXPEDIENTES } from '../dto/expedientes.dto';
import { DTO_DOCUMENTOS_EXP1 } from '../dto/documentos.dto';
import { DTO_TIPOS_PROCESO, DTO_ESTADOS, DTO_JUZGADOS } from '../dto/catalogos.dto';
import { DTO_RESULTADOS_BUSQUEDA } from '../dto/busqueda.dto';
import { DTO_USUARIOS } from '../dto/usuarios.dto';
import { DTO_AUDITORIA } from '../dto/auditoria.dto';

@Injectable()
export class DtoInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.useDto) return next.handle(req);
    const url = req.url;

    if (url.endsWith('/auth/login') && req.method === 'POST') {
      const credentials = (req.body as Record<string, string>) ?? {};
      const dtoUser = {
        token: 'demo.e30.dto',
        username: credentials['username'] || 'admin.qa',
        nombreCompleto: credentials['username'] === 'secretario.qa'
          ? 'Secretario de Audiencias'
          : credentials['username'] === 'juez.qa'
            ? 'Juez de Primera Instancia'
            : 'Administrador QA',
        rol: credentials['username'] === 'secretario.qa'
          ? 'SECRETARIO'
          : credentials['username'] === 'juez.qa'
            ? 'JUEZ'
            : 'ADMINISTRADOR',
        juzgado: 'Juzgado General de Pruebas',
        debeCambiarPassword: false
      };
      return of(new HttpResponse({ status: 200, body: { success: true, data: dtoUser } }));
    }

    if (url.endsWith('/catalogos/tipos-proceso') && req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: { success: true, data: DTO_TIPOS_PROCESO } }));
    }
    if (url.endsWith('/catalogos/estados-expediente') && req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: { success: true, data: DTO_ESTADOS } }));
    }
    if (url.endsWith('/catalogos/juzgados') && req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: { success: true, data: DTO_JUZGADOS } }));
    }

    if (url.includes('/expedientes/busqueda/rapida') && req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: { success: true, data: DTO_RESULTADOS_BUSQUEDA } }));
    }

    const docsMatch = url.match(/\/expedientes\/([^/?]+)\/documentos/);
    if (docsMatch && req.method === 'GET') {
      const param = docsMatch[1];
      const numId = Number(param);
      const exp = numId
        ? (DTO_EXPEDIENTES.find(e => e.id === numId) ?? DTO_EXPEDIENTES[0])
        : (DTO_EXPEDIENTES.find(e => e.numero === param) ?? DTO_EXPEDIENTES[0]);
      const mappedDocs = DTO_DOCUMENTOS_EXP1.map(d => ({
        ...d,
        expedienteId: exp.id,
        expedienteNumero: exp.numero
      }));
      return of(new HttpResponse({ status: 200, body: { success: true, data: mappedDocs } }));
    }

    const expMatch = url.match(/\/expedientes\/([^/?]+)$/);
    if (expMatch && req.method === 'GET') {
      const param = expMatch[1];
      const numId = Number(param);
      const exp = numId
        ? (DTO_EXPEDIENTES.find(e => e.id === numId) ?? DTO_EXPEDIENTES[0])
        : (DTO_EXPEDIENTES.find(e => e.numero === param) ?? DTO_EXPEDIENTES[0]);
      return of(new HttpResponse({ status: 200, body: { success: true, data: exp } }));
    }

    const contentMatch = url.match(/\/documentos\/(\d+)\/contenido/);
    if (contentMatch && req.method === 'GET') {
      const docId = Number(contentMatch[1]);
      const doc = DTO_DOCUMENTOS_EXP1.find(d => d.id === docId);
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
      } else if (doc?.extension === 'mp4') {
        fileName = 'sample.mp4';
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

    if (url.includes('/admin/usuarios') && req.method === 'GET') {
      return of(new HttpResponse({
        status: 200,
        body: {
          success: true,
          data: {
            content: DTO_USUARIOS,
            pageable: { pageNumber: 0, pageSize: 20, totalPages: 1, totalElements: DTO_USUARIOS.length }
          }
        }
      }));
    }

    if (url.includes('/admin/auditoria') && req.method === 'GET') {
      return of(new HttpResponse({
        status: 200,
        body: {
          success: true,
          data: {
            content: DTO_AUDITORIA,
            pageable: { pageNumber: 0, pageSize: 50, totalPages: 1, totalElements: DTO_AUDITORIA.length }
          }
        }
      }));
    }

    return next.handle(req);
  }
}
