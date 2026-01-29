-- Crear tabla de catalogo de tipos de proceso (cat_tipo_proceso)
-- Catalogo maestro para clasificar expedientes.

CREATE TABLE cat_tipo_proceso (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY,
    nombre VARCHAR2(100) NOT NULL,
    descripcion VARCHAR2(300),
    activo NUMBER(1) DEFAULT 1 NOT NULL,
    CONSTRAINT cat_tipo_proceso_pk PRIMARY KEY (id),
    CONSTRAINT cat_tipo_proceso_nombre_uk UNIQUE (nombre)
);

-- Datos iniciales
INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES ('Civil', 'Procesos civiles');
INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES ('Penal', 'Procesos penales');
INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES ('Laboral', 'Procesos laborales');
INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES ('Familia', 'Procesos de familia');
INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES ('Administrativo', 'Procesos administrativos');
