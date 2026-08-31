-- Migración para el Sistema de Suscripciones y Bloqueo Automático

USE yape_saas;

-- 1. Agregar columnas en la tabla tenants si no existen
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS dia_corte_mensual TINYINT UNSIGNED DEFAULT 30 AFTER estado,
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE NULL AFTER dia_corte_mensual,
ADD COLUMN IF NOT EXISTS ultimo_pago_at DATETIME NULL AFTER fecha_vencimiento;

-- 2. Agregar columna whatsapp_soporte en superadmins si no existe
ALTER TABLE superadmins
ADD COLUMN IF NOT EXISTS whatsapp_soporte VARCHAR(25) DEFAULT '+51999999999' AFTER password_hash;

-- 3. Inicializar fecha de vencimiento a 30 días a partir de hoy para los tenants existentes
UPDATE tenants 
SET fecha_vencimiento = DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    dia_corte_mensual = DAY(DATE_ADD(CURDATE(), INTERVAL 30 DAY))
WHERE fecha_vencimiento IS NULL;
