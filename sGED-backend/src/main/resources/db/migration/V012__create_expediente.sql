-- Crear tabla de expedientes (expediente)
-- Soporta CRUD de expedientes en Fase 2.

CREATE TABLE expediente (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY,
    numero VARCHAR2(50) NOT NULL,
    tipo_proceso_id NUMBER(19) NOT NULL,
    juzgado_id NUMBER(19) NOT NULL,
    estado_id NUMBER(19) NOT NULL,
    fecha_inicio DATE NOT NULL,
    descripcion VARCHAR2(500) NOT NULL,
    observaciones VARCHAR2(1000),
    referencia_sgt VARCHAR2(50),
    referencia_fuente VARCHAR2(10),
    usuario_creacion VARCHAR2(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_modificacion VARCHAR2(50),
    fecha_modificacion TIMESTAMP,
    CONSTRAINT expediente_pk PRIMARY KEY (id),
    CONSTRAINT expediente_numero_uk UNIQUE (numero),
    CONSTRAINT fk_expediente_tipo FOREIGN KEY (tipo_proceso_id) REFERENCES cat_tipo_proceso(id),
    CONSTRAINT fk_expediente_juzgado FOREIGN KEY (juzgado_id) REFERENCES cat_juzgado(id),
    CONSTRAINT fk_expediente_estado FOREIGN KEY (estado_id) REFERENCES cat_estado(id),
    CONSTRAINT chk_ref_fuente CHECK (referencia_fuente IN ('SGTV1', 'SGTV2') OR referencia_fuente IS NULL)
);

-- Indices para consultas frecuentes
CREATE INDEX idx_expediente_numero ON expediente (numero);
CREATE INDEX idx_expediente_tipo ON expediente (tipo_proceso_id);
CREATE INDEX idx_expediente_juzgado ON expediente (juzgado_id);
CREATE INDEX idx_expediente_estado ON expediente (estado_id);
CREATE INDEX idx_expediente_fecha ON expediente (fecha_inicio);
CREATE INDEX idx_expediente_creacion ON expediente (fecha_creacion);
