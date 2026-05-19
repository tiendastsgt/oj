import { AncladoDoc } from '../../core/models/anclado.model';
import { Documento } from '../documentos/models/documento.model';

export type MergeState = 'idle' | 'loading' | 'ready' | 'error';

export function findDocIdxForPage(pageIdx: number, offsets: number[]): number {
  let lo = 0, hi = offsets.length - 1, ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid] <= pageIdx) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return ans;
}

export const DEMO_SAMPLE_PDFS: string[] = [
  '/assets/demo/Demanda_Inicial.pdf',
  '/assets/demo/Resolucion_Admision.pdf',
  '/assets/demo/Contestacion_Demanda.pdf',
  '/assets/demo/Auto_Medida_Cautelar.pdf',
  '/assets/demo/Sentencia_Ordinario.pdf',
  '/assets/demo/Acta_Audiencia_Penal.pdf',
  '/assets/demo/Cedula_Notificacion.pdf',
];

export const MOCK_PRESENTACION_DOCS: PresentacionDoc[] = [
  { id: '1', name: 'Demanda_Inicial.pdf',     type: 'pdf',   size: '250880', category: 'pdf' },
  { id: '2', name: 'Resolucion_Admision.pdf', type: 'pdf',   size: '193536', category: 'pdf' },
  { id: '3', name: 'Sentencia_Ordinario.pdf', type: 'pdf',   size: '430080', category: 'pdf' },
];

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
