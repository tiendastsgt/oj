/**
 * Test data: Usuarios y credenciales para E2E
 */

export const TEST_USERS = {
  admin: {
    username: 'admin.qa',
    password: 'QAPassword123!',
    email: 'admin.qa@oj.local',
    role: 'ADMINISTRADOR',
    juzgado: 'Juzgado Central',
  },
  juez: {
    username: 'juez.qa',
    password: 'QAPassword123!',
    email: 'juez.qa@oj.local',
    role: 'JUEZ',
    juzgado: 'Juzgado Central',
  },
  secretario: {
    username: 'secretario.qa',
    password: 'QAPassword123!',
    email: 'secretario.qa@oj.local',
    role: 'SECRETARIO',
    juzgado: 'Juzgado Central',
  },
  consulta: {
    username: 'consulta.qa',
    password: 'QAPassword123!',
    email: 'consulta.qa@oj.local',
    role: 'CONSULTA',
    juzgado: 'Juzgado Central',
  },
};

export const TEST_DATA = {
  expedientes: [
    {
      numero: '2024-001',
      estado: 'En Trámite',
      juzgado: 'Juzgado Central',
    },
    {
      numero: '2024-002',
      estado: 'En Trámite',
      juzgado: 'Juzgado Central',
    },
  ],
  documento: {
    nombre: 'test-document.pdf',
    tipo: 'Demanda',
    fecha: new Date().toISOString().split('T')[0],
  },
  nuevoUsuario: {
    username: 'nuevo.usuario.qa',
    nombreCompleto: 'Nuevo Usuario QA',
    email: 'nuevo.qa@oj.local',
    rol: 'JUEZ',
    juzgado: 'Juzgado Central',
  },
};
