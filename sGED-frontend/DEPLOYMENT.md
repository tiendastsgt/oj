# Guía de Despliegue - SGED Frontend

## Construir imagen Docker

### Opción 1: Build directo sin compose
```bash
cd sGED-frontend
docker build -t sged-frontend:latest .
docker run -d -p 80:80 sged-frontend:latest
```

### Opción 2: Usando docker-compose (recomendado para desarrollo)
```bash
# Desde la raíz del proyecto
docker-compose up -d sged-frontend
```

## Build local (desarrollo)

### Desarrollo con watch
```bash
npm install
npm start  # ng serve --configuration development
```
Accede a `http://localhost:4200`

### Build production local
```bash
npm run build -- --configuration production
```
Output en `dist/sged-frontend/`

### Tests
```bash
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
```

## Configuraciones en angular.json

**Production:**
- Optimización habilitada
- Hashing de assets
- Source maps deshabilitados
- AOT compilation
- Reemplazo de environment.ts por environment.prod.ts
- Budget: máximo 5MB

**Development:**
- Sin optimización
- Source maps habilitados
- Chunks nombrados
- Sin minificación

## Ambientes

- **Local (development):** `src/environments/environment.ts`
  ```typescript
  export const environment = {
    apiUrl: 'http://localhost:8080/api/v1'
  };
  ```

- **Production:** `src/environments/environment.prod.ts`
  ```typescript
  export const environment = {
    apiUrl: '/api/v1'  // Ruta relativa para proxy reverso
  };
  ```

## Nginx Configuration

- SPA fallback: Todas las rutas retornan index.html
- Cache para assets hasheados: 1 año (immutable)
- Gzip compression habilitado
- Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

## Docker Compose Stack Completo

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Servicios disponibles:
# - Frontend (Nginx): http://localhost:80
# - Backend (Spring Boot): http://localhost:8080
# - Auth Service (FastAPI): http://localhost:8001
# - MySQL: localhost:3306

# Ver logs
docker-compose logs -f sged-frontend

# Detener servicios
docker-compose down
```

## Verificación de salud

```bash
# Frontend está listo
curl http://localhost/

# Backend está listo
curl http://localhost:8080/api/v1/health

# Auth service está listo
curl http://localhost:8001/health
```

## Notas de Producción

1. **Environment.prod.ts:** Usar ruta relativa `/api/v1` para que funcione detrás de proxy reverso
2. **Dockerfile multi-stage:** Node 22 para compilación, nginx 1.27 para servir (optimiza tamaño)
3. **Budget alerts:** Si la app excede 5MB, el build falla
4. **Cache busting:** Los assets incluyen hash en el nombre (main-ZLRVJIHU.js), permite caching agresivo
5. **docker-compose.yml:** Contiene servicios completos con healthchecks

## Troubleshooting

**Build falla por budget:**
```bash
# Aumentar límite temporalmente en angular.json:
// "maximumError": "5mb" -> "maximumError": "10mb"
```

**Tests fallan con módulos:**
```bash
npm install
ng test -- --watch=false --browsers=ChromeHeadless
```

**Docker: Permisos en Linux:**
```bash
sudo usermod -aG docker $USER
# Reiniciar sesión
```
