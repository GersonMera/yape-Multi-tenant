USE yape_saas;

-- Agregar columna is_test para identificar transacciones de prueba/simuladas
ALTER TABLE transacciones_yape 
ADD COLUMN IF NOT EXISTS is_test TINYINT(1) DEFAULT 0 NOT NULL AFTER fecha_hora_yape;

-- Crear índice para agilizar consultas filtradas por transacciones reales
CREATE INDEX IF NOT EXISTS idx_is_test ON transacciones_yape (is_test);
