<?php

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

require_once __DIR__ . '/../../src/config.php';

use App\Config;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token, X-Admin-Secret");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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

require_once __DIR__ . '/../../src/AuthHelper.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? $_GET['action'] ?? '';

if ($action === 'login') {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Correo y contraseña son obligatorios']);
        exit;
    }

    // 1. Buscar en tabla superadmins
    $stmtAdmin = $pdo->prepare("SELECT id, email, password_hash FROM superadmins WHERE email = :email LIMIT 1");
    $stmtAdmin->execute([':email' => $email]);
    $admin = $stmtAdmin->fetch(\PDO::FETCH_ASSOC);

    if ($admin && password_verify($password, $admin['password_hash'])) {
        $userData = [
            'id' => (int)$admin['id'],
            'email' => $admin['email'],
            'rol' => 'admin',
            'nombre_negocio' => 'Super Admin SaaS',
            'tenant_id' => null
        ];
        $token = buildAuthToken($userData);

        echo json_encode([
            'status' => 'success',
            'message' => 'Bienvenido Super Administrador',
            'token' => $token,
            'user' => $userData
        ]);
        exit;
    }

    // 2. Buscar en tabla tenants (Comercios)
    $stmtTenant = $pdo->prepare("SELECT id, nombre_negocio, email, password_hash, api_token, estado FROM tenants WHERE email = :email LIMIT 1");
    $stmtTenant->execute([':email' => $email]);
    $tenant = $stmtTenant->fetch(\PDO::FETCH_ASSOC);

    if ($tenant && password_verify($password, $tenant['password_hash'])) {
        if ($tenant['estado'] === 'Suspendido') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Tu comercio está suspendido. Contacta al soporte.']);
            exit;
        }

        $userData = [
            'id' => (int)$tenant['id'],
            'tenant_id' => (int)$tenant['id'],
            'email' => $tenant['email'],
            'rol' => 'tenant',
            'nombre_negocio' => $tenant['nombre_negocio'],
            'api_token' => $tenant['api_token']
        ];
        $token = buildAuthToken($userData);

        echo json_encode([
            'status' => 'success',
            'message' => 'Sesión iniciada en ' . $tenant['nombre_negocio'],
            'token' => $token,
            'user' => $userData
        ]);
        exit;
    }

    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Correo o contraseña incorrectos']);
    exit;
}

if ($action === 'me') {
    $authHeader = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (strpos($authHeader, 'Bearer ') === 0) {
        $authHeader = substr($authHeader, 7);
    }
    
    $tokenData = verifyAuthToken($authHeader);
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Sesión no válida o expirada']);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'user' => $tokenData
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Acción de autenticación no reconocida']);
exit;
