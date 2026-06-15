# Aislamiento de agentes paralelos — encabezado estándar (SGED)

> **Propósito:** que varios agentes trabajen a la vez sin pisarse el código ni contaminar su contexto, y sin
> chocar en los **recursos vivos compartidos** (BD `sged_db`, VPS Lite 2GB).
> **Cómo se usa:** copiá el bloque de abajo al **inicio del prompt** de cada agente y llená los `{{...}}`.
>
> **Contexto SGED:** es **un solo repo (monorepo)** `C:\proyectos\oj` con dos áreas —
> `sGED-backend` (Java 21 / Spring, paquete `com.oj.sged.*`) y `sGED-frontend` (Angular 21 / PrimeNG).
> El aislamiento entre frentes se logra con **rama + worktree + allowlist de rutas que no se solapan**.

---

## Bloque para pegar (rellenar los `{{...}}`)

```
## CONTRATO DE AISLAMIENTO (leer antes de tocar nada)
- **Frente / tarea:** {{nombre del frente — p.ej. "Frente FE · Visor de documentos"}}
- **Repo:** C:\proyectos\oj  (monorepo único de SGED)
- **Área del monorepo:** {{sGED-backend  |  sGED-frontend  |  infra/docs}}
- **Rama:** trabajás SOLO en `{{feature/...  |  fix/...  |  chore/...  |  docs/...}}`. Antes de empezar:
  `git fetch` + `git status`; confirmá que estás en esa rama y el árbol limpio. NO trabajes en `main`.
- **Worktree:** usá un git worktree propio para esta rama (skill `using-git-worktrees` /
  `dispatching-parallel-agents`). No compartas árbol de trabajo con otro agente.
- **Carpetas/módulos que PODÉS tocar (allowlist):** {{lista explícita de rutas}}
- **NO tocar:** cualquier ruta fuera del allowlist; el OTRA área del monorepo si no está en tu allowlist;
  módulos/sprints de otros frentes; `CLAUDE.md` y `sGED-frontend/CLAUDE.md` (solo-lectura).
- **Trackers:** podés editar SOLO el plan de tu frente en `docs/plans/{{tu-plan}}.md`. El status global en
  `docs/fases/**` es **solo-lectura** (lo escribe el Orquestador / PM, no los agentes).
- **Contexto:** cargá solo `CLAUDE.md` (router) + tu plan en `docs/plans/` + el spec de tu frente.
  NO cargues contexto de otros frentes ni de otros sprints.
- **Recursos compartidos (acceso serializado — NO en paralelo):** BD `sged_db` (MySQL 8) y VPS Lite 2GB
  (conexión por env `VPS_HOST` / `VPS_PORT` / `VPS_USER` / `VPS_PASSWORD`; la IP NO se hardcodea).
  Cualquier deploy o migración Flyway: avisar, hacer backup y seguir `docs/infra/DEPLOYMENT_GUIDE.md`
  (deploy = `python docs/infra/scripts/deploy_vps.py`). Si otro agente podría estar desplegando, ESPERÁ o
  preguntá; no deployees a ciegas (el VPS Lite tiene 2GB: un build/deploy simultáneo lo tumba).
- **Migraciones Flyway:** una sola versión nueva por frente; coordiná el número `V__` para no colisionar.
- **Done:** merge a `main` SOLO con build verde (`npx ng build --configuration=production` /
  `mvn clean package`) y verificación. No mergees trabajo a medias.
```

---

## Cómo llenar el allowlist (regla práctica)
Listá las carpetas/módulos mínimos que el agente necesita y nada más. Si dos agentes comparten área del
monorepo, sus allowlists **no deben solaparse** — así no hay conflictos de merge. Si un cambio cae fuera del
allowlist, el agente para y pregunta en vez de tocar.

Referencia de rutas reales del monorepo:
- **Backend:** `sGED-backend/src/main/java/com/oj/sged/{api,application,infrastructure,shared}/**`,
  `sGED-backend/src/main/resources/db/migration/**` (Flyway).
- **Frontend:** `sGED-frontend/src/app/**`, `sGED-frontend/src/assets/**`.
- **Infra/DevOps:** `docker-compose-*.yml`, `nginx/**`, `docs/infra/**`.

## Ejemplo 1 — Agente Frontend (visor de documentos)
```
## CONTRATO DE AISLAMIENTO
- Frente / tarea: Frente FE · Visor de documentos (PDF + video robustez)
- Repo: C:\proyectos\oj   |   Área: sGED-frontend
- Rama: fix/viewer-pdf-video-robustness  (git fetch + status antes; árbol limpio)
- Worktree: propio para esta rama.
- Carpetas que PODÉS tocar: sGED-frontend/src/app/**/documento-viewer/**,
  sGED-frontend/src/app/**/pres-viewer/**  (solo lo del visor).
- NO tocar: sGED-backend (otra área); otros componentes del frontend; CLAUDE.md.
- Trackers: editar solo docs/plans/<plan-del-visor>.md. docs/fases/** = solo-lectura.
- Recursos compartidos: si necesitás el backend vivo, usá el de QA/local; no toques el VPS prod.
- Done: merge a main con build de producción verde + verificación visual del visor.
```

## Ejemplo 2 — Agente Backend (Word → PDF)
```
## CONTRATO DE AISLAMIENTO
- Frente / tarea: Frente BE · Conversión Word/.doc → PDF para previsualización
- Repo: C:\proyectos\oj   |   Área: sGED-backend
- Rama: feature/sprint-ux-4-word-to-pdf  (git fetch + status antes; árbol limpio)
- Worktree: propio. NO compartir árbol con el agente de frontend.
- Carpetas que PODÉS tocar: sGED-backend/src/main/java/com/oj/sged/application/service/**
  (servicio de conversión), .../infrastructure/integration/**, .../api/controller/** (solo el endpoint nuevo).
- NO tocar: sGED-frontend; módulos de auth/expediente que no sean del feature; otras integraciones.
- Trackers: editar solo docs/plans/<plan-word-to-pdf>.md. docs/fases/** = solo-lectura.
- Recursos compartidos: sged_db + VPS son COMPARTIDOS → deploy/migración Flyway serializado, con backup,
  siguiendo docs/infra/DEPLOYMENT_GUIDE.md. No deployees si el otro podría estar desplegando.
  OJO: los .doc de prueba son TX_WORD (TextControl), no Word estándar — validá la conversión con ellos.
- Migración Flyway: si agregás tabla/columna, reservá un único V__ y avisá el número.
- Done: merge a main con mvn clean package verde + verificación.
```

---
**Regla de oro:** el código se aísla con **rama + worktree + allowlist** que no se solapan; los recursos vivos
(`sged_db`, VPS Lite 2GB) se protegen con **acceso serializado y un solo escritor**. El status global
(`docs/fases/**`) lo escribe **solo el Orquestador**.
