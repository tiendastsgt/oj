-- Script de seeding para entorno VPS (MySQL)
-- Generado para corregir Error 500 y permitir acceso QA

USE sged_db;

-- Limpiar antes de insertar (opcional pero recomendado en seeding inicial)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE auth_attempt;
TRUNCATE TABLE usuario;
TRUNCATE TABLE cat_rol;
TRUNCATE TABLE cat_juzgado;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Roles
INSERT INTO cat_rol (id, nombre, descripcion, activo) VALUES 
(1, 'ADMINISTRADOR', 'Administrador del sistema', 1),
(2, 'SECRETARIO', 'Secretario judicial', 1),
(3, 'AUXILIAR', 'Auxiliar judicial', 1),
(4, 'CONSULTA', 'Usuario de solo consulta', 1);

-- 2. Juzgados
INSERT INTO cat_juzgado (id, codigo, nombre, activo) VALUES 
(1, 'JUZ-CIV-01', 'Juzgado Primero Civil', 1);

-- 3. Usuarios QA (Password: QAPassword123!)
-- Hash: $2b$12$fWSxVHskBmLIYK0UZoEuDeAdMt2I.ZkD5ckUfPtJ76IMvH.KeE3jK
INSERT INTO usuario (id, username, password, nombre_completo, email, rol_id, juzgado_id, activo, bloqueado, intentos_fallidos, debe_cambiar_pass, fecha_creacion) VALUES 
(1, 'admin.qa', '$2b$12$fWSxVHskBmLIYK0UZoEuDeAdMt2I.ZkD5ckUfPtJ76IMvH.KeE3jK', 'Administrador QA', 'admin.qa@oj.gob.gt', 1, 1, 1, 0, 0, 0, NOW()),
(2, 'secretario.qa', '$2b$12$fWSxVHskBmLIYK0UZoEuDeAdMt2I.ZkD5ckUfPtJ76IMvH.KeE3jK', 'Secretario QA', 'secretario.qa@oj.gob.gt', 2, 1, 1, 0, 0, 0, NOW()),
(3, 'juez.qa', '$2b$12$fWSxVHskBmLIYK0UZoEuDeAdMt2I.ZkD5ckUfPtJ76IMvH.KeE3jK', 'Juez QA', 'juez.qa@oj.gob.gt', 2, 1, 1, 0, 0, 0, NOW());
