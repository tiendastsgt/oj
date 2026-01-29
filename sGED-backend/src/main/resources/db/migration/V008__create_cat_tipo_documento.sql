CREATE TABLE cat_tipo_documento (
  id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR2(100) NOT NULL UNIQUE,
  descripcion VARCHAR2(255)
);

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES ('Demanda', 'Documento inicial del proceso');
INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES ('Resolución', 'Resoluciones judiciales');
INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES ('Escrito', 'Escritos presentados por las partes');
INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES ('Prueba documental', 'Documentos de prueba');
INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES ('Prueba multimedia', 'Audio, video o imagen como evidencia');
INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES ('Otro', 'Otro tipo de documento');
