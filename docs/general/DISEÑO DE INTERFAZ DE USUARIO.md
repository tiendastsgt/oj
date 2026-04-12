---
Documento: DISEÑO DE INTERFAZ DE USUARIO
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

## \# SECCIÓN 7: DISEÑO DE INTERFAZ DE USUARIO

\-\--

\## 7.1 Principios de Diseño UI

\### 7.1.1 Guía de Estilo

\| Principio \| Aplicación \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*Simplicidad\*\* \| Interfaces limpias, sin elementos innecesarios
\|

\| \*\*Consistencia\*\* \| Mismos patrones en todo el sistema \|

\| \*\*Feedback\*\* \| Respuesta visual a cada acción del usuario \|

\| \*\*Accesibilidad\*\* \| Contraste adecuado, navegación por teclado
\|

\| \*\*Eficiencia\*\* \| Máximo 3 clics para funciones principales \|

\### 7.1.2 Paleta de Colores

\`\`\`

COLORES PRINCIPALES (Institucional OJ)

──────────────────────────────────────────────────────

Primario (Azul institucional)

┌────────┐

│ │ #1E3A5F - Headers, botones principales

└────────┘

Secundario (Azul claro)

┌────────┐

│ │ #3B82F6 - Links, elementos interactivos

└────────┘

COLORES DE ESTADO

──────────────────────────────────────────────────────

Éxito Advertencia Error

┌────────┐ ┌────────┐ ┌────────┐

│ │ #22C55E │ │ #F59E0B │ │ #EF4444

└────────┘ └────────┘ └────────┘

Info

┌────────┐

│ │ #3B82F6

└────────┘

COLORES NEUTROS

──────────────────────────────────────────────────────

Fondo principal Fondo secundario Bordes

┌────────┐ ┌────────┐ ┌────────┐

│ │ #FFFFFF │ │ #F8FAFC │ │ #E2E8F0

└────────┘ └────────┘ └────────┘

Texto principal Texto secundario

┌────────┐ ┌────────┐

│ │ #1E293B │ │ #64748B

└────────┘ └────────┘

\`\`\`

\### 7.1.3 Tipografía

\| Elemento \| Fuente \| Tamaño \| Peso \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\--\|

\| Títulos h1 \| Inter \| 24px \| 600 \|

\| Títulos h2 \| Inter \| 20px \| 600 \|

\| Títulos h3 \| Inter \| 16px \| 600 \|

\| Texto normal \| Inter \| 14px \| 400 \|

\| Texto pequeño \| Inter \| 12px \| 400 \|

\| Labels \| Inter \| 14px \| 500 \|

\| Botones \| Inter \| 14px \| 500 \|

\### 7.1.4 Componentes PrimeNG Utilizados

\| Componente \| Uso \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\--\|

\| p-table \| Tablas de datos con paginación \|

\| p-dialog \| Modales y diálogos \|

\| p-dropdown \| Selectores \|

\| p-calendar \| Selector de fechas \|

\| p-inputtext \| Campos de texto \|

\| p-button \| Botones \|

\| p-toast \| Notificaciones \|

\| p-confirmdialog \| Confirmaciones \|

\| p-fileupload \| Carga de archivos \|

\| p-progressbar \| Barras de progreso \|

\| p-menu \| Menús \|

\| p-breadcrumb \| Navegación \|

\| p-paginator \| Paginación \|

\| p-card \| Tarjetas de contenido \|

\-\--

\## 7.2 Layout Principal

\### 7.2.1 Estructura General

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ HEADER (60px) │

│ ┌──────┐ ┌─────────┐ ┌───────────┐ │

│ │ Logo │ 🔍 Buscar expediente\... │ Usuario │ │ Salir │ │

│ └──────┘ └─────────┘ └───────────┘ │

├────────────────┬────────────────────────────────────────────────────────────┤

│ │ │

│ SIDEBAR │ CONTENIDO PRINCIPAL │

│ (250px) │ │

│ │ ┌──────────────────────────────────────────────────────┐ │

│ ┌──────────┐ │ │ Breadcrumb: Inicio \> Expedientes \> Detalle │ │

│ │ 📁 Exped │ │
└──────────────────────────────────────────────────────┘ │

│ ├──────────┤ │ │

│ │ 🔍 Buscar│ │
┌──────────────────────────────────────────────────────┐ │

│ ├──────────┤ │ │ │ │

│ │ 📊 Admin │ │ │ ÁREA DE TRABAJO │ │

│ └──────────┘ │ │ │ │

│ │ │ │ │

│ │ │ │ │

│ │ │ │ │

│ │ │ │ │

│ │ └──────────────────────────────────────────────────────┘ │

│ │ │

└────────────────┴────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.2.2 Header

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ ┌────────────┐ │

│ │ SGED │ ┌─────────────────────────────────────┐ │

│ │ Organismo │ │ 🔍 Buscar expediente\... │ │

│ │ Judicial │ └─────────────────────────────────────┘ │

│ └────────────┘ │

│ ┌─────────────────────────────────┐ │

│ │ 👤 Juan Pérez (Secretario) ▼ │ │

│ └─────────────────────────────────┘ │

│ │ │

│ ├── Mi Perfil │

│ ├── Cambiar Contraseña │

│ └── Cerrar Sesión │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.2.3 Sidebar

\`\`\`

┌────────────────────┐

│ │

│ MENÚ PRINCIPAL │

│ │

├────────────────────┤

│ │

│ 📁 Expedientes │ ← Todos los usuarios

│ │

├────────────────────┤

│ │

│ 🔍 Búsqueda │ ← Todos los usuarios

│ Avanzada │

│ │

├────────────────────┤

│ │

│ ⚙️ Administración │ ← Solo ADMINISTRADOR

│ │

│ ├─ Usuarios │

│ │ │

│ └─ Auditoría │

│ │

└────────────────────┘

\`\`\`

\### 7.2.4 Área de Contenido

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Expedientes \> Detalle (Breadcrumb) │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│
┌───────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ CONTENIDO DINÁMICO │ │

│ │ │ │

│ │ - Listados │ │

│ │ - Formularios │ │

│ │ - Detalles │ │

│ │ - Visores │ │

│ │ │ │

│
└───────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.3 Pantallas de Autenticación

\### 7.3.1 Login

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ │

│ │

│ ┌─────────────────────────────────────┐ │

│ │ │ │

│ │ ┌─────────────┐ │ │

│ │ │ SGED │ │ │

│ │ │ ⚖️ OJ │ │ │

│ │ └─────────────┘ │ │

│ │ │ │

│ │ Sistema de Gestión de Expedientes │ │

│ │ Digitales │ │

│ │ │ │

│ │ ┌─────────────────────────────────┐│ │

│ │ │ 👤 Usuario ││ │

│ │ │ \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_││
│

│ │ └─────────────────────────────────┘│ │

│ │ │ │

│ │ ┌─────────────────────────────────┐│ │

│ │ │ 🔒 Contraseña 👁️ ││ │

│ │ │ \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_││
│

│ │ └─────────────────────────────────┘│ │

│ │ │ │

│ │ ┌─────────────────────────────────┐│ │

│ │ │ INICIAR SESIÓN ││ │

│ │ └─────────────────────────────────┘│ │

│ │ │ │

│ │ ❌ Usuario o contraseña incorrectos│ ← Error │

│ │ │ │

│ └─────────────────────────────────────┘ │

│ │

│ © 2026 Organismo Judicial │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.3.2 Cambio de Contraseña

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Cambiar Contraseña │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ Cambiar Contraseña │ │

│ │ ───────────────────────────────────────────────────────────── │ │

│ │ │ │

│ │ Contraseña actual \* │ │

│ │ ┌───────────────────────────────────────────────────────┐ 👁️ │ │

│ │ │ │ │ │

│ │ └───────────────────────────────────────────────────────┘ │ │

│ │ │ │

│ │ Nueva contraseña \* │ │

│ │ ┌───────────────────────────────────────────────────────┐ 👁️ │ │

│ │ │ │ │ │

│ │ └───────────────────────────────────────────────────────┘ │ │

│ │ ℹ️ Mínimo 8 caracteres, una mayúscula, una minúscula, un número │ │

│ │ │ │

│ │ Confirmar nueva contraseña \* │ │

│ │ ┌───────────────────────────────────────────────────────┐ 👁️ │ │

│ │ │ │ │ │

│ │ └───────────────────────────────────────────────────────┘ │ │

│ │ │ │

│ │ │ │

│ │ ┌─────────────┐ ┌─────────────────┐ │ │

│ │ │ Cancelar │ │ Guardar Cambios │ │ │

│ │ └─────────────┘ └─────────────────┘ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\### 7.3.3 Flujos de UI de autenticación (Fase 1 implementada)

- **Login:** validación de campos requeridos; error por credenciales inválidas o cuenta bloqueada.
- **Login con `debeCambiarPassword=true`:** redirección inmediata a `/cambiar-password`.
- **Logout:** llamada a `POST /api/v1/auth/logout`, limpieza de sesión y redirección a `/login`.
- **Cambio de contraseña:** política mínima (8 chars, mayúscula, minúscula, número); muestra errores de validación.
- **Manejo de errores backend:** consume `errors[]` como lista de strings con mensajes de validación y muestra detalle amigable.
- **Storage:** tokens y sesión en `sessionStorage` mediante `StorageService`.

\## 7.4 Pantallas de Expedientes

\### 7.4.1 Listado de Expedientes

\- Tabla con paginación y ordenación por `fechaCreacion` y `numero` (`page`, `size`, `sort=campo,dir`).
\- Acciones por rol:
  \- **ADMIN/SECRETARIO:** Nuevo / Ver / Editar.
  \- **AUXILIAR:** Nuevo / Ver.
  \- **CONSULTA:** Ver.
\- Catálogos para nombres legibles (tipo, estado, juzgado).

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Expedientes │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Expedientes ┌──────────────────┐ │

│ │ + Nuevo Expediente│ │

│ └──────────────────┘ │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Estado: \[Todos ▼\] Buscar: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\] 🔍
│ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ \# Expediente ▼ │Tipo Proceso│ Juzgado │ Fecha │Estado │ Acc │ │

│
├──────────────────┼────────────┼────────────┼──────────┼───────┼─────┤
│

│ │ 12345-2026-00003 │ Civil │ Juzgado 1 │ 23/01/26 │Activo │👁 ✏️│ │

│ │ 12345-2026-00002 │ Civil │ Juzgado 1 │ 16/01/26 │Activo │👁 ✏️│ │

│ │ 12345-2026-00001 │ Civil │ Juzgado 1 │ 15/01/26 │Espera │👁 ✏️│ │

│ │ 12344-2025-00089 │ Penal │ Juzgado 3 │ 20/12/25 │Cerrado│👁 │ │

│ │ 12344-2025-00088 │ Laboral │ Juzgado 5 │ 18/12/25 │Activo │👁 ✏️│ │

│
├──────────────────────────────────────────────────────────────────────┤
│

│ │ │ │

│ │ Mostrando 1-5 de 150 expedientes │ │

│ │ │ │

│ │ Filas por página: \[10 ▼\] \[\<\] \[1\] \[2\] \[3\] \... \[15\]
\[\>\] │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

Leyenda de acciones:

👁 = Ver detalle

✏️ = Editar (solo si tiene permiso)

\`\`\`

\### 7.4.2 Detalle de Expediente

\- Muestra datos del expediente y accesos a documentos asociados.
\- Acciones disponibles según rol y juzgado del usuario.
\- Manejo de errores vía `message` y `errors[]` (lista de strings).

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Expedientes \> 12345-2026-00001 │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Expediente 12345-2026-00001 ┌────────┐ ┌──────────────┐ │

│ │ Editar │ │ Consultar SGT│ │

│ └────────┘ └──────────────┘ │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ INFORMACIÓN GENERAL │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ │ │

│ │ Número: 12345-2026-00001 │ │

│ │ Tipo de proceso: Civil │ │

│ │ Juzgado: Juzgado Primero Civil │ │

│ │ Estado: ┌────────────┐ │ │

│ │ │ ● En espera│ │ │

│ │ └────────────┘ │ │

│ │ Fecha de inicio: 15/01/2026 │ │

│ │ │ │

│ │ Descripción: │ │

│ │ Demanda por incumplimiento de contrato │ │

│ │ │ │

│ │ Observaciones: │ │

│ │ Se notificó a la parte demandada el 20/01/2026 │ │

│ │ │ │

│ │ Referencia SGT: CIV-2026-001234 (SGTV2) │ │

│ │ │ │

│ │ ───────────────────────────────────────────────────────────────── │
│

│ │ Creado por: jperez \| 15/01/2026 09:30 │ │

│ │ Modificado por: mgarcia \| 20/01/2026 14:15 │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ DOCUMENTOS (5) ┌──────────────────┐│ │

│ │ │ + Cargar Documento││ │

│
├─────────────────────────────────────────────────└──────────────────┘┤
│

│ │ │ │

│ │ 📄 Demanda_inicial.pdf │ Demanda │ 1.5 MB │ 15/01 │👁⬇🖨│ │

│ │ 📄 Contrato_original.pdf │ Prueba │ 2.0 MB │ 15/01 │👁⬇🖨│ │

│ │ 🖼️ Foto_evidencia.jpg │ Multimedia │ 512 KB │ 16/01 │👁⬇🖨│ │

│ │ 📄 Notificacion_demandado.pdf │ Notifica. │ 256 KB │ 18/01 │👁⬇🖨│ │

│ │ 📄 Resolucion_admision.pdf │ Resolución │ 758 KB │ 23/01 │👁⬇🖨│ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

Leyenda de acciones documentos:

👁 = Ver/Reproducir

⬇ = Descargar

🖨 = Imprimir

🗑 = Eliminar (solo si tiene permiso, no mostrado aquí)

\`\`\`

\### 7.4.3 Formulario Crear/Editar Expediente

\- Validaciones de campos obligatorios y catálogos.
\- `numero` es visible pero **no editable** en edición.
\- `juzgado`:
  \- ADMINISTRADOR: seleccionable.
  \- SECRETARIO/AUXILIAR: fijo según juzgado del usuario.
\- Catálogos (`tipos-proceso`, `estados-expediente`, `juzgados`) para nombres legibles.

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Expedientes \> Nuevo Expediente │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Nuevo Expediente │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ Número de expediente \* Tipo de proceso \* │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ 12345-2026-00004 │ │ Civil ▼ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Juzgado \* Estado \* │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ Juzgado Primero Civil ▼ │ │ Activo ▼ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Fecha de inicio \* Referencia SGT │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ 📅 23/01/2026 │ │ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Descripción \* │ │

│ │ ┌──────────────────────────────────────────────────────────────┐ │ │

│ │ │ │ │ │

│ │ │ │ │ │

│ │ │ │ │ │

│ │ └──────────────────────────────────────────────────────────────┘ │ │

│ │ 0/500 caracteres │ │

│ │ │ │

│ │ Observaciones │ │

│ │ ┌──────────────────────────────────────────────────────────────┐ │ │

│ │ │ │ │ │

│ │ │ │ │ │

│ │ └──────────────────────────────────────────────────────────────┘ │ │

│ │ 0/1000 caracteres │ │

│ │ │ │

│ │ │ │

│ │ ┌───────────┐ ┌───────────────────┐ │ │

│ │ │ Cancelar │ │ Guardar Expediente│ │ │

│ │ └───────────┘ └───────────────────┘ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.5 Pantallas de Documentos

\### 7.5.1 Carga de Documentos (Modal)

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Cargar Documentos \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ Expediente: 12345-2026-00001 │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ 📁 │ │

│ │ │ │

│ │ Arrastre archivos aquí o haga clic │ │

│ │ │ │

│ │ \[Seleccionar archivos\] │ │

│ │ │ │

│ │ Formatos: PDF, Word, Imágenes, Audio, Video \| Máximo: 100 MB │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│ Tipo de documento: │

│ ┌───────────────────────────────────────────────────────────────────┐
│

│ │ Seleccione tipo\... ▼ │ │

│ └───────────────────────────────────────────────────────────────────┘
│

│ │

│ Archivos seleccionados: │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ 📄 Resolucion.pdf (758 KB) \[████████████████\] 100% ✓ │ │

│ │ 🖼️ Evidencia2.jpg (1.2 MB) \[█████████░░░░░░░\] 60% │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│ ┌───────────┐ ┌─────────────────┐ │

│ │ Cancelar │ │ Cargar Archivos │ │

│ └───────────┘ └─────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.5.2 Visor de PDF

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ 📄 Demanda_inicial.pdf \[🔍\] \[🖨\] \[⬇\] \[⛶\] \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ \[◀\] Página \[ 3 \] de 15 \[▶\] Zoom: \[−\] \[100%\] \[+\]
\[Ajustar\]│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ \[CONTENIDO DEL PDF\] │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

Leyenda barra superior:

🔍 = Buscar en documento

🖨 = Imprimir

⬇ = Descargar

⛶ = Pantalla completa

X = Cerrar

\`\`\`

\### 7.5.3 Visor de Imágenes

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ 🖼️ Foto_evidencia.jpg \[🖨\] \[⬇\] \[⛶\] \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ Zoom: \[−\] \[100%\] \[+\] \[Ajustar\] │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ \[IMAGEN\] │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│ \[◀ Anterior\] \[Siguiente ▶\] │

│ (si hay múltiples imágenes) │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.5.4 Reproductor de Audio

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ 🎵 Audiencia_15012026.mp3 \[⬇\] \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ 🎵 │ │

│ │ │ │

│ │ Audiencia_15012026.mp3 │ │

│ │ │ │

│ │ ━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │

│ │ 02:35 15:20 │ │

│ │ │ │

│ │ │ │

│ │ \[⏮\] \[ ▶ PLAY \] \[⏭\] │ │

│ │ │ │

│ │ │ │

│ │ 🔊 ━━━━━━━━━━○━━━ │ │

│ │ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.5.5 Reproductor de Video

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ 🎬 Grabacion_audiencia.mp4 \[⬇\] \[⛶\] \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ \[CONTENIDO VIDEO\] │ │

│ │ │ │

│ │ ▶ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ ▶ ━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━ 05:23 / 45:30 🔊━━○ ⛶ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.6 Pantallas de Búsqueda

\### 7.6.1 Búsqueda Rápida (Header)

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ ┌─────────────────────────────────────────┐ │

│ │ 🔍 Buscar expediente\... │ │

│ └─────────────────────────────────────────┘ │

│ │ │

│ ▼ │

│ ┌─────────────────────────────────────────┐ │

│ │ Resultados para \"12345-2026\": │ │

│ │ │ │

│ │ 📁 12345-2026-00001 - Civil - Activo │ │

│ │ 📁 12345-2026-00002 - Civil - Activo │ │

│ │ 📁 12345-2026-00003 - Civil - Activo │ │

│ │ │ │

│ │ \[Ver todos los resultados →\] │ │

│ └─────────────────────────────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.6.2 Búsqueda Avanzada

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Búsqueda Avanzada │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Búsqueda Avanzada │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ Número de expediente Tipo de proceso │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ 12345 │ │ Todos ▼ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Juzgado Estado │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ Todos ▼ │ │ Activo ▼ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Fecha de inicio │ │

│ │ ┌────────────────┐ a ┌────────────────┐ │ │

│ │ │ 📅 01/01/2026 │ │ 📅 31/01/2026 │ │ │

│ │ └────────────────┘ └────────────────┘ │ │

│ │ │ │

│ │ ┌───────────────┐ ┌─────────────┐ │ │

│ │ │ Limpiar filtros│ │ 🔍 Buscar │ │ │

│ │ └───────────────┘ └─────────────┘ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Resultados: 25 expedientes encontrados │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ │ │

│ │ Filtros activos: \[Número: 12345 ×\] \[Estado: Activo ×\] │ │

│ │ │ │

│ │ \# Expediente ▼ │Tipo Proceso│ Juzgado │ Fecha │Estado │Acc │ │

│ ├──────────────────┼────────────┼────────────┼──────────┼───────┼────┤
│

│ │ 12345-2026-00003 │ Civil │ Juzgado 1 │ 23/01/26 │Activo │ 👁 │ │

│ │ 12345-2026-00002 │ Civil │ Juzgado 1 │ 16/01/26 │Activo │ 👁 │ │

│ │ 12345-2026-00001 │ Civil │ Juzgado 1 │ 15/01/26 │Activo │ 👁 │ │

│ │ \... │ \... │ \... │ \... │ \... │ \...│ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ Mostrando 1-10 de 25 \[\<\] \[1\] \[2\] \[3\] \[\>\] │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.7 Pantallas de Administración

\### 7.7.1 Gestión de Usuarios

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Administración \> Usuarios │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Gestión de Usuarios ┌──────────────────┐ │

│ │ + Nuevo Usuario │ │

│ └──────────────────┘ │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Estado: \[Todos ▼\] Buscar: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\] 🔍
│ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Usuario │ Nombre │ Rol │ Juzgado │Estado│ Acc │ │

│ ├────────────┼────────────────┼─────────────┼───────────┼──────┼─────┤
│

│ │ admin │ Administrador │ ADMINISTRADOR│ Juzgado 1│ ● Act│✏️ 🔓│ │

│ │ jperez │ Juan Pérez │ SECRETARIO │ Juzgado 1 │ ● Act│✏️ 🔓│ │

│ │ mgarcia │ María García │ AUXILIAR │ Juzgado 2 │ ● Act│✏️ 🔓│ │

│ │ rlopez │ Roberto López │ CONSULTA │ Juzgado 3 │ ○ Ina│✏️ 🔓│ │

│ │ asmith │ Ana Smith │ SECRETARIO │ Juzgado 1 │ 🔒 Bloq│✏️ 🔓│ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ Mostrando 1-5 de 15 \[\<\] \[1\] \[2\] \[3\] \[\>\] │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

Leyenda:

● Act = Activo (verde)

○ Ina = Inactivo (gris)

🔒 Bloq = Bloqueado (rojo)

✏️ = Editar

🔓 = Desbloquear (solo si está bloqueado)

🔑 = Resetear contraseña

\`\`\`

\### 7.7.2 Formulario Usuario (Modal)

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Nuevo Usuario \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ Nombre de usuario \* Nombre completo \* │

│ ┌──────────────────────────┐ ┌──────────────────────────┐ │

│ │ mrodriguez │ │ Manuel Rodríguez │ │

│ └──────────────────────────┘ └──────────────────────────┘ │

│ │

│ Correo electrónico \* │

│ ┌───────────────────────────────────────────────────────────────────┐
│

│ │ mrodriguez@oj.gob.gt │ │

│ └───────────────────────────────────────────────────────────────────┘
│

│ │

│ Rol \* Juzgado \* │

│ ┌──────────────────────────┐ ┌──────────────────────────┐ │

│ │ SECRETARIO ▼ │ │ Juzgado Primero Civil ▼ │ │

│ └──────────────────────────┘ └──────────────────────────┘ │

│ │

│ ☑ Usuario activo │

│ │

│ ℹ️ Se generará una contraseña temporal que el usuario deberá cambiar │

│ en su primer inicio de sesión. │

│ │

│ ┌───────────┐ ┌─────────────────┐ │

│ │ Cancelar │ │ Guardar Usuario │ │

│ └───────────┘ └─────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.7.3 Consulta de Auditoría

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Administración \> Auditoría │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Logs de Auditoría │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ Fecha desde Fecha hasta Usuario │ │

│ │ ┌────────────────┐ ┌────────────────┐ ┌─────────────────┐ │ │

│ │ │ 📅 20/01/2026 │ │ 📅 23/01/2026 │ │ Todos ▼ │ │ │

│ │ └────────────────┘ └────────────────┘ └─────────────────┘ │ │

│ │ │ │

│ │ Acción │ │

│ │ ┌─────────────────────────────────────┐ ┌─────────────┐ │ │

│ │ │ Todas ▼ │ │ 🔍 Filtrar │ │ │

│ │ └─────────────────────────────────────┘ └─────────────┘ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Mostrando 250 registros │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ Fecha/Hora │ Usuario │ Acción │ Módulo │ Detalle │ │

│
├───────────────────┼─────────┼──────────────────┼─────────┼──────────┤
│

│ │ 23/01/26 10:45 │ jperez │ DOCUMENTO_CARGADO│documentos│ Exp:12345│ │

│ │ 23/01/26 10:35 │ mgarcia │ EXPEDIENTE_EDIT │expediente│ Exp:12345│ │

│ │ 23/01/26 10:30 │ jperez │ EXPEDIENTE_CREADO│expediente│ Exp:12345│ │

│ │ 23/01/26 08:00 │ jperez │ LOGIN_EXITOSO │ auth │ IP:192\...│ │

│ │ 22/01/26 17:30 │ admin │ USUARIO_CREADO │ admin │ mgarcia │ │

│ │ 22/01/26 17:00 │ mgarcia │ LOGIN_EXITOSO │ auth │ IP:192\...│ │

│ │ \... │ \... │ \... │ \... │ \... │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ Filas: \[20 ▼\] \[\<\] \[1\] \[2\] \[3\] \... \[\>\] │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.8 Componentes Comunes

\### 7.8.1 Tablas Paginadas

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ Columna 1 ▼ │ Columna 2 │ Columna 3 │ Columna 4 │ Acciones │

├───────────────┼───────────────┼───────────────┼───────────────┼────────────┤

│ Dato 1 │ Dato 2 │ Dato 3 │ Dato 4 │ 👁 ✏️ 🗑 │

│ Dato 1 │ Dato 2 │ Dato 3 │ Dato 4 │ 👁 ✏️ 🗑 │

│ Dato 1 │ Dato 2 │ Dato 3 │ Dato 4 │ 👁 ✏️ 🗑 │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Filas por página: \[10 ▼\] │

│ │

│ Mostrando 1-10 de 150 \[\<\] \[1\] \[2\] \[3\] \... \[\>\] │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.8.2 Mensajes y Notificaciones (Toast)

\`\`\`

ÉXITO (Verde)

┌─────────────────────────────────────────┐

│ ✓ Expediente creado exitosamente X │

└─────────────────────────────────────────┘

ERROR (Rojo)

┌─────────────────────────────────────────┐

│ ✗ Error al cargar el documento X │

└─────────────────────────────────────────┘

ADVERTENCIA (Amarillo)

┌─────────────────────────────────────────┐

│ ⚠ Su sesión expirará en 5 minutos X │

└─────────────────────────────────────────┘

INFORMACIÓN (Azul)

┌─────────────────────────────────────────┐

│ ℹ Documento cargándose\... X │

└─────────────────────────────────────────┘

\`\`\`

\### 7.8.3 Diálogos de Confirmación

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ ⚠️ Confirmar acción \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ │

│ ¿Está seguro de que desea eliminar este documento? │

│ │

│ Esta acción no se puede deshacer. │

│ │

│ │

│ ┌───────────┐ ┌───────────────────┐ │

│ │ Cancelar │ │ Sí, eliminar │ │

│ └───────────┘ └───────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.8.4 Indicador de Carga

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ │

│ │

│ ◠◡◠ │

│ Cargando\... │

│ │

│ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.8.5 Estado Vacío

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ │

│ │

│ 📁 │

│ │

│ No se encontraron expedientes │

│ │

│ Intente con otros filtros de búsqueda │

│ │

│ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.9 Resumen de Pantallas

\| Módulo \| Pantalla \| Tipo \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|

\| \*\*Autenticación\*\* \| Login \| Página completa \|

\| \*\*Autenticación\*\* \| Cambio de contraseña \| Página con layout \|

\| \*\*Expedientes\*\* \| Listado \| Página con layout \|

\| \*\*Expedientes\*\* \| Detalle \| Página con layout \|

\| \*\*Expedientes\*\* \| Formulario crear/editar \| Página con layout
\|

\| \*\*Documentos\*\* \| Carga de documentos \| Modal \|

\| \*\*Documentos\*\* \| Visor PDF \| Modal/Página \|

\| \*\*Documentos\*\* \| Visor imágenes \| Modal \|

\| \*\*Documentos\*\* \| Reproductor audio \| Modal \|

\| \*\*Documentos\*\* \| Reproductor video \| Modal/Página \|

\| \*\*Búsqueda\*\* \| Búsqueda rápida \| Dropdown en header \|

\| \*\*Búsqueda\*\* \| Búsqueda avanzada \| Página con layout \|

\| \*\*Administración\*\* \| Gestión usuarios \| Página con layout \|

\| \*\*Administración\*\* \| Formulario usuario \| Modal \|

\| \*\*Administración\*\* \| Auditoría \| Página con layout \|

\*\*Total de pantallas:\*\* 15

------------------------------------------------------------------------

## 7.10 Gestión Documental y Visores (Fase 3)

### 7.10.1 Objetivo funcional

- **RF-002/RF-003/RF-004/RF-011** y **HU-008/009/010/011**: carga, visualización, reproducción, descarga e impresión.
- Documentos siempre vinculados a un **expediente**.
- SGED puede **mostrar** documentos de SGTv1/SGTv2, pero **no** escribe ni modifica allí (solo lectura).

### 7.10.2 Modelo de datos (resumen)

- **documento**: `id`, `expediente_id`, `tipo_documento_id`, `nombre_original`, `nombre_storage`, `ruta`, `tamanio_bytes`, `mime_type`, `extension`, `usuario_creacion`, `fecha_creacion`, `eliminado`, `usuario_eliminacion`, `fecha_eliminacion`.
- **FKs**: `expediente_id -> expediente.id`, `tipo_documento_id -> cat_tipo_documento.id`.
- **Índices**: por `expediente_id`, `tipo_documento_id`, `fecha_creacion`.
- **cat_tipo_documento**: ver sección de catálogos existente.

### 7.10.3 Arquitectura backend (resumen)

- **Capas**: `api.documento`, `application.documento`, `infrastructure.documento`, `shared`.
- **Servicios**:
  - `FileValidationService`: tamaño ≤100MB, extensión y MIME permitidos.
  - `DocumentoStorageService`: FS local `{base}/{año}/{mes}/{expedienteId}/{docId}`.
  - `DocumentoService`: alta/listado/detalle/contenido/eliminación lógica.
  - `DocumentoConversionService`: DOC/DOCX → PDF (JODConverter + LibreOffice).
  - `AuditoriaService`: eventos de documentos (async).

### 7.10.4 API de Documentos (contrato previsto)

Endpoints (ver detalle en 6.4):
- `GET /api/v1/expedientes/{id}/documentos`
- `POST /api/v1/expedientes/{id}/documentos` (multipart/form-data)
- `GET /api/v1/documentos/{id}`
- `GET /api/v1/documentos/{id}/contenido?modo=inline|attachment`
- `GET /api/v1/documentos/{id}/stream` (opcional para audio/video)
- `DELETE /api/v1/documentos/{id}` (eliminación lógica si la política lo permite)
- `POST /api/v1/documentos/{id}/impresion`

**Roles permitidos:**
- **ADMIN**: todo.
- **SECRETARIO**: subir/listar/ver/eliminar según política.
- **AUXILIAR**: subir/listar/ver.
- **CONSULTA**: listar/ver/descargar/imprimir.

**Regla de juzgado:** no ADMIN solo interactúa con expedientes de su juzgado.

**Errores:**
- 400: validaciones (size > 100MB, tipo no permitido) con `errors: string[]`.
- 403: rol/juzgado no permitido.
- 404: ID inexistente (sin auditoría, solo logging).

### 7.10.5 Auditoría de documentos

- Acciones: `DOCUMENTO_CARGADO`, `DOCUMENTO_VISUALIZADO`, `DOCUMENTO_DESCARGADO`, `MULTIMEDIA_REPRODUCIDA`, `DOCUMENTO_IMPRESO`, `DOCUMENTO_ELIMINADO` (si aplica).
- Regla: **solo éxito** → auditoría. 403/404 → solo logs (`request_id`, `user_id`).

### 7.10.6 UI de Documentos y Visores (Angular)

- Integración en detalle del expediente: panel/pestaña **Documentos**.
- Componentes:
  - `documentos-list`: tabla con acciones Ver/Descargar/Imprimir; Subir (ADMIN/SECRETARIO/AUXILIAR); Eliminar (ADMIN/SECRETARIO si aplica).
  - `documentos-upload`: drag & drop, barra de progreso, validaciones.
  - `documento-viewer`: PDF/Word (PDF convertido), imágenes, audio/video (HTML5).
- Usabilidad: estados de carga, botones deshabilitados durante carga.
- Errores: `errors[]` como lista; fallback a `message`.