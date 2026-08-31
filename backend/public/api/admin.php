<?php

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

require_once __DIR__ . '/../../src/config.php';
require_once __DIR__ . '/../../src/AuthHelper.php';
require_once __DIR__ . '/../../src/SubscriptionHelper.php';

use App\SubscriptionHelper;

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

// Acción: Listar todos los comercios / tenants con estadísticas y vigencia de suscripción
if ($action === 'list_tenants' || empty($action)) {
    $sql = "SELECT 
                id, 
                nombre_negocio, 
                email, 
                correo_recepcion_yape, 
                api_token, 
                estado, 
                dia_corte_mensual,
                fecha_vencimiento,
                ultimo_pago_at,
                created_at,
                (SELECT COUNT(*) FROM transacciones_yape WHERE tenant_id = tenants.id) AS count_yapes,
                (SELECT COALESCE(SUM(monto), 0) FROM transacciones_yape WHERE tenant_id = tenants.id AND is_test = 0) AS total_real,
                (SELECT COALESCE(SUM(monto), 0) FROM transacciones_yape WHERE tenant_id = tenants.id AND is_test = 1) AS total_test
            FROM tenants 
            ORDER BY id ASC";
    
    $stmt = $pdo->query($sql);
    $rawTenants = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    $tenants = array_map(function($t) {
        $sub = SubscriptionHelper::getStatus($t['fecha_vencimiento'], $t['estado']);
        $t['suscripcion'] = $sub;
        return $t;
    }, $rawTenants);

    $whatsappSoporte = SubscriptionHelper::getWhatsAppSupport($pdo);

    echo json_encode([
        'status' => 'success',
        'data' => $tenants,
        'whatsapp_soporte' => $whatsappSoporte
    ]);
    exit;
}

// Acción: Crear un nuevo comercio (Tenant)
if ($action === 'create_tenant') {
    $nombre = trim($input['nombre_negocio'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '123456';
    $correoYape = trim($input['correo_recepcion_yape'] ?? '');
    $diaCorte = (int)($input['dia_corte_mensual'] ?? 0);

    if (empty($nombre) || empty($email)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El nombre y correo del comercio son obligatorios']);
        exit;
    }

    if (empty($correoYape)) {
        $correoYape = "pagos_" . time() . "@mibodega.com";
    }

    // Por defecto 30 días a partir de hoy
    $fechaVencimiento = date('Y-m-d', strtotime('+30 days'));
    if ($diaCorte <= 0 || $diaCorte > 31) {
        $diaCorte = (int)date('d', strtotime($fechaVencimiento));
    }

    $tokenApi = 'token_' . bin2hex(random_bytes(12));
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO tenants (nombre_negocio, email, password_hash, correo_recepcion_yape, api_token, estado, dia_corte_mensual, fecha_vencimiento, ultimo_pago_at) 
                               VALUES (:nombre, :email, :pass, :correo, :token, 'Activo', :dia_corte, :fecha_venc, NOW())");
        $stmt->execute([
            ':nombre' => $nombre,
            ':email' => $email,
            ':pass' => $passwordHash,
            ':correo' => $correoYape,
            ':token' => $tokenApi,
            ':dia_corte' => $diaCorte,
            ':fecha_venc' => $fechaVencimiento
        ]);

        $newId = $pdo->lastInsertId();

        echo json_encode([
            'status' => 'success',
            'message' => "Comercio '$nombre' registrado exitosamente (Corte el día $diaCorte de cada mes)",
            'data' => [
                'id' => $newId,
                'nombre_negocio' => $nombre,
                'email' => $email,
                'api_token' => $tokenApi,
                'dia_corte_mensual' => $diaCorte,
                'fecha_vencimiento' => $fechaVencimiento
            ]
        ]);
        exit;
    } catch (\PDOException $e) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El correo electrónico ya está registrado o en uso']);
        exit;
    }
}

// Acción: Alternar estado manual de una tienda (Activo <-> Suspendido)
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

