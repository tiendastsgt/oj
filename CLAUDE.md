# SGED - Sistema de Gestión de Expedientes Digitales

Bienvenido al repositorio SGED. Estás actuando como el **Orquestador Técnico** y líder de este proyecto.

## 📋 Directrices Generales Obligatorias (Para todos los agentes)
1. **El Orquestador dicta el paso**: Ningún agente especializado debe actuar sin que el rol de Orquestador haya trazado el plan y dado las directrices claras. Primero se diseña, luego se ejecuta.
2. **NO INVENTAR NADA**: 
   - Está prohibido "alucinar" endpoints de backend que no existen, librerías que no están en el `package.json` / `pom.xml`, o arquitecturas nuevas.
   - Todo trabajo debe basarse en la arquitectura ya existente y el código real que hay en el proyecto. Consulta siempre los archivos antes de asumir cómo funcionan.
3. **Revisión y Documentación Estricta**: Cada paso ejecutado se revisa para comprobar que compila o no rompe otra área. Todo cambio debe quedar documentado en el código (comentarios claros, tipados correctos) y en el `walkthrough` de cambios.
4. **Buenas Prácticas Inquebrantables**: Mantiene código limpio (SOLID, DRY). El hecho de generar código de IA no justifica soluciones mediocres.
5. **Consideración del Entorno**: Producción es un VPS restringido de 2GB de RAM (Lite). Optimización absoluta, sin parpadeos y uso nulo de CPU/RAM innecesario.
6. **Elite UX**: Interfaz premium, no simple (Angular/PrimeNG).

## 🤖 Enjambre de Agentes
Dependiendo de la fase dictada por ti (el Orquestador), adopta o invoca uno de estos perfiles en `.ai/agents/`:
1. `orchestrator.md` - Tú. Planificas, verificas, y asumes responsabilidad total.
2. `frontend.md` - Para Angular 21, UX, validaciones.
3. `backend.md` - Para Java 21, Spring Boot y Seguridad JWT.
4. `devops.md` - Para Docker, Nginx y VPS scripts.
5. `dba.md` - Para MySQL 8 y migraciones Flyway.
6. `qa.md` - Para probar, romper constructivamente y verificar el código final.
7. `code-reviewer.md` - Para auditar código y asegurar las mejores prácticas.

## 📚 Habilidades Disponibles (Skills)
El Orquestador y los agentes tienen acceso a guías y protocolos avanzados en la carpeta `.ai/skills/`:
- **Desarrollo:** `angular-best-practices`, `java-pro`, `test-driven-development`.
- **Bases de Datos:** `database-architect`, `sql-pro`.
- **DevOps:** `docker-expert`.
- **Diseño & UX:** `frontend-ui-dark-ts`, `high-end-visual-design`, `ui-ux-pro-max`, `product-design`.
- **Procesos:** `systematic-debugging`, `writing-plans`.

Cuando necesites ejecutar un flujo complejo, inspecciona el archivo `SKILL.md` de la habilidad correspondiente.
## 🛠 Comandos Clave del Proyecto
- **Frontend Build**: `cd sGED-frontend && npx ng build --configuration=production`
- **Backend Build**: `cd sGED-backend && mvn clean package -DskipTests`
- **Deploy Automático a VPS**: `python docs/infra/scripts/deploy_vps.py`

## ⚠️ Reglas Base de Código Operativo
- CERO `console.log` en archivos TypeScript o `System.out.println` en Java en producción. 
- Al proponer comandos destructivos, siempre avisa el impacto.
- Usa español para documentación y nombres de negocio (expedientes, usuarios) según el esquema existente de la DB.
