CREATE DATABASE IF NOT EXISTS yape_saas;
USE yape_saas;

CREATE TABLE IF NOT EXISTS superadmins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planes_suscripcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    duracion_dias INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_negocio VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    correo_recepcion_yape VARCHAR(255) UNIQUE NOT NULL,
    api_token VARCHAR(64) UNIQUE NULL,
    plan_id INT NULL,
    suscripcion_inicio DATE NULL,
    suscripcion_fin DATE NULL,
    estado ENUM('Activo', 'Suspendido') DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES planes_suscripcion(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transacciones_yape (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    remitente_nombre VARCHAR(255) NOT NULL,
    fecha_hora_yape DATETIME NOT NULL,
    is_test TINYINT(1) DEFAULT 0 NOT NULL,
    procesado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_is_test (is_test),
    UNIQUE KEY unique_pago (tenant_id, remitente_nombre, monto, fecha_hora_yape)
);

INSERT IGNORE INTO tenants (id, nombre_negocio, email, password_hash, correo_recepcion_yape, api_token, estado)
VALUES (1, 'Mi Bodega Prueba', 'bodega@prueba.com', '123456', 'pagos@mibodega.com', 'mi_token_secreto_123', 'Activo');
