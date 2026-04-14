---
Documento: STACK_TECNICO_ACTUALIZADO
Proyecto: SGED
Versión del sistema: v1.3.0
Versión del documento: 1.3
Última actualización: 2026-04-14
Vigente para: v1.3.0 y superiores
Estado: ✅ Vigente
---

# STACK TÉCNICO ACTUALIZADO - SGED
**Fecha de actualización: 14 de abril de 2026**

---

## 🏗 ESTRATEGIA DUAL-DB (NUEVO: ABRIL 2026)

Debido a retrasos logísticos en el aprovisionamiento de credenciales de Oracle Database en el entorno corporativo y al imperativo de cumplir con los plazos de entrega, se ha adoptado una **Estrategia de Arquitectura Dual-DB**:

1. **Target Productivo Final:** `Oracle 21c`. 
2. **Entorno Táctico (Desarrollo y VPS Lite):** `MySQL 8`.

> [!WARNING]
> **REGLA DE ORO DE DESARROLLO (ORACLE-READY):**  
> Para asegurar una transición *Zero-Friction* al entorno final:
> - **Prohibido el uso de Native Queries (`@Query(nativeQuery=true)`)** específicos del dialecto de MySQL.
> - **Todo acceso a BD debe realizarse vía JPA/HQL** o EntityGraphs nativos de Spring Data.
> - Flyway debe diseñarse usando ANSI SQL estándar.

---

## FRONTEND

| Tecnología | Versión | Propósito |
|---|---|---|
| **Angular** | **21.x LTS** | Framework SPA principal (Standalone) |
| **TypeScript** | **5.7+** | Lenguaje tipado |
| **PrimeNG** | **21.x** | Librería de componentes UI (Aura Theme) |
| **RxJS** | **7.9+** | Programación reactiva |
| **Node.js** | **22.x LTS** | Runtime para build |

### Compatibilidad Frontend
- ✅ Chrome 120+, Edge 120+, Firefox 120+

---

## BACKEND

| Tecnología | Versión | Propósito |
|---|---|---|
| **Java** | **21 LTS** | Lenguaje principal del sistema |
| **Spring Boot** | **3.5.x** | Framework web RESTful |
| **Spring Security** | **6.5.x** | Autenticación y Autorización estricta |
| **JJWT** | **0.12.x** | JSON Web Tokens (RBAC y caducidad) |
| **Spring Data JPA** | **3.5.x** | ORM universal (permite Dual-DB) |
| **Hibernate** | **6.7.x** | Implementación JPA |
| **Lombok** | **1.18.x** | Reducción de código (Records en DTOs) |

---

## BASE DE DATOS E INFRAESTRUCTURA LITE (ENTORNO ACTUAL)

La infraestructura actual corre sobre un nodo VPS Lite optimizado al extremo.

| Tecnología | Versión | Propósito |
|---|---|---|
| **MySQL Database** | **8.x** | DB táctica actual en VPS Lite (2GB RAM) |
| **Flyway** | **10.x** | Migraciones de base de datos automatizadas |
| **Docker** | **27.x** | Contenedorización de todos los servicios |
| **Nginx** | **1.27.x** | Proxy Inverso (client_max_body_size = 100M) |

---

## HERRAMIENTAS DE DESARROLLO

| Herramienta | Versión | Propósito |
|---|---|---|
| **VS Code / Cursor / Claude Code** | Latest | Entorno de desarrollo impulsado por IA |
| **Postman** | **11.x** | Pruebas de API |
| **DBeaver** | **24.x** | Cliente SQL Multi-Motor |

---

## RESUMEN DE CAMBIOS ARQUITECTÓNICOS (ABRIL 2026)

| Componente | Estado Anterior | Estado Nuevo (v1.3.0) |
|---|---|---|
| **Motor BD** | Teórico (Oracle pendiente) | **Concreto Táctico (MySQL 8 Dockerizado)** |
| **Rendimiento** | Desconocido | **Estabilizado para VPS de 2GB RAM** |
| **Límites Archivos**| Bloqueados a default Nginx | **100MB configurados end-to-end** |
| **Visor Documentos** | Cargas de Angular crudas | **Render nativo inyectado vs ViewChild** |

---

## VALIDACIÓN

✅ Estrategia Táctica de DB Documentada (Dual-DB).  
✅ Stack ajustado a las versiones de Producción v1.3.0.  
✅ Entorno VPS Lite estandarizado en la documentación técnica.
