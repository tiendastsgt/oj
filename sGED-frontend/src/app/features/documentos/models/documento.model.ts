export interface Documento {
  id: number;
  expedienteId: number;
  expedienteNumero?: string;
  nombreOriginal: string;
  tipoDocumento?: string;
  tipoDocumentoId?: number;
  tamanio: number;
  mimeType: string;
  extension: string;
  categoria: string;
  usuarioCreacion: string;
  fechaCreacion: string;
}
