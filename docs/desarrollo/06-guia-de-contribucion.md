---
Documento: GUIA_DE_CONTRIBUCION
Proyecto: SGED
Versión del sistema: v1.3.0
Versión del documento: 1.0
Última actualización: 2026-05-03
Estado: Vigente
---

# 06 — Guía de Contribución

## 1. Prerequisitos

Antes de clonar el repositorio, verificar que el entorno de desarrollo tiene instaladas las siguientes herramientas en las versiones correctas.

| Herramienta | Versión Mínima | Comando de Verificación |
|-------------|---------------|------------------------|
| **Java JDK** | 21 LTS | `java -version` → debe mostrar `21.x.x` |
| **Maven** | 3.9.x | `mvn -version` → debe mostrar `3.9.x` |
| **Node.js** | 22.x LTS | `node -v` → debe mostrar `v22.x.x` |
| **npm** | 10.x | `npm -v` → debe mostrar `10.x.x` |
| **Angular CLI** | 21.x | `npx ng version` → debe mostrar `21.x.x` |
| **Docker** | 27.x | `docker -v` → debe mostrar `27.x.x` |
| **Docker Compose** | 2.x | `docker compose version` → debe mostrar `2.x.x` |
| **Git** | 2.40+ | `git --version` |

**Herramientas opcionales pero recomendadas:**

| Herramienta | Propósito |
|-------------|-----------|
| DBeaver 24.x | Cliente SQL para inspeccionar MySQL/Oracle |
| Postman 11.x | Pruebas manuales de la API REST |
| VS Code / Cursor | Editor recomendado con plugins Java y Angular |

---

## 2. Setup Local Completo en 5 Pasos

### Paso 1 — Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd sged
```

Verificar que estás en la rama correcta:
```bash
git status
git branch
```

### Paso 2 — Levantar la base de datos con Docker Compose

El entorno de desarrollo puede usar MySQL 8 con Docker Compose. El perfil `qa` usa H2 en memoria (más simple para empezar).

**Opción A — MySQL con Docker (recomendado para fidelidad con producción):**
```bash
docker compose -f docker-compose.yml up db -d
```

Verificar que el contenedor está corriendo:
```bash
docker compose ps
# El servicio 'db' debe estar en estado 'Up'
```

**Opción B — H2 en memoria (más rápido para empezar):**
```bash
export SPRING_PROFILES_ACTIVE=qa
# En Windows PowerShell:
# $env:SPRING_PROFILES_ACTIVE = "qa"
```
Con el perfil `qa`, el backend arranca con H2 sin necesidad de Docker.

### Paso 3 — Arrancar el backend

```bash
cd sGED-backend

# Con perfil qa (H2 en memoria, sin Docker):
export SPRING_PROFILES_ACTIVE=qa
mvn spring-boot:run

# Con MySQL local (necesita Docker del paso anterior):
export DB_URL=jdbc:mysql://localhost:3306/sged
export DB_USER=sged
export DB_PASSWORD=sged
export JWT_SECRET=mi-secreto-de-desarrollo-32chars!
mvn spring-boot:run
```

Verificar que el backend arrancó correctamente:
```bash
curl http://localhost:8080/actuator/health
# Debe retornar: {"status":"UP"}
```

Flyway ejecutará automáticamente todas las migraciones en el primer arranque.

### Paso 4 — Instalar dependencias e iniciar el frontend

```bash
cd sGED-frontend
npm install
npm start
# Equivalente a: ng serve
```

El frontend arranca en `http://localhost:4200` con hot-reload activado.

**Verificar que el frontend apunta al backend local:**

En `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

### Paso 5 — Verificar el entorno completo

1. Abrir `http://localhost:4200` en el navegador.
2. Debe mostrar la pantalla de login de SGED.
3. Usar las credenciales de desarrollo (creadas por `DbDataInitializer` en el primer arranque).
4. Verificar que el dashboard carga sin errores en la consola del navegador.
5. Verificar que no hay errores CORS en las DevTools del navegador.

