import { AncladoDoc } from '../../core/models/anclado.model';
import { Documento } from '../documentos/models/documento.model';

export interface PresentacionDoc {
  id: string;
  name: string;
  type: AncladoDoc['type'];
  size: string;
  category: string;
}

export function extOf(type: AncladoDoc['type']): string {
  if (type === 'pdf')   return 'pdf';
  if (type === 'doc')   return 'docx';
  if (type === 'img')   return 'jpg';
  if (type === 'video') return 'mp4';
  if (type === 'audio') return 'mp3';
  return 'pdf';
}

export function mimeOf(type: AncladoDoc['type']): string {
  if (type === 'pdf')   return 'application/pdf';
  if (type === 'doc')   return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (type === 'img')   return 'image/jpeg';
  if (type === 'video') return 'video/mp4';
  if (type === 'audio') return 'audio/mpeg';
  return 'application/pdf';
}

export function toDocumento(d: PresentacionDoc): Documento {
  return {
    id: Number(d.id),
    expedienteId: 0,
    nombreOriginal: d.name,
    extension: extOf(d.type),
    mimeType: mimeOf(d.type),
    tamanio: Number(d.size) || 0,
    categoria: d.category,
    usuarioCreacion: '',
    fechaCreacion: ''
  };
}
