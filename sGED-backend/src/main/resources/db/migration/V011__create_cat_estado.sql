-- Crear tabla de catalogo de estados de expediente (cat_estado)
-- Catalogo maestro para estados del expediente.

CREATE TABLE cat_estado (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY,
    nombre VARCHAR2(50) NOT NULL,
    descripcion VARCHAR2(200),
    activo NUMBER(1) DEFAULT 1 NOT NULL,
    CONSTRAINT cat_estado_pk PRIMARY KEY (id),
    CONSTRAINT cat_estado_nombre_uk UNIQUE (nombre)
);

-- Datos iniciales
INSERT INTO cat_estado (nombre, descripcion) VALUES ('Activo', 'Expediente en trámite activo');
INSERT INTO cat_estado (nombre, descripcion) VALUES ('En espera', 'Expediente en espera de resolución');
INSERT INTO cat_estado (nombre, descripcion) VALUES ('Suspendido', 'Expediente suspendido temporalmente');
INSERT INTO cat_estado (nombre, descripcion) VALUES ('Cerrado', 'Expediente cerrado/finalizado');
INSERT INTO cat_estado (nombre, descripcion) VALUES ('Archivado', 'Expediente archivado');