**Verificación rápida de la API:**
```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin1234"}'
# Debe retornar {"success":true,"data":{"token":"eyJ..."}}
```

---

## 3. Comandos Build Producción

Los comandos exactos definidos en `CLAUDE.md`:

```bash
# Build del frontend para producción
cd sGED-frontend && npx ng build --configuration=production

# El artefacto se genera en: sGED-frontend/dist/sged-frontend/browser/

# Build del backend (jar ejecutable, sin tests)
cd sGED-backend && mvn clean package -DskipTests

# El artefacto se genera en: sGED-backend/target/sged-backend-0.0.1-SNAPSHOT.jar

# Deploy automático al VPS (incluye build + transferencia + restart de Docker)
python docs/infra/scripts/deploy_vps.py
```

**Build del backend incluyendo tests:**
```bash
cd sGED-backend && mvn clean package
```

**Build con reporte de cobertura JaCoCo:**
```bash
cd sGED-backend && mvn clean verify -P test-coverage
# El reporte HTML se genera en: target/site/jacoco/index.html
```

---

## 4. Ejecutar Tests

### Backend — Tests unitarios y de integración (JUnit 5 + Spring Boot Test)

```bash
cd sGED-backend

# Ejecutar todos los tests
mvn test

# Ejecutar tests con cobertura JaCoCo
mvn verify -P test-coverage

# Ejecutar un test específico
mvn test -Dtest=ExpedienteServiceTest

# Ejecutar tests de un paquete específico
mvn test -Dtest="com.oj.sged.application.service.*"
```

Los tests de integración que requieren DB usan **H2 en memoria** automáticamente (configurado en `application-test.yml`).

### Frontend — Tests unitarios (Karma + Jasmine)

```bash
cd sGED-frontend

# Ejecutar todos los tests (abre navegador Chrome)
npm test

# Ejecutar tests en modo headless (para CI)
npx ng test --watch=false --browsers=ChromeHeadless

# Ejecutar tests con cobertura
npx ng test --code-coverage --watch=false --browsers=ChromeHeadless
# El reporte se genera en: coverage/sged-frontend/index.html
```

### Convenciones para escribir tests

**Backend:**
- Un archivo `*Test.java` por cada clase de servicio o controlador.
- Usar `@ExtendWith(MockitoExtension.class)` para tests unitarios.
- Usar `@SpringBootTest` solo para tests de integración que necesiten contexto Spring completo.
- Los mocks de repositorios con `@MockBean` o `Mockito.mock()`.

**Frontend:**
- Un archivo `*.spec.ts` por cada servicio o componente (Angular genera uno automáticamente).
- Usar `TestBed` para configurar el módulo de test.
- Mockear los servicios HTTP con `HttpClientTestingModule` y `HttpTestingController`.

---

## 5. Convenciones de Commits (Conventional Commits)

El proyecto usa el estándar **Conventional Commits 1.0.0** para el historial de cambios.

### Formato

```
<tipo>(<alcance>): <descripción corta en imperativo>

[cuerpo opcional — explica el QUÉ y el POR QUÉ, no el CÓMO]

[pie opcional — referencias a issues, breaking changes]
```

### Tipos Válidos

| Tipo | Cuándo usarlo | Ejemplo |
|------|--------------|---------|
| `feat` | Nueva funcionalidad | `feat(expedientes): agregar búsqueda por número de caso` |
| `fix` | Corrección de bug | `fix(auth): resetear intentos_fallidos tras login exitoso` |
| `docs` | Cambios en documentación | `docs(desarrollo): agregar sección de seguridad al manual` |
| `refactor` | Refactorización sin cambio de comportamiento | `refactor(expediente-service): extraer método validateCatalogs` |
| `test` | Agregar o corregir tests | `test(auth-service): cubrir caso de cuenta bloqueada` |
| `perf` | Mejora de rendimiento | `perf(busqueda): añadir índice en expediente.fecha_creacion` |
| `chore` | Tareas de mantenimiento | `chore(deps): actualizar Spring Boot a 3.5.1` |
| `style` | Formateo de código (sin lógica) | `style(expediente-controller): alinear imports` |
| `ci` | Cambios en pipelines CI/CD | `ci(github): agregar job de análisis de cobertura` |
| `build` | Cambios en sistema de build | `build(pom): agregar perfil test-coverage` |

