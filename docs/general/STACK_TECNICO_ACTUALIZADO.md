---
Documento: STACK_TECNICO_ACTUALIZADO
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# STACK TÉCNICO ACTUALIZADO - SGED
**Fecha de actualización: 25 de enero de 2026**

---

## FRONTEND

| Tecnología | Versión | Propósito |
|---|---|---|
| **Angular** | **21.x LTS** | Framework SPA principal |
| **TypeScript** | **5.7+** | Lenguaje tipado |
| **PrimeNG** | **21.x** | Librería de componentes UI |
| **RxJS** | **7.9+** | Programación reactiva |
| **Node.js** | **22.x LTS** | Runtime para build |
| **npm/yarn** | **10.x/4.x** | Gestor de dependencias |
| **Angular Material** | **21.x** | Componentes adicionales (opcional) |

### Compatibilidad Frontend
- ✅ Chrome 120+
- ✅ Edge 120+
- ✅ Firefox 120+

---

## BACKEND

| Tecnología | Versión | Propósito |
|---|---|---|
| **Java** | **21 LTS** | Lenguaje principal |
| **Spring Boot** | **3.5.x** | Framework web |
| **Spring Security** | **6.5.x** | Autenticación/Autorización **(vigente)** ✅ |
| **Spring Data JPA** | **3.5.x** | Acceso a datos |
| **Spring Web** | **3.5.x** | REST API |
| **Hibernate** | **6.7.x** | ORM/JPA |
| **Lombok** | **1.18.x** | Reducción de boilerplate |
| **MapStruct** | **1.6.x** | Mapping de entidades |
| **Validation API** | **3.1.x** | Validación de datos |
| **JJWT** | **0.12.x** | JSON Web Tokens (JWT 8h) ✅ |

### Build & Dependencias
| Herramienta | Versión | Propósito |
|---|---|---|
| **Maven** | **3.10.x** | Build tool |
| **JUnit 5** | **5.10.x** | Testing unitario |
| **Mockito** | **5.x** | Mocking en tests |
| **Testcontainers** | **1.x** | Contenedores para testing |

---

## BASE DE DATOS

| Tecnología | Versión | Propósito |
|---|---|---|
| **Oracle Database** | **21c** | Base de datos principal SGED (compatible con 19c) ✅ |
| **Oracle JDBC Driver** | **Compatible** | Conector |
| **HikariCP** | **5.1.x** | Pool de conexiones |
| **Flyway** | **10.x** | Migraciones DB |

**Nota:** Stack vigente: **Java 21**, **Oracle 21c**. Oracle 19c compatible si infraestructura lo requiere.

---

## INFRAESTRUCTURA & DEVOPS

| Tecnología | Versión | Propósito |
|---|---|---|
| **Docker** | **27.x** | Containerización |
| **Docker Compose** | **2.x** | Orquestación local |
| **NGINX** | **1.27.x** | Reverse proxy/Web server |
| **Git** | **2.45+** | Control de versiones |
| **GitHub/GitLab** | - | Repositorio |

---

## HERRAMIENTAS DE DESARROLLO

| Herramienta | Versión | Propósito |
|---|---|---|
| **VS Code** | Latest | IDE |
| **Postman** | **11.x** | Testing API |
| **DBeaver** | **24.x** | Cliente SQL |
| **Docker Desktop** | **4.27.x** | Entorno Docker local |

---

## LIBRERÍAS ADICIONALES RECOMENDADAS

### Backend
```xml
<!-- Logging -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-logging</artifactId>
</dependency>

<!-- Utilities -->
<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-lang3</artifactId>
  <version>3.14.x</version>
</dependency>

<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-io</artifactId>
  <version>2.15.x</version>
</dependency>

<!-- PDF Processing (opcional) -->
<dependency>
  <groupId>org.apache.pdfbox</groupId>
  <artifactId>pdfbox</artifactId>
  <version>3.0.x</version>
</dependency>

<!-- Word Processing -->
<dependency>
  <groupId>org.apache.poi</groupId>
  <artifactId>poi</artifactId>
  <version>5.0.x</version>
</dependency>

<dependency>
  <groupId>org.apache.poi</groupId>
  <artifactId>poi-ooxml</artifactId>
  <version>5.0.x</version>
</dependency>

<!-- LibreOffice para conversiones -->
<dependency>
  <groupId>org.jodconverter</groupId>
  <artifactId>jodconverter-spring-boot-starter</artifactId>
  <version>4.4.x</version>
</dependency>
```

### Frontend
```json
{
  "dependencies": {
    "@angular/animations": "^21.0.0",
    "@angular/common": "^21.0.0",
    "@angular/compiler": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@angular/platform-browser": "^21.0.0",
    "@angular/platform-browser-dynamic": "^21.0.0",
    "@angular/router": "^21.0.0",
    "primeng": "^21.0.0",
    "primeicons": "^6.x",
    "rxjs": "^7.9.0",
    "tslib": "^2.x",
    "zone.js": "^0.15.x"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^21.0.0",
    "@angular/cli": "^21.0.0",
    "@angular/compiler-cli": "^21.0.0",
    "@types/jasmine": "~5.1.0",
    "jasmine-core": "~5.1.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.7.0"
  }
}
```

---

## RESUMEN DE CAMBIOS (25 ENE 2026)

| Componente | Versión Anterior | Versión Nueva | Cambio |
|---|---|---|---|
| Angular | 19.x | **21.x LTS** | ⬆️ +2 versiones |
| TypeScript | 5.6+ | **5.7+** | ⬆️ +0.1 |
| PrimeNG | 19.x | **21.x** | ⬆️ +2 versiones |
| RxJS | 7.8+ | **7.9+** | ⬆️ +0.1 |
| Spring Boot | 3.4.x | **3.5.x** | ⬆️ +0.1 |
| Spring Security | 6.4.x | **6.5.x** | ⬆️ +0.1 |
| Spring Data JPA | 3.4.x | **3.5.x** | ⬆️ +0.1 |
| Hibernate | 6.6.x | **6.7.x** | ⬆️ +0.1 |
| Maven | 3.9.x | **3.10.x** | ⬆️ +0.1 |
| Oracle JDBC | 23.x | **TBD** | 🔄 Pendiente definición |

---

## NOTAS IMPORTANTES

### ✅ Ventajas de estas versiones
- **Angular 21 LTS**: 5 años de soporte (2024-2029)
- **Spring Boot 3.5**: Soporte extendido, mejor performance
- **Java 21 LTS**: Soporte hasta septiembre 2031
- Todas las versiones son estables y production-ready

### ⚠️ Consideraciones
- Angular 21 requiere Node 22.x como mínimo
- Spring Boot 3.5 requiere Java 21 como mínimo
- Oracle JDBC: Se seleccionará según versión de BD disponible en OJ
- Verificar compatibilidad de JodConverter con versión de LibreOffice instalada

### 🔄 Migración desde versiones anteriores
Si el proyecto ya existe con versiones antiguas, seguir guía oficial de migración de Angular:
- https://angular.io/guide/upgrade

---

## VALIDACIÓN

✅ Stack actualizado a las versiones más recientes estables disponibles en enero 2026
✅ Todas las versiones son production-ready
✅ Mantienen compatibilidad entre componentes
✅ Oracle pendiente de definición según infraestructura OJ
