-- Crear tabla de catalogo de juzgados (cat_juzgado)
-- Catalogo maestro de juzgados para relacion con usuario y expediente.

CREATE TABLE cat_juzgado (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY,
    codigo VARCHAR2(20) NOT NULL,
    nombre VARCHAR2(200) NOT NULL,
    activo NUMBER(1) DEFAULT 1 NOT NULL,
    CONSTRAINT cat_juzgado_pk PRIMARY KEY (id),
    CONSTRAINT cat_juzgado_codigo_uk UNIQUE (codigo)
);

-- Indice para busqueda por codigo
CREATE INDEX idx_juzgado_codigo ON cat_juzgado (codigo);
