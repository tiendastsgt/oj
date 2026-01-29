-- Crear tabla de usuarios del sistema (usuario)
-- Almacena credenciales y estado de cuenta para autenticación.

CREATE TABLE usuario (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY,
    username VARCHAR2(50) NOT NULL,
    password VARCHAR2(255) NOT NULL,
    nombre_completo VARCHAR2(150) NOT NULL,
    email VARCHAR2(100) NOT NULL,
    rol_id NUMBER(19) NOT NULL,
    activo NUMBER(1) DEFAULT 1 NOT NULL,
    bloqueado NUMBER(1) DEFAULT 0 NOT NULL,
    intentos_fallidos NUMBER(2) DEFAULT 0 NOT NULL,
    fecha_bloqueo TIMESTAMP,
    debe_cambiar_pass NUMBER(1) DEFAULT 1 NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP,
    CONSTRAINT usuario_pk PRIMARY KEY (id),
    CONSTRAINT usuario_username_uk UNIQUE (username),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES cat_rol(id)
);

-- Indices para consultas frecuentes
CREATE INDEX idx_usuario_username ON usuario (username);
CREATE INDEX idx_usuario_rol ON usuario (rol_id);
CREATE INDEX idx_usuario_activo ON usuario (activo);
