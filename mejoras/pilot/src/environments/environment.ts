// ═══════════════════════════════════════════════════════════════
// environment.ts
// useMocks: true → los Services cortocircuitan los httpResource
//                  y se mantienen los datos mock del DTO.
// ═══════════════════════════════════════════════════════════════

export const environment = {
  production: false,
  useMocks: true,        // ← Cambiar a false cuando el BE esté listo
  apiUrl: '/api',
};
