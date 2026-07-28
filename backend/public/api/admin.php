<?php

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

require_once __DIR__ . '/../../src/config.php';
require_once __DIR__ . '/../../src/AuthHelper.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token, X-Admin-Secret");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Verificación obligatoria del rol Super Admin
$authHeader = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (strpos($authHeader, 'Bearer ') === 0) {
    $authHeader = substr($authHeader, 7);
}

$userData = verifyAuthToken($authHeader);
if (!$userData || ($userData['rol'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado: Se requiere rol de Super Administrador']);
    exit;
}

try {
    $db_host = $_ENV['DB_HOST'] ?? '127.0.0.1';
    $db_name = $_ENV['DB_NAME'] ?? 'yape_saas';
    $db_user = $_ENV['DB_USER'] ?? 'root';
    $db_pass = $_ENV['DB_PASS'] ?? '';
    
    $pdo = new \PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión a BD']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? $_GET['action'] ?? '';

// Acción: Listar todos los comercios / tenants con estadísticas contables
if ($action === 'list_tenants' || empty($action)) {
    $sql = "SELECT 
                id, 
                nombre_negocio, 
                email, 
                correo_recepcion_yape, 
                api_token, 
                estado, 
                created_at,
                (SELECT COUNT(*) FROM transacciones_yape WHERE tenant_id = tenants.id) AS count_yapes,
                (SELECT COALESCE(SUM(monto), 0) FROM transacciones_yape WHERE tenant_id = tenants.id AND is_test = 0) AS total_real,
                (SELECT COALESCE(SUM(monto), 0) FROM transacciones_yape WHERE tenant_id = tenants.id AND is_test = 1) AS total_test
            FROM tenants 
            ORDER BY id ASC";
    
    $stmt = $pdo->query($sql);
    $tenants = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $tenants
    ]);
    exit;
}

// Acción: Crear un nuevo comercio (Tenant)
if ($action === 'create_tenant') {
    $nombre = trim($input['nombre_negocio'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '123456';
    $correoYape = trim($input['correo_recepcion_yape'] ?? '');

    if (empty($nombre) || empty($email)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El nombre y correo del comercio son obligatorios']);
        exit;
    }

    if (empty($correoYape)) {
        $correoYape = "pagos_" . time() . "@mibodega.com";
    }

    $tokenApi = 'token_' . bin2hex(random_bytes(12));
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO tenants (nombre_negocio, email, password_hash, correo_recepcion_yape, api_token, estado) 
                               VALUES (:nombre, :email, :pass, :correo, :token, 'Activo')");
        $stmt->execute([
            ':nombre' => $nombre,
            ':email' => $email,
            ':pass' => $passwordHash,
            ':correo' => $correoYape,
            ':token' => $tokenApi
        ]);

        $newId = $pdo->lastInsertId();

        echo json_encode([
            'status' => 'success',
            'message' => "Comercio '$nombre' registrado exitosamente en la plataforma",
            'data' => [
                'id' => $newId,
                'nombre_negocio' => $nombre,
                'email' => $email,
                'api_token' => $tokenApi
            ]
        ]);
        exit;
    } catch (\PDOException $e) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El correo electrónico ya está registrado o en uso']);
        exit;
    }
}

// Acción: Alternar estado de una tienda (Activo <-> Suspendido)
if ($action === 'toggle_status') {
    $tenantId = (int)($input['tenant_id'] ?? 0);
    $newStatus = ($input['new_status'] ?? '') === 'Suspendido' ? 'Suspendido' : 'Activo';

    if ($tenantId <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de comercio no válido']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE tenants SET estado = :status WHERE id = :id");
    $stmt->execute([':status' => $newStatus, ':id' => $tenantId]);

    echo json_encode([
        'status' => 'success',
        'message' => "Estado de la tienda actualizado a: $newStatus"
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Acción de administración no reconocida']);
exit;
