CREATE TABLE documento (
  id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  expediente_id NUMBER(19) NOT NULL,
  tipo_documento_id NUMBER(19),
  nombre_original VARCHAR2(255) NOT NULL,
  nombre_storage VARCHAR2(100) NOT NULL,
  ruta VARCHAR2(500) NOT NULL,
  tamanio NUMBER(19) NOT NULL,
  mime_type VARCHAR2(100) NOT NULL,
  extension VARCHAR2(10) NOT NULL,
  usuario_creacion VARCHAR2(50) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  eliminado NUMBER(1) DEFAULT 0 NOT NULL,
  usuario_eliminacion VARCHAR2(50),
  fecha_eliminacion TIMESTAMP,
  CONSTRAINT fk_documento_expediente FOREIGN KEY (expediente_id) REFERENCES expediente(id),
  CONSTRAINT fk_documento_tipo FOREIGN KEY (tipo_documento_id) REFERENCES cat_tipo_documento(id)
);

CREATE INDEX idx_documento_expediente ON documento(expediente_id);
CREATE INDEX idx_documento_tipo ON documento(tipo_documento_id);
CREATE INDEX idx_documento_eliminado ON documento(eliminado);
CREATE INDEX idx_documento_creacion ON documento(fecha_creacion);
CREATE INDEX idx_documento_extension ON documento(extension);
