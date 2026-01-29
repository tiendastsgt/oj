-- Crear tabla de roles del sistema (cat_rol)
-- Contiene roles oficiales SGED. Datos iniciales incluidos.

CREATE TABLE cat_rol (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY,
    nombre VARCHAR2(50) NOT NULL,
    descripcion VARCHAR2(200),
    activo NUMBER(1) DEFAULT 1 NOT NULL,
    CONSTRAINT cat_rol_pk PRIMARY KEY (id),
    CONSTRAINT cat_rol_nombre_uk UNIQUE (nombre)
);

-- Seed de roles oficiales
INSERT INTO cat_rol (nombre, descripcion) VALUES ('ADMINISTRADOR', 'Administrador del sistema');
INSERT INTO cat_rol (nombre, descripcion) VALUES ('SECRETARIO', 'Secretario judicial');
INSERT INTO cat_rol (nombre, descripcion) VALUES ('AUXILIAR', 'Auxiliar judicial');
INSERT INTO cat_rol (nombre, descripcion) VALUES ('CONSULTA', 'Usuario de solo consulta');
