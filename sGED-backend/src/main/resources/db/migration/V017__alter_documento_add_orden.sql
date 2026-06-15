-- Persistencia del orden manual de documentos dentro de cada expediente.
-- Permite reordenar los documentos por arrastre y conservar el orden entre sesiones.

ALTER TABLE documento ADD orden NUMBER(19) DEFAULT 0 NOT NULL;

-- Backfill: los documentos existentes conservan su orden de creación (por id),
-- que es el mismo orden con el que se venían listando.
UPDATE documento SET orden = id;

-- Indice compuesto para el listado ordenado por expediente.
CREATE INDEX idx_documento_orden ON documento (expediente_id, orden);
