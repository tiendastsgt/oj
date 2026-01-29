-- Crear tabla de auditoría (auditoria)
-- Auditoría inmutable: solo inserciones desde la lógica de aplicación.

CREATE TABLE auditoria (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario VARCHAR2(50) NOT NULL,
    ip VARCHAR2(45) NOT NULL,
    accion VARCHAR2(50) NOT NULL,
    modulo VARCHAR2(50) NOT NULL,
    recurso_id NUMBER(19),
    valor_anterior CLOB,
    valor_nuevo CLOB,
    detalle VARCHAR2(500),
    CONSTRAINT auditoria_pk PRIMARY KEY (id)
);

-- Indices para consultas de auditoría
CREATE INDEX idx_auditoria_fecha ON auditoria (fecha);
CREATE INDEX idx_auditoria_usuario ON auditoria (usuario);
CREATE INDEX idx_auditoria_accion ON auditoria (accion);
CREATE INDEX idx_auditoria_modulo ON auditoria (modulo);
CREATE INDEX idx_auditoria_recurso ON auditoria (recurso_id);
