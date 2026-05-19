import { UsuarioAdminResponse } from '../models/admin-usuarios.model';

export const MOCK_USUARIOS: UsuarioAdminResponse[] = [
  {
    id: 1,
    username: 'admin.qa',
    nombreCompleto: 'Administrador QA',
    email: 'admin.qa@oj.gob.gt',
    rol: 'ADMINISTRADOR',
    juzgado: 'Juzgado General de Pruebas',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
    debeCambiarPassword: false,
    fechaCreacion: '2026-04-01T00:00:00',
    fechaModificacion: '2026-04-01T00:00:00',
  },
  {
    id: 2,
    username: 'secretario.qa',
    nombreCompleto: 'Secretario QA',
    email: 'secretario.qa@oj.gob.gt',
    rol: 'SECRETARIO',
    juzgado: 'Juzgado General de Pruebas',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
    debeCambiarPassword: false,
    fechaCreacion: '2026-04-01T00:00:00',
    fechaModificacion: '2026-04-01T00:00:00',
  },
  {
    id: 3,
    username: 'juez.qa',
    nombreCompleto: 'Juez QA',
    email: 'juez.qa@oj.gob.gt',
    rol: 'JUEZ',
    juzgado: 'Juzgado General de Pruebas',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
    debeCambiarPassword: false,
    fechaCreacion: '2026-04-01T00:00:00',
    fechaModificacion: '2026-04-01T00:00:00',
  },
];

export const MOCK_USUARIO_DETALLE: UsuarioAdminResponse = MOCK_USUARIOS[0];

export const MOCK_JUZGADO_OPTIONS = [
  { label: 'Juzgado General de Pruebas', value: 1 },
];
