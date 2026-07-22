-- Archivo: update_db.sql
-- Ejecuta este script en tu base de datos (Ej: phpMyAdmin) para actualizar el modelo.

-- 1. Agregamos el campo api_token a los Tenants.
-- Este token será la llave (Authorization Bearer) que configuraremos en el MacroDroid del cliente.
ALTER TABLE tenants
ADD COLUMN api_token VARCHAR(64) UNIQUE NULL AFTER password_hash;

-- 2. Asegurarnos de tener el índice único para evitar dobles inserciones por MacroDroid
-- (Si ya lo creaste en la Fase 1, este paso no es necesario).
ALTER TABLE transacciones_yape
ADD UNIQUE KEY unique_pago (tenant_id, remitente_nombre, monto, fecha_hora_yape);
