-- Alinear tabla usuario con plan_detallado.md: agregar juzgado_id y FK.

ALTER TABLE usuario
    ADD juzgado_id NUMBER(19) NOT NULL;

ALTER TABLE usuario
    ADD CONSTRAINT fk_usuario_juzgado FOREIGN KEY (juzgado_id)
        REFERENCES cat_juzgado (id);

-- Indice para filtros por juzgado
CREATE INDEX idx_usuario_juzgado ON usuario (juzgado_id);
