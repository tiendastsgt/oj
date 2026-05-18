export interface AncladoDoc {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'img' | 'video' | 'audio';
  size: string;
  category: string;
}

export interface AncladoExpediente {
  numeroExpediente: string;
  juzgado: string;
  docs: AncladoDoc[];
  preparedAt: string;
  audienciaAt?: string;
}
