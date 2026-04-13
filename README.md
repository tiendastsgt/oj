# SGED - Sistema de Gestión de Expedientes Digitales

**Versión:** v1.2.1  
**Estado:** 🛠️ En Desarrollo (Sprint 2 - Elite UX)  
**Fecha:** 12 abril 2026

---

## 📋 Documentación Centralizada

**⚠️ IMPORTANTE:** La documentación del proyecto se encuentra en la carpeta **`/docs`** con estructura clara por temas.

### 🔗 Punto de Entrada: [INDICE_MAESTRO_DOCUMENTACION.md](./docs/INDICE_MAESTRO_DOCUMENTACION.md)

Desde allí encontrarás:
- Documentación general (plan, roadmap, stack)
- Guías de infraestructura y deployment
- Reportes de QA
- Planes de smoke testing
- Documentación por fases
- Diagramas de arquitectura
- Documentos archivados (legacy)

---

## 🚀 Inicio Rápido

### Si necesitas...

**Entender el proyecto:**
→ Leer [plan_detallado.md](./docs/general/plan_detallado.md)

**Ver el roadmap de fases:**
→ Leer [ROADMAP_PROYECTO_SGED.md](./docs/general/ROADMAP_PROYECTO_SGED.md)

**Desplegar a producción:**
→ Leer [PLAN_DESPLIEGUE_PRODUCCION.md](./docs/infra/PLAN_DESPLIEGUE_PRODUCCION.md)

**Confirmar que es apto producción:**
→ Leer [QA_ACCEPTANCE_REPORT.md](./docs/qa/QA_ACCEPTANCE_REPORT.md)

**Ejecutar smoke tests:**
→ Leer [QUICK_START_SMOKE_TESTS.md](./docs/smoke-tests/QUICK_START_SMOKE_TESTS.md)

**Troubleshooting en producción:**
→ Leer [RUNBOOK_OPERACIONES_PRODUCCION.md](./docs/infra/RUNBOOK_OPERACIONES_PRODUCCION.md)

---

## 📁 Estructura de Carpetas

```
SGED/
├── docs/                          ← ⭐ TODO AQUÍ
│   ├── general/                   Documentación central
│   ├── infra/                     Guías de infraestructura y deploy
│   ├── qa/                        Reportes de QA
│   ├── smoke-tests/               Planes de smoke testing
│   ├── fases/                     Documentación por fase
│   ├── diagramas/                 Diagramas arquitectónicos
│   ├── legacy/                    Documentos archivados (NO USAR)
│   ├── INDICE_MAESTRO_DOCUMENTACION.md    ← Empieza aquí
│   └── PROTOCOLO_DOCUMENTACION.md         Protocolo de nombres/vigencia
│
├── sGED-backend/                  Backend Spring Boot (Java 21 + Spring Security)
├── sGED-frontend/                 Frontend Angular (Angular 21 + PrimeNG)
├── nginx/                         Configuración Nginx (Reverse Proxy)
├── .github/                       Workflows CI/CD
│
├── docker-compose-qa.yml
├── docker-compose-prod.yml
├── oj.code-workspace              VS Code workspace
└── README.md                       (este archivo)
```

---

## 📦 Proyectos Principales

### Backend: `sGED-backend/`

- **Framework:** Spring Boot 3.5
- **Lenguaje:** Java 21 LTS
- **Database:** Oracle 21c (compatible 19c)
- **Puertos:** 8080 (local), 8443 (HTTPS prod)

```bash
cd sGED-backend
mvn clean compile
mvn test
mvn verify -Ptest-coverage
```

### Frontend: `sGED-frontend/`

- **Framework:** Angular 21 LTS
- **UI Library:** PrimeNG 21
- **Lenguaje:** TypeScript 5.7
- **Port:** 4200 (dev), 443 (HTTPS prod)

```bash
cd sGED-frontend
npm install
npm start
npm test
```

### Autenticación: Integrada en sGED-Backend (Java/Spring Security)

> [!IMPORTANT]
> Toda la lógica de seguridad reside en el backend de Java. Se ha **descartado y eliminado** por completo el antiguo servicio `auth-service` en Python/FastAPI para simplificar la arquitectura y mejorar la mantenibilidad.

- **Framework:** Spring Boot 3.5 + Spring Security 6.5
- **Token:** JWT con expiración de 8 horas (configurable vía variables de entorno)
- **Algoritmo:** JJWT (JSON Web Token con firma HMAC-SHA256)
- **Revocación:** Gestionada mediante tabla `revoked_token` (Blacklist de JTI) en Oracle.

**Endpoints auditados y vigentes:**

