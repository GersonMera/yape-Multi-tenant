<?php

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

try {
    $db_host = $_ENV['DB_HOST'] ?? '127.0.0.1';
    $db_name = $_ENV['DB_NAME'] ?? 'yape_saas';
    $db_user = $_ENV['DB_USER'] ?? 'root';
    $db_pass = $_ENV['DB_PASS'] ?? '';
    
    $pdo = new \PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
    
    echo "1. Conectado a BD MySQL ($db_name)...\n";
    
    // Hash para el superadmin (admin123)
    $hashAdmin = password_hash('admin123', PASSWORD_DEFAULT);
    // Hash para los tenants (123456)
    $hashTenant = password_hash('123456', PASSWORD_DEFAULT);

    // 2. Insertar / Actualizar Super Admin
    $sqlAdmin = "INSERT INTO superadmins (email, password_hash)
                 VALUES (:email, :pass)
                 ON DUPLICATE KEY UPDATE password_hash = :pass_upd";
    $stmtAdmin = $pdo->prepare($sqlAdmin);
    $stmtAdmin->execute([
        ':email' => 'admin@yape.com',
        ':pass' => $hashAdmin,
        ':pass_upd' => $hashAdmin
    ]);
    echo "2. Super Admin sembrado correctamente: admin@yape.com / admin123\n";

    // 3. Insertar / Actualizar Tenant 1 (Bodega)
    $sqlTenant1 = "INSERT INTO tenants (id, nombre_negocio, email, password_hash, correo_recepcion_yape, api_token, estado)
                   VALUES (1, 'Mi Bodega VIP', 'bodega@prueba.com', :pass, 'pagos@mibodega.com', 'mi_token_secreto_123', 'Activo')
                   ON DUPLICATE KEY UPDATE 
                       nombre_negocio = 'Mi Bodega VIP',
                       password_hash = :pass_upd,
                       estado = 'Activo'";
    $stmt1 = $pdo->prepare($sqlTenant1);
    $stmt1->execute([
        ':pass' => $hashTenant,
        ':pass_upd' => $hashTenant
    ]);
    echo "3. Tenant 1 sembrado: bodega@prueba.com / 123456 (Mi Bodega VIP)\n";

    // 4. Insertar / Actualizar Tenant 2 (Farmacia)
    $sqlTenant2 = "INSERT INTO tenants (id, nombre_negocio, email, password_hash, correo_recepcion_yape, api_token, estado)
                   VALUES (2, 'Farmacia VIP 24/7', 'farmacia@prueba.com', :pass, 'pagos@farmaciavip.com', 'token_farmacia_vip_456', 'Activo')
                   ON DUPLICATE KEY UPDATE 
                       nombre_negocio = 'Farmacia VIP 24/7',
                       password_hash = :pass_upd,
                       estado = 'Activo'";
    $stmt2 = $pdo->prepare($sqlTenant2);
    $stmt2->execute([
        ':pass' => $hashTenant,
        ':pass_upd' => $hashTenant
    ]);
    echo "4. Tenant 2 sembrado: farmacia@prueba.com / 123456 (Farmacia VIP 24/7)\n";

    echo "✅ Sembrado de Usuarios completado exitosamente.\n";

} catch (\Exception $e) {
    echo "❌ Error en sembrado de BD: " . $e->getMessage() . "\n";
    exit(1);
}