### Alcances Recomendados

| Alcance | Descripción |
|---------|-------------|
| `auth` | Autenticación y seguridad |
| `expedientes` | Módulo de expedientes |
| `documentos` | Módulo de documentos |
| `usuarios` | Administración de usuarios |
| `auditoria` | Módulo de auditoría |
| `busqueda` | Búsqueda avanzada |
| `db` | Cambios en base de datos / migraciones |
| `frontend` | Cambios generales en el frontend |
| `backend` | Cambios generales en el backend |
| `devops` | Docker, Nginx, scripts de deploy |
| `deps` | Actualizaciones de dependencias |

### Ejemplos Completos

```bash
# Feature nueva
git commit -m "feat(expedientes): implementar exportación a PDF del detalle"

# Bug fix con cuerpo explicativo
git commit -m "fix(auth): corregir incremento de intentos_fallidos en usuarios bloqueados

El lockout chequeaba el flag bloqueado después de incrementar el contador,
lo que causaba que la cuenta se 'bloqueara' múltiples veces. Ahora se
verifica primero y se lanza la excepción sin modificar el contador."

# Migración de base de datos
git commit -m "db(migration): V017 — agregar índice en expediente.referencia_sgt"

# Breaking change
git commit -m "feat(api)!: cambiar estructura de respuesta paginada a Page<T>

BREAKING CHANGE: El endpoint GET /api/v1/expedientes ahora retorna
Page<ExpedienteResponse> en lugar de List<ExpedienteResponse>.
Los clientes deben actualizar para leer response.data.content"
```

---

## 6. Flujo de Trabajo Git

El proyecto usa un flujo basado en **Feature Branches**:

```
main (producción estable)
  │
  ├── feature/expedientes-exportar-pdf
  ├── fix/auth-lockout-contador
  ├── docs/manual-tecnico-seguridad
  └── refactor/busqueda-service-optimizar
```

### Pasos para una Contribución

**1. Crear rama desde `main` actualizado:**
```bash
git checkout main
git pull origin main
git checkout -b feature/mi-nueva-funcionalidad
# Convención de nombres: tipo/descripcion-corta-en-kebab-case
```

**2. Desarrollar con commits frecuentes:**
```bash
# Hacer cambios...
git add sGED-backend/src/main/java/com/oj/sged/api/controller/ExpedienteController.java
git commit -m "feat(expedientes): agregar endpoint de exportación a PDF"

# Más cambios...
git add sGED-backend/src/main/java/com/oj/sged/application/service/ExpedienteService.java
git commit -m "feat(expedientes): implementar lógica de generación PDF con PDFBox"
```

**3. Antes de crear el PR — verificar localmente:**
```bash
# Backend: todos los tests deben pasar
cd sGED-backend && mvn test

# Frontend: todos los tests deben pasar
cd sGED-frontend && npx ng test --watch=false --browsers=ChromeHeadless

# Build de producción no debe tener errores
cd sGED-frontend && npx ng build --configuration=production
cd sGED-backend && mvn clean package -DskipTests
```

**4. Crear Pull Request:**
```bash
git push origin feature/mi-nueva-funcionalidad
# Crear PR en la interfaz de GitHub/GitLab apuntando a main
```

**5. El PR debe incluir:**
- Descripción del cambio y su motivación.
- Capturas de pantalla si hay cambios de UI.
- Referencia al issue o tarea correspondiente.
- Checklist de validación completado.

---

## 7. Reglas de Código

