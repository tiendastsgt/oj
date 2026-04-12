---
Documento: ROADMAP_PROYECTO_SGED
Proyecto: SGED
Versión del sistema: v1.1.0
Versión del documento: 1.1
Última actualización: 2026-04-11
Vigente para: v1.0.0 (en desarrollo) y superiores
Estado: ✅ Vigente
---

# Roadmap Proyecto SGED
## Sistema de Gestión de Expedientes Digitales - Visor Documental

**Fecha de última actualización:** 11 de abril de 2026 
**Versión:** 1.1 
**Estado:** Oficial - Nueva Línea Base (10 Sprints)

---

## 1. Supuestos y Alineación

### Stack Técnico Actualizado
| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| **Frontend** | **Angular** | **LTS (estable)** | Interfaz web responsiva |
| **Backend** | **Java / Spring Boot** | **3.x** | API REST / Orquestación |
| **Persistencia** | **Oracle Database** | **19c / XE / Pro** | SGTv1, SGTv1, Docs |
| **Integración** | **Oracle SP (PL/SQL)** | **Nativo** | Lógica de DB Links y obtención de datos |
| **Infraestructura**| **Docker / NGINX** | **Estable** | Despliegue on-premise |

### Restricciones Técnicas 
- **DB Links:** Uso de `db01` (Primario) y `db02` (Respaldo) con failover automático.
- **Seguridad:** Autenticación de usuarios y registro de auditoría institucional.
- **Acceso:** Solo lectura sobre las bases de datos de origen (SGT).
- **Formatos:** Soporte para PDF, Word, RTF, JPG, PNG, MP4, MOV, AVI, WMV.

---

## 2. Plan de Sprints (Horizonte 5 meses)

El proyecto se divide en **10 Sprints** de 2 semanas cada uno.

| Sprint | Hito Principal | Estado |
|---|---|---|
| **Sprint 1** | Levantamiento, análisis y wireframes | ✅ Completado |
| **Sprint 2** | Diseño de BD y Gestión de Usuarios | ✅ En curso |
| **Sprint 3** | Backend: Integración Oracle, SP y DB Links | ⏳ Pendiente |
| **Sprint 4** | Visor de archivos (Docs, Imagen, A/V) | ⏳ Pendiente |
| **Sprint 5** | Búsqueda y Consulta de Expedientes | ⏳ Pendiente |
| **Sprint 6** | Reportes con filtros avanzados | ⏳ Pendiente |
| **Sprint 7** | Módulo de Seguridad y Auditoría detallada | ⏳ Pendiente |
| **Sprint 8** | Pruebas de integración y carga | ⏳ Pendiente |
| **Sprint 9** | Pruebas de Aceptación (UAT) y Ajustes | ⏳ Pendiente |
| **Sprint 10**| Despliegue, Capacitación y Cierre | ⏳ Pendiente |

---

## 3. Cronograma de Ejecución Mensual

| Actividad | Mes 1 | Mes 2 | Mes 3 | Mes 4 | Mes 5 |
|---|---|---|---|---|---|
| Análisis y Requisitos | ✓ | | | | |
| Diseño de Arquitectura y BD | ✓ | ✓ | | | |
| Backend y Conexión Oracle (SP) | | ✓ | | | |
| Visor Multimedia y Documental | | ✓ | ✓ | | |
| Búsqueda de Expedientes | | | ✓ | | |
| Reportes y Exportación | | | ✓ | ✓ | |
| Seguridad y Auditoría | | | | ✓ | |
| QA (Pruebas Unitarias/Integra) | | | | ✓ | |
| UAT y Despliegue Productivo | | | | | ✓ |
| Cierre y Capacitación | | | | | ✓ |

---

## 4. Documentos de Referencia

**REGLA DE VERDAD ÚNICA:**
1. **Plan Trabajo Detallado (v1.2)**: Contiene la especificación técnica y funcional maestra.
2. **Este Roadmap (v1.1)**: Define el cronograma y seguimiento de hitos.
3. **Audit de Seguridad**: Guía de implementación de autenticación integrada.

---

**Última actualización:** 11 abril 2026  
**Responsable:** Agente de Documentación  
**Próxima revisión:** Inicio del Sprint 3
