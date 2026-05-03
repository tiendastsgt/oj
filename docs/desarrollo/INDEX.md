---
Documento: MANUAL_TECNICO_INDEX
Proyecto: SGED
Versión del sistema: v1.3.0
Versión del documento: 1.0
Última actualización: 2026-05-03
Estado: Vigente
---

# Manual Técnico para Desarrolladores — SGED

## Descripción del Sistema

El **SGED (Sistema de Gestión de Expedientes Digitales)** es una aplicación web empresarial diseñada para la administración y gestión de expedientes judiciales digitales. Permite a usuarios con diferentes roles (Administrador, Secretario, Auxiliar, Consulta) gestionar el ciclo de vida completo de expedientes y sus documentos asociados, garantizando trazabilidad, seguridad y auditabilidad en todas las operaciones.

El sistema sigue una arquitectura cliente-servidor desacoplada:
- **Frontend SPA** construido con Angular 21 y PrimeNG 21, que se comunica mediante API REST.
- **Backend RESTful** construido con Spring Boot 3.5 y Java 21, que expone 7 controladores con seguridad JWT.
- **Base de datos relacional** con 13 tablas, cuyo esquema se gestiona automáticamente con Flyway (14 migraciones).

El sistema está optimizado para ejecutarse en un VPS Lite con 2 GB de RAM mediante Docker Compose, sin sacrificar la calidad de la experiencia de usuario.

---

## Tabla de Secciones

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [Arquitectura General](./01-arquitectura-general.md) | Diagramas de capas, flujo request-response y decisiones de diseño |
| 02 | [Backend](./02-backend.md) | Estructura de paquetes, servicios, mappers y convenciones Java |
| 03 | [Frontend](./03-frontend.md) | Módulos Angular, servicios, interceptors, guards y PrimeNG |
| 04 | [Base de Datos](./04-base-de-datos.md) | Diagrama ER, catálogos, estrategia Flyway e índices |
| 05 | [Seguridad](./05-seguridad.md) | JWT, RBAC, lockout, revocación y configuración Spring Security |
| 06 | [Guía de Contribución](./06-guia-de-contribucion.md) | Setup local, build, tests, commits y flujo de trabajo |

---

## Stack Tecnológico con Versiones Exactas

### Backend

| Componente | Versión | Fuente |
|------------|---------|--------|
| Java | 21 LTS | `pom.xml` `<java.version>` |
| Spring Boot | 3.5.0 | `pom.xml` `<parent><version>` |
| Spring Security | 6.5.x (gestionado por Spring Boot) | `spring-boot-starter-security` |
| Spring Data JPA / Hibernate | 6.7.x (gestionado por Spring Boot) | `spring-boot-starter-data-jpa` |
| JJWT (io.jsonwebtoken) | 0.11.5 | `pom.xml` `<jjwt.version>` |
| MapStruct | 1.6.0 | `pom.xml` `<mapstruct.version>` |
| Lombok | 1.18.34 | `pom.xml` `<lombok.version>` |
| Apache PDFBox | 3.0.0 | `pom.xml` `<pdfbox.version>` |
| Apache POI | 5.0.0 | `pom.xml` `<poi.version>` |
| JODConverter | 4.4.6 | `pom.xml` `<jodconverter.version>` |
| Flyway Core | 10.x (gestionado por Spring Boot) | `flyway-core` |
| Oracle JDBC (ojdbc11) | 23.4.0.24.05 | `pom.xml` `<oracle.jdbc.version>` |
| MySQL Connector/J | Gestionado por Spring Boot | `mysql-connector-j` |
| JaCoCo | 0.8.12 | `pom.xml` `<jacoco-maven-plugin.version>` |

### Frontend

| Componente | Versión | Fuente |
|------------|---------|--------|
| Angular (core, router, forms…) | ^21.0.0 | `package.json` |
| TypeScript | ^5.9.2 | `package.json` devDependencies |
| PrimeNG | ^21.0.0 | `package.json` |
| @primeng/themes | ^21.0.4 | `package.json` |
| RxJS | ^7.8.1 | `package.json` |
| primeicons | ^6.0.0 | `package.json` |
| zone.js | ^0.15.0 | `package.json` |
| Node.js (runtime build) | 22.x LTS | Documentación de stack |
| Karma | ~6.4.0 | `package.json` devDependencies |

### Infraestructura

| Componente | Versión | Propósito |
|------------|---------|-----------|
| MySQL | 8.x | Base de datos táctica en VPS Lite |
| Oracle 21c | 21c | Base de datos objetivo en producción corporativa |
| Docker | 27.x | Contenedorización de servicios |
| Nginx | 1.27.x | Proxy inverso (`client_max_body_size 100M`) |

---

## Documentación de API

La referencia de endpoints REST se encuentra en:

- [docs/api/](../api/) — especificaciones OpenAPI y colecciones Postman

---

## Entornos del Sistema

| Entorno | URL Frontend | URL Backend | Base de Datos |
|---------|-------------|-------------|---------------|
| Desarrollo local | http://localhost:4200 | http://localhost:8080 | H2 (en memoria) / Oracle local |
| QA | http://localhost:4201 | http://localhost:8081 | H2 con perfil `qa` |
| Producción (VPS) | http://51.161.32.204:8085 | http://51.161.32.204:8086 | MySQL 8 Dockerizado |

---

## Comandos Rápidos

```bash
# Build frontend para producción
cd sGED-frontend && npx ng build --configuration=production

# Build backend (sin tests)
cd sGED-backend && mvn clean package -DskipTests

# Deploy automático al VPS
python docs/infra/scripts/deploy_vps.py
```

---

*Para contribuir al proyecto, consultar primero [06-guia-de-contribucion.md](./06-guia-de-contribucion.md).*
