package com.oj.sged.shared.util;

/**
 * Constantes para acciones de auditoría en el sistema.
 * Facilita centralización de acciones auditadas y evita literales dispersos.
 */
public final class AuditAction {

    // --- Autenticación ---
    public static final String LOGIN_EXITOSO = "LOGIN_EXITOSO";
    public static final String LOGIN_FALLIDO = "LOGIN_FALLIDO";
    public static final String LOGOUT = "LOGOUT";
    public static final String CAMBIO_PASSWORD = "CAMBIO_PASSWORD";
    public static final String CUENTA_BLOQUEADA = "CUENTA_BLOQUEADA";
    public static final String RESET_PASSWORD_ADMIN = "RESET_PASSWORD_ADMIN";

    // --- Expedientes ---
    public static final String EXPEDIENTE_CREADO = "EXPEDIENTE_CREADO";
    public static final String EXPEDIENTE_EDITADO = "EXPEDIENTE_EDITADO";
    public static final String EXPEDIENTE_CONSULTADO = "EXPEDIENTE_CONSULTADO";

    // --- Documentos ---
    public static final String DOCUMENTO_CARGADO = "DOCUMENTO_CARGADO";
    public static final String DOCUMENTO_VISUALIZADO = "DOCUMENTO_VISUALIZADO";
    public static final String DOCUMENTO_DESCARGADO = "DOCUMENTO_DESCARGADO";
    public static final String DOCUMENTO_IMPRESO = "DOCUMENTO_IMPRESO";
    public static final String DOCUMENTO_ELIMINADO = "DOCUMENTO_ELIMINADO";

    // --- Búsquedas ---
    public static final String BUSQUEDA_REALIZADA = "BUSQUEDA_REALIZADA";

    // --- Integración SGT ---
    public static final String SGT_CONSULTADO = "SGT_CONSULTADO";

    // --- Administración (Usuarios y Roles) ---
    public static final String USUARIO_CREADO = "USUARIO_CREADO";
    public static final String USUARIO_ACTUALIZADO = "USUARIO_ACTUALIZADO";
    public static final String USUARIO_DESACTIVADO = "USUARIO_DESACTIVADO";
    public static final String USUARIO_BLOQUEADO = "USUARIO_BLOQUEADO";
    public static final String USUARIO_DESBLOQUEADO = "USUARIO_DESBLOQUEADO";
    public static final String ROL_CAMBIADO = "ROL_CAMBIADO";
    public static final String CONSULTAR_AUDITORIA = "CONSULTAR_AUDITORIA";

    // --- Módulos de auditoría ---
    public static final String MODULO_AUTH = "AUTH";
    public static final String MODULO_EXPEDIENTE = "EXPEDIENTE";
    public static final String MODULO_DOCUMENTO = "DOCUMENTO";
    public static final String MODULO_BUSQUEDA = "BUSQUEDA";
    public static final String MODULO_INTEGRACION = "INTEGRACION";
    public static final String MODULO_ADMIN = "ADMIN";

    private AuditAction() {
        throw new AssertionError("No se puede instanciar esta clase de utilidad");
    }
}
