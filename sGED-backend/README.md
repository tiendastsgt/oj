## SGED Backend

### API de Autenticación (resumen)

#### POST /api/v1/auth/cambiar-password

**Respuesta de error (400):**

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    "La contraseña nueva no cumple la política de seguridad"
  ]
}
```

### API de Expedientes (resumen)

#### POST /api/v1/expedientes

**Respuesta de error (400):**

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    "Tipo de proceso inválido",
    "Estado inválido"
  ]
}
```

### Notas sobre errores

El campo `errors` es una lista de mensajes de validación (`string`), no objetos `{field, message}`.

## Fase 3 – Documentos y Visores (en desarrollo)

**Endpoints implementados:**
- `GET /api/v1/expedientes/{id}/documentos`
- `POST /api/v1/expedientes/{id}/documentos`
- `GET /api/v1/documentos/{id}`
- `GET /api/v1/documentos/{id}/contenido`
- `GET /api/v1/documentos/{id}/stream`
- `DELETE /api/v1/documentos/{id}`
- `POST /api/v1/documentos/{id}/impresion`

**Notas:**
- Requieren JWT.
- RBAC + filtro por juzgado igual que expedientes.
- Límite 100MB y formatos permitidos (pdf/doc/docx/jpg/jpeg/png/gif/bmp/mp3/wav/ogg/mp4/webm/avi/mov).
- Respuestas de error: `errors[]` (string[]) + `message`.

**Aviso:** la API de documentos está disponible pero puede sufrir ajustes menores mientras Fase 3 se consolida (p. ej. streaming o política de eliminación).

## Verificacion local (backend)

El proyecto usa Maven Wrapper (version fijada en `.mvn/wrapper/maven-wrapper.properties`) para ejecutar tests sin requerir Maven instalado en el sistema.

Linux/Mac:
```bash
./mvnw clean verify -Ptest-coverage
```

Windows (PowerShell/CMD):
```bash
mvnw.cmd clean verify -Ptest-coverage
```