// Acción: RENOVAR SUSCRIPCIÓN (Modo A: +30 días desde HOY, Modo B: +1 mes desde vencimiento, o Fecha libre)
if ($action === 'renew_subscription') {
    $tenantId = (int)($input['tenant_id'] ?? 0);
    $mode = $input['mode'] ?? 'from_today'; // 'from_today' (Modo A) | 'from_due_date' (Modo B) | 'custom'
    $customDate = trim($input['custom_date'] ?? '');

    if ($tenantId <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de comercio no válido']);
        exit;
    }

    // Consultar tenant actual
    $stmt = $pdo->prepare("SELECT id, nombre_negocio, dia_corte_mensual, fecha_vencimiento FROM tenants WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $tenantId]);
    $currentTenant = $stmt->fetch(\PDO::FETCH_ASSOC);

    if (!$currentTenant) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Comercio no encontrado']);
        exit;
    }

    $nuevaFecha = '';
    $nuevoDiaCorte = $currentTenant['dia_corte_mensual'] ?: 30;

    if ($mode === 'from_today') {
        // Modo A: 30 días completos a partir de hoy (fecha de pago)
        $nuevaFecha = date('Y-m-d', strtotime('+30 days'));
        $nuevoDiaCorte = (int)date('d', strtotime($nuevaFecha));
    } elseif ($mode === 'from_due_date') {
        // Modo B: +1 mes sumado a la fecha anterior de vencimiento
        $baseDate = !empty($currentTenant['fecha_vencimiento']) ? $currentTenant['fecha_vencimiento'] : date('Y-m-d');
        $nuevaFecha = date('Y-m-d', strtotime($baseDate . ' +1 month'));
    } elseif ($mode === 'custom' && !empty($customDate)) {
        // Fecha personalizada directa
        $nuevaFecha = date('Y-m-d', strtotime($customDate));
        $nuevoDiaCorte = (int)date('d', strtotime($nuevaFecha));
    } else {
        // Fallback por defecto: Modo A
        $nuevaFecha = date('Y-m-d', strtotime('+30 days'));
        $nuevoDiaCorte = (int)date('d', strtotime($nuevaFecha));
    }

    $updateSql = "UPDATE tenants 
                  SET fecha_vencimiento = :fecha_venc, 
                      dia_corte_mensual = :dia_corte, 
                      estado = 'Activo', 
                      ultimo_pago_at = NOW() 
                  WHERE id = :id";
    $updateStmt = $pdo->prepare($updateSql);
    $updateStmt->execute([
        ':fecha_venc' => $nuevaFecha,
        ':dia_corte' => $nuevoDiaCorte,
        ':id' => $tenantId
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => "Suscripción de '{$currentTenant['nombre_negocio']}' renovada con éxito hasta el $nuevaFecha",
        'data' => [
            'tenant_id' => $tenantId,
            'fecha_vencimiento' => $nuevaFecha,
            'dia_corte_mensual' => $nuevoDiaCorte,
            'estado' => 'Activo'
        ]
    ]);
    exit;
}

// Acción: Actualizar configuración de corte o WhatsApp de soporte
if ($action === 'update_subscription_settings') {
    $tenantId = (int)($input['tenant_id'] ?? 0);
    $diaCorte = isset($input['dia_corte_mensual']) ? (int)$input['dia_corte_mensual'] : null;
    $fechaVenc = !empty($input['fecha_vencimiento']) ? date('Y-m-d', strtotime($input['fecha_vencimiento'])) : null;
    $whatsappSoporte = trim($input['whatsapp_soporte'] ?? '');

    if (!empty($whatsappSoporte)) {
        // Actualizar número de WhatsApp en superadmins
        $stmtWp = $pdo->prepare("UPDATE superadmins SET whatsapp_soporte = :wp WHERE id = :id");
        $stmtWp->execute([':wp' => $whatsappSoporte, ':id' => $userData['id']]);
    }

    if ($tenantId > 0) {
        $fields = [];
        $params = [':id' => $tenantId];

        if ($diaCorte !== null && $diaCorte >= 1 && $diaCorte <= 31) {
            $fields[] = "dia_corte_mensual = :dia_corte";
            $params[':dia_corte'] = $diaCorte;
        }

        if ($fechaVenc !== null) {
            $fields[] = "fecha_vencimiento = :fecha_venc";
            $params[':fecha_venc'] = $fechaVenc;
        }

        if (!empty($fields)) {
            $sql = "UPDATE tenants SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Configuración de suscripción actualizada correctamente'
    ]);
    exit;
}

