#!/bin/bash
# Despliegue de SGED en QA - Guión Automatizado
# Archivo: deploy-qa.sh
# Propósito: Automatizar el despliegue completo en QA
# Fecha: Enero 2026
# Uso: bash deploy-qa.sh

set -e  # Exit si hay error

# ========================================
# COLORES PARA OUTPUT
# ========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================================
# FUNCIONES
# ========================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ========================================
# PRE-DESPLIEGUE
# ========================================

log_info "=========================================="
log_info "SGED QA Deployment - Fase 7"
log_info "=========================================="

# 1. Verificar estructura de directorios
log_info "Verificando estructura de directorios..."

if [ ! -f "docker-compose-qa.yml" ]; then
    log_error "docker-compose-qa.yml no encontrado"
    exit 1
fi

if [ ! -f ".env.qa" ]; then
    log_error ".env.qa no encontrado"
    exit 1
fi

if [ ! -d "nginx/certs" ]; then
    log_warning "Directorio nginx/certs no existe, creando..."
    mkdir -p nginx/certs
fi

log_success "Estructura de directorios OK"

# 2. Generar certificados TLS si no existen
log_info "Verificando certificados TLS..."

if [ ! -f "nginx/certs/certificate.crt" ] || [ ! -f "nginx/certs/private.key" ]; then
    log_warning "Certificados TLS no encontrados, generando autofirmados..."
    
    openssl req -x509 -newkey rsa:4096 \
        -keyout nginx/certs/private.key \
        -out nginx/certs/certificate.crt \
        -days 365 -nodes \
        -subj "/C=SV/ST=San Salvador/L=San Salvador/O=OJ/CN=sged-qa.local"
    
    log_success "Certificados TLS generados"
else
    log_success "Certificados TLS encontrados"
fi

# Verificar expiración de certificado
log_info "Verificando fecha de expiración del certificado..."
EXPIRATION=$(openssl x509 -in nginx/certs/certificate.crt -noout -dates | grep notAfter)
log_info "Certificado: $EXPIRATION"

# 3. Crear directorios de datos
log_info "Creando directorios de datos..."
mkdir -p data/documentos data/oracle-db logs/nginx logs/backend
chmod 755 data/* logs/*
log_success "Directorios de datos creados"

# 4. Validar docker-compose YAML
log_info "Validando syntax de docker-compose..."
docker-compose -f docker-compose-qa.yml config > /dev/null
log_success "docker-compose.yml válido"

# ========================================
# DESPLIEGUE
# ========================================

log_info "=========================================="
log_info "Iniciando despliegue..."
log_info "=========================================="

# 1. Detener servicios previos (si existen)
log_info "Deteniendo servicios previos (si existen)..."
docker-compose -f docker-compose-qa.yml down 2>/dev/null || true
log_success "Servicios previos detenidos"

# 2. Descargar latest images
log_info "Descargando images (docker pull)..."
docker-compose -f docker-compose-qa.yml pull || true
log_success "Images actualizadas"

# 3. Levantar servicios
log_info "Levantando servicios..."
docker-compose -f docker-compose-qa.yml up -d

# 4. Esperar a que servicios estén listos
log_info "Esperando a que servicios se levanten (60 segundos)..."
sleep 10

# ========================================
# VALIDACIÓN POST-DESPLIEGUE
# ========================================

log_info "=========================================="
log_info "Validando despliegue..."
log_info "=========================================="

# 1. Verificar que todos los servicios están running
log_info "Verificando estado de servicios..."
SERVICES=$(docker-compose -f docker-compose-qa.yml ps --services)
RUNNING_SERVICES=$(docker-compose -f docker-compose-qa.yml ps | grep "Up (healthy)" | wc -l)

log_info "Servicios esperados:"
docker-compose -f docker-compose-qa.yml ps

# 2. Verificar logs de backend
log_info "Verificando logs de backend..."
log_info "Esperando 30 segundos adicionales para que Spring Boot arranque completamente..."
sleep 30

BACKEND_LOGS=$(docker-compose -f docker-compose-qa.yml logs sged-backend-qa 2>/dev/null | tail -20)
if echo "$BACKEND_LOGS" | grep -q "Started"; then
    log_success "Backend Spring Boot arrancó correctamente"
else
    log_warning "Verificar logs: docker-compose logs -f sged-backend-qa"
fi

# 3. Test de conectividad básica
log_info "Realizando pruebas de conectividad..."

# Test NGINX/Frontend
log_info "Probando NGINX (HTTP → HTTPS)..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I http://localhost:80/ 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    log_success "HTTP redirige a HTTPS (Status: $HTTP_STATUS)"
else
    log_warning "HTTP redirect no respondió como esperado (Status: $HTTP_STATUS)"
fi

# Test HTTPS/Frontend
log_info "Probando HTTPS y Frontend..."
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k https://localhost/app/ 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    log_success "Frontend accesible (Status: $HTTPS_STATUS)"
else
    log_warning "Frontend no respondió (Status: $HTTPS_STATUS)"
fi

# Test Backend Health
log_info "Probando Backend Health Check..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k https://localhost/api/v1/health 2>/dev/null || echo "000")
if [ "$HEALTH_STATUS" = "200" ]; then
    log_success "Backend Health Check OK (Status: $HEALTH_STATUS)"
else
    log_warning "Backend Health Check no respondió (Status: $HEALTH_STATUS)"
fi

# Test Security Headers
log_info "Verificando headers de seguridad..."
HEADERS=$(curl -s -I -k https://localhost/ 2>/dev/null)
if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
    log_success "Header Strict-Transport-Security presente"
else
    log_warning "Header Strict-Transport-Security NO encontrado"
fi

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    log_success "Header X-Content-Type-Options presente"
else
    log_warning "Header X-Content-Type-Options NO encontrado"
fi

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    log_success "Header X-Frame-Options presente"
else
    log_warning "Header X-Frame-Options NO encontrado"
fi

# ========================================
# RESUMEN Y PRÓXIMOS PASOS
# ========================================

log_info "=========================================="
log_info "DESPLIEGUE COMPLETADO"
log_info "=========================================="

log_success "Stack QA levantado"
log_info "URLs de acceso:"
echo -e "  Frontend: ${BLUE}https://localhost/app/${NC}"
echo -e "  API Base: ${BLUE}https://localhost/api/v1/${NC}"
echo -e "  Health:   ${BLUE}https://localhost/api/v1/health${NC}"

log_info ""
log_info "Comandos útiles:"
echo "  Ver logs:         docker-compose -f docker-compose-qa.yml logs -f"
echo "  Ver estado:       docker-compose -f docker-compose-qa.yml ps"
echo "  Entrar en backend: docker exec -it sged-backend-qa bash"
echo "  Detener:          docker-compose -f docker-compose-qa.yml down"

log_info ""
log_warning "Próximos pasos:"
echo "  1. Accede a https://localhost/app/ en tu navegador"
echo "  2. Ignora advertencia de certificado autofirmado (TLS de prueba)"
echo "  3. Prueba login con credenciales configuradas"
echo "  4. Contacta al Agente de Testing para pruebas E2E"

log_info ""
log_success "¡QA listo para testing!"
