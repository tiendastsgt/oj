-- Crear tabla de intentos de autenticación (auth_attempt)
-- Soporta control de lockout por intentos fallidos.

CREATE TABLE auth_attempt (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY,
    username VARCHAR2(50) NOT NULL,
    intento_exitoso NUMBER(1) NOT NULL,
    ip VARCHAR2(45) NOT NULL,
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT auth_attempt_pk PRIMARY KEY (id),
    CONSTRAINT fk_auth_attempt_user FOREIGN KEY (username) REFERENCES usuario(username)
);

-- Indices para conteo por usuario, fecha y origen
CREATE INDEX idx_auth_attempt_username ON auth_attempt (username, fecha_intento);
CREATE INDEX idx_auth_attempt_fecha ON auth_attempt (fecha_intento);
CREATE INDEX idx_auth_attempt_ip ON auth_attempt (ip, fecha_intento);