// Acción: EDITAR DATOS DEL COMERCIO (Update)
if ($action === 'update_tenant') {
    $tenantId = (int)($input['tenant_id'] ?? 0);
    $nombre = trim($input['nombre_negocio'] ?? '');
    $email = trim($input['email'] ?? '');
    $correoYape = trim($input['correo_recepcion_yape'] ?? '');
    $password = trim($input['password'] ?? '');
    $diaCorte = isset($input['dia_corte_mensual']) ? (int)$input['dia_corte_mensual'] : null;
    $fechaVenc = isset($input['fecha_vencimiento']) ? trim($input['fecha_vencimiento']) : null;
    $estado = isset($input['estado']) ? trim($input['estado']) : null;

    if ($tenantId <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de comercio no válido']);
        exit;
    }

    // Verificar existencia
    $stmt = $pdo->prepare("SELECT id FROM tenants WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $tenantId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Comercio no encontrado']);
        exit;
    }

    $fields = [];
    $params = [':id' => $tenantId];

    if (!empty($nombre)) {
        $fields[] = "nombre_negocio = :nombre";
        $params[':nombre'] = $nombre;
    }
    if (!empty($email)) {
        $fields[] = "email = :email";
        $params[':email'] = $email;
    }
    if (!empty($correoYape)) {
        $fields[] = "correo_recepcion_yape = :correo_yape";
        $params[':correo_yape'] = $correoYape;
    }
    if (!empty($password)) {
        $fields[] = "password_hash = :pass";
        $params[':pass'] = password_hash($password, PASSWORD_DEFAULT);
    }
    if ($diaCorte !== null && $diaCorte >= 1 && $diaCorte <= 31) {
        $fields[] = "dia_corte_mensual = :dia_corte";
        $params[':dia_corte'] = $diaCorte;
    }
    if (!empty($fechaVenc)) {
        $fields[] = "fecha_vencimiento = :fecha_venc";
        $params[':fecha_venc'] = $fechaVenc;
    }
    if ($estado === 'Activo' || $estado === 'Suspendido') {
        $fields[] = "estado = :estado";
        $params[':estado'] = $estado;
    }

    if (empty($fields)) {
        echo json_encode(['status' => 'success', 'message' => 'No hubo campos que modificar']);
        exit;
    }

    try {
        $sql = "UPDATE tenants SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode([
            'status' => 'success',
            'message' => 'Comercio actualizado correctamente'
        ]);
        exit;
    } catch (\PDOException $e) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El correo o email ya está en uso por otro comercio']);
        exit;
    }
}

// Acción: ELIMINAR COMERCIO (Delete)
if ($action === 'delete_tenant') {
    $tenantId = (int)($input['tenant_id'] ?? 0);

    if ($tenantId <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de comercio no válido']);
        exit;
    }

    // Verificar existencia
    $stmt = $pdo->prepare("SELECT id, nombre_negocio FROM tenants WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $tenantId]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Comercio no encontrado']);
        exit;
    }

    try {
        // Al eliminar el tenant, por ON DELETE CASCADE se eliminan automáticamente sus transacciones
        $del = $pdo->prepare("DELETE FROM tenants WHERE id = :id");
        $del->execute([':id' => $tenantId]);

        echo json_encode([
            'status' => 'success',
            'message' => "El comercio '{$row['nombre_negocio']}' y todo su historial fueron eliminados correctamente"
        ]);
        exit;
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al eliminar el comercio de la base de datos']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Acción de administración no reconocida']);
exit;
