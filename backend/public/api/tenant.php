<?php

// Requerir el autoloader de Composer y dotEnv
require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

require_once __DIR__ . '/../../src/config.php';

use App\Config;
use PDO;
use PDOException;
use Pusher\Pusher;

// Headers CORS para API REST
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Secret");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// TODOS los métodos (GET y POST) en este endpoint requieren autenticación de administrador
Config::requireAdminAuth();

// Inicializar PDO
try {
    $db_host = $_ENV['DB_HOST'] ?? '127.0.0.1';
    $db_name = $_ENV['DB_NAME'] ?? 'yape_saas';
    $db_user = $_ENV['DB_USER'] ?? 'root';
    $db_pass = $_ENV['DB_PASS'] ?? '';
    
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$tenantId = Config::DEFAULT_TENANT_ID;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Retornar datos del tenant seguro (sin query param manipulable)
    $stmt = $pdo->prepare("SELECT id, nombre_negocio, email, correo_recepcion_yape, api_token, estado FROM tenants WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $tenantId]);
    $tenant = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tenant) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Tenant no encontrado']);
        exit;
    }

    echo json_encode(['status' => 'success', 'data' => $tenant]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $action = $data['action'] ?? '';

    // ACCIÓN 1: ACTUALIZAR NOMBRE DEL NEGOCIO
    if ($action === 'update') {
        $nombreNegocio = isset($data['nombre_negocio']) ? trim(substr(strip_tags((string)$data['nombre_negocio']), 0, 100)) : '';
        
        if (empty($nombreNegocio)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'El nombre del negocio no puede estar vacío']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE tenants SET nombre_negocio = :nombre WHERE id = :id");
        $stmt->execute([
            ':nombre' => $nombreNegocio,
            ':id' => $tenantId
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Nombre del negocio actualizado correctamente',
            'nombre_negocio' => $nombreNegocio
        ]);
        exit;
    }

    // ACCIÓN 2: SIMULAR YAPE DE PRUEBA (BLINDADO CON is_test=1)
    if ($action === 'simulate') {
        $monto = 15.50;
        $remitente = 'Cliente Simulado ⭐';
        $fechaHora = date('Y-m-d H:i:s');

        // 1. Guardar en Base de Datos con is_test = 1
        $stmt = $pdo->prepare("INSERT INTO transacciones_yape (tenant_id, monto, remitente_nombre, fecha_hora_yape, is_test) VALUES (:tenant_id, :monto, :remitente, :fecha_hora, 1)");
        $stmt->execute([
            ':tenant_id' => $tenantId,
            ':monto' => $monto,
            ':remitente' => $remitente,
            ':fecha_hora' => $fechaHora
        ]);

        // 2. Emitir por WebSockets con 'is_test' => true
        $options = [
            'cluster' => $_ENV['PUSHER_CLUSTER'] ?? 'us2',
            'useTLS' => true
        ];
        $pusher = new Pusher(
            $_ENV['PUSHER_KEY'],
            $_ENV['PUSHER_SECRET'],
            $_ENV['PUSHER_APP_ID'],
            $options
        );

        $payload = [
            'monto' => $monto,
            'remitente' => $remitente,
            'fecha_hora' => $fechaHora,
            'is_test' => true
        ];

        $pusher->trigger("tenant-" . $tenantId, "NuevoYape", $payload);

        echo json_encode([
            'status' => 'success',
            'message' => 'Pago simulado correctamente con bandera is_test=1',
            'data' => $payload
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Acción no reconocida']);
    exit;
}