### Reglas Absolutas (No Negociables)

**Prohibido en cualquier archivo TypeScript o Java en producción:**

```typescript
// PROHIBIDO
console.log("Debug temporal");
console.error("Error:", error);

// CORRECTO en Angular (usar inyección de servicio de logging si es necesario)
// En la mayoría de casos, los errores se manejan en el ErrorInterceptor
```

```java
// PROHIBIDO
System.out.println("Debug: " + expediente.getId());
System.err.println("Error: " + e.getMessage());

// CORRECTO
private static final Logger log = LoggerFactory.getLogger(ExpedienteService.class);
log.debug("Procesando expediente id={}", expediente.getId());
log.error("Error al procesar expediente", e);
```

### Reglas del Backend Java

1. **DTOs siempre validados**: Todo DTO de entrada en `api/dto/request/` debe tener al menos `@NotNull` o `@NotBlank` en los campos obligatorios.

2. **`@PreAuthorize` obligatorio en cada endpoint**: No depender de la configuración de rutas en `SecurityConfig`. Cada método de controlador debe declarar explícitamente su política de acceso.

3. **No exponer entidades JPA directamente**: Los controladores nunca deben retornar entidades JPA. Siempre mapear a DTOs con MapStruct.

4. **Prohibido `@Query(nativeQuery=true)` con SQL MySQL-específico**: Usar JPA/HQL para garantizar compatibilidad con Oracle (objetivo final).

5. **Transacciones explícitas**: Métodos de escritura con `@Transactional`, métodos de lectura con `@Transactional(readOnly = true)`.

6. **Constructor injection obligatorio**: No usar `@Autowired` en campos. Los beans se inyectan siempre por constructor.

### Reglas del Frontend TypeScript

1. **Tipos estrictos**: Prohibido el uso de `any`. Todo debe estar tipado con interfaces en `core/models/`.

2. **Unsubscribe obligatorio**: Usar `takeUntilDestroyed()` de Angular o gestionar la desuscripción manualmente para evitar memory leaks.

3. **Operaciones async en servicios**: La lógica HTTP pertenece a los servicios, no a los componentes. Los componentes solo llaman a servicios y reaccionan a observables.

4. **PrimeNG para todos los componentes de UI**: No crear componentes de UI desde cero. Usar y componer componentes de PrimeNG existentes.

5. **Sin estilos globales innecesarios**: Los estilos van en el `.scss` del componente correspondiente. Evitar modificar `styles.scss` global.

### Reglas de Base de Datos

1. **Migraciones Flyway immutables**: Nunca modificar una migración ya aplicada. Crear siempre una nueva.

2. **Datos de catálogo en migraciones**: Los seeds de catálogos van en las migraciones SQL (`INSERT INTO cat_xxx...`), no en código Java.

3. **Índices explícitos**: Todo índice debe crearse en la migración correspondiente. No depender de índices automáticos.

4. **Sin native queries propietarias**: Cumplir con la regla Oracle-ready de la estrategia Dual-DB.

---

## 8. Checklist de PR

Antes de solicitar revisión de un Pull Request, verificar:

```
[ ] Los tests del backend pasan: mvn test
[ ] Los tests del frontend pasan: ng test --watch=false
[ ] El build de producción es exitoso: mvn package && ng build --configuration=production
[ ] No hay console.log ni System.out.println en el código nuevo
[ ] Todos los DTOs de entrada tienen validaciones Bean Validation
[ ] Todos los endpoints del controlador tienen @PreAuthorize
[ ] No hay @Query(nativeQuery=true) con SQL MySQL-específico
[ ] Las nuevas migraciones Flyway usan ANSI SQL estándar
[ ] El commit message sigue el estándar Conventional Commits
[ ] La descripción del PR explica el qué y el por qué del cambio
```

---

*Este manual cubre el flujo de contribución. Para detalles técnicos adicionales, consultar los documentos anteriores de esta serie.*
