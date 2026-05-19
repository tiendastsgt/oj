import { TipoProceso, EstadoExpediente, Juzgado } from '../models/catalogos.model';

export const DTO_TIPOS_PROCESO: TipoProceso[] = [
  { id: 1, nombre: 'Civil' },
  { id: 2, nombre: 'Penal' },
  { id: 3, nombre: 'Laboral' },
  { id: 4, nombre: 'Familia' },
  { id: 5, nombre: 'Mercantil' },
  { id: 6, nombre: 'Niñez y Adolescencia' },
  { id: 7, nombre: 'Femicidio y VCM' },
  { id: 8, nombre: 'Contencioso Administrativo' },
  { id: 9, nombre: 'Económico Coactivo' },
];

export const DTO_ESTADOS: EstadoExpediente[] = [
  { id: 1, nombre: 'ACTIVO' },
  { id: 2, nombre: 'CERRADO' },
  { id: 3, nombre: 'PENDIENTE' },
];

export const DTO_JUZGADOS: Juzgado[] = [
  { id: 1, nombre: 'Juzgado General de Pruebas' },
];