```bash
POST /api/v1/auth/login        # Autenticar usuario
POST /api/v1/auth/logout       # Revocar token
POST /api/v1/auth/cambiar-password  # Cambiar contraseña del usuario
```

**Más info:** Ver [plan_detallado.md](./docs/general/plan_detallado.md#44-seguridad-y-autenticacion)


---

## 🔒 Secrets y Configuración

**NUNCA commitear secretos al repositorio.**

Ver: [Índice maestro → Infraestructura](./docs/INDICE_MAESTRO_DOCUMENTACION.md#infraestructura)

---

## 🚢 Deployment

### Ambiente QA

```bash
docker-compose -f docker-compose-qa.yml up -d
```

Ver: [Índice maestro → Infraestructura](./docs/INDICE_MAESTRO_DOCUMENTACION.md#infraestructura)

### Ambiente Producción

Leer primero: [Índice maestro → Infraestructura](./docs/INDICE_MAESTRO_DOCUMENTACION.md#infraestructura)

Rollout gradual (10% → 50% → 100%)

---

## 📊 Monitoreo

Sistema en **producción requiere monitoreo 24/7**:

- Primeras 72h: Monitoreo intenso (cada 5-30 min)
- Después: Alertas automáticas en PagerDuty

Ver: [Índice maestro → Infraestructura](./docs/INDICE_MAESTRO_DOCUMENTACION.md#infraestructura)

---

## ✅ QA y Testing

**Estado QA:** ✅ COMPLETADO (28 enero 2026)

- E2E: F1-F6 validados ✅
- Carga: P95=1.7s (RNF cumplido) ✅
- Seguridad: 0 vulnerabilidades críticas ✅

Resultado: **APTO PARA PRODUCCIÓN**

Ver: [QA_ACCEPTANCE_REPORT.md](./docs/qa/QA_ACCEPTANCE_REPORT.md)

---

## 🔄 Versionado

Usar **Semantic Versioning** (MAJOR.MINOR.PATCH):

- v1.0.0 → Inicial (28 enero 2026)
- v1.1.0 → Parches y mejoras menores
- v2.0.0 → Cambios mayores (futuro)

---

## 📞 Contacto y Soporte

| Rol | Contacto |
|-----|----------|
| Agente de Documentación | [Equipo de Proyectos] |
| DevOps Team | [TBD] |
| QA Team | [TBD] |
| Backend | [TBD] |
| Frontend | [TBD] |

---

## 📋 Documentación Rápida

### Normativa de Documentación

La documentación sigue un protocolo uniforme:

- ✅ Versionada (Semver)
- ✅ Fechada
- ✅ Cabecera estandarizada
- ✅ Clasificada (vigente/obsoleto)

Ver: [PROTOCOLO_DOCUMENTACION.md](./docs/PROTOCOLO_DOCUMENTACION.md)

### Documentos Obsoletos

Documentos antiguos (.docx, scripts viejos) están en:

**→ [/docs/legacy/](./docs/legacy/README_LEGACY.md)** ← NO USAR

---

## 🎯 Estados Principales

| Componente | Estado | Notas |
|-----------|--------|-------|
| Backend (Fases 1-5) | ✅ Completo | Implementado y testeado |
| Frontend (Fases 1-5) | ✅ Completo | Implementado y testeado |
| Infraestructura (Fase 6) | ✅ Completo | Hardening, ZAP, CodeQL aplicado |
| QA (Fase 7) | ✅ Completo | E2E validado, apto producción |
| Producción | 🚀 Activo | Desde 28-ene-2026 |

---

## 🔗 Enlaces Útiles

- **Documentación General:** [docs/general/](./docs/general/)
- **Guías Operativas:** [Índice → Infraestructura](./docs/INDICE_MAESTRO_DOCUMENTACION.md#infraestructura)
- **Reportes QA:** [docs/qa/](./docs/qa/)
- **Diagramas:** [Índice → Diagramas](./docs/INDICE_MAESTRO_DOCUMENTACION.md#diagramas)
- **Índice Maestro:** [docs/INDICE_MAESTRO_DOCUMENTACION.md](./docs/INDICE_MAESTRO_DOCUMENTACION.md)

---

## 🚀 Próximos Pasos

1. Leer [INDICE_MAESTRO_DOCUMENTACION.md](./docs/INDICE_MAESTRO_DOCUMENTACION.md) para familiarizarse con estructura
2. Consultar documentación relevante según tu rol/tarea
3. Seguir protocolo de nombres al crear nuevos documentos
4. Reportar inconsistencias al **Agente de Documentación**

---

**Última actualización:** 30 enero 2026  
**Responsable:** Agente de Documentación  
**Estado:** ✅ Vigente para v1.0.0+
