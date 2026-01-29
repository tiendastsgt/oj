-- Crear tabla de tokens revocados (revoked_token)
-- Tabla de blacklist para JWT revocados.

CREATE TABLE revoked_token (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY,
    token_jti VARCHAR2(255) NOT NULL,
    fecha_revocacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    CONSTRAINT revoked_token_pk PRIMARY KEY (id),
    CONSTRAINT revoked_token_jti_uk UNIQUE (token_jti)
);

-- Indices para validación y purga
CREATE INDEX idx_revoked_token_jti ON revoked_token (token_jti);
CREATE INDEX idx_revoked_token_exp ON revoked_token (fecha_expiracion);
