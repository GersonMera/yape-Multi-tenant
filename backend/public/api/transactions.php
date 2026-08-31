<?php

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

require_once __DIR__ . '/../../src/config.php';
require_once __DIR__ . '/../../src/AuthHelper.php';

use App\Config;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Secret, X-Auth-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Requerir autenticación (comercio o admin)
Config::requireAdminAuth();

try {
    $db_host = $_ENV['DB_HOST'] ?? '127.0.0.1';
    $db_name = $_ENV['DB_NAME'] ?? 'yape_saas';
    $db_user = $_ENV['DB_USER'] ?? 'root';
    $db_pass = $_ENV['DB_PASS'] ?? '';
    
    $pdo = new \PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$tenantId = getActiveTenantIdFromRequest(Config::DEFAULT_TENANT_ID);
$includeTests = isset($_GET['include_tests']) && $_GET['include_tests'] == '1';

// Filtro de Fechas
$filter = $_GET['filter'] ?? 'today';
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

$dateWhere = "DATE(fecha_hora_yape) >= CURRENT_DATE()";
$params = [':id' => $tenantId];

switch ($filter) {
    case 'specific_date':
    case 'date':
        if ($startDate) {
            $dateWhere = "DATE(fecha_hora_yape) = :start_date";
            $params[':start_date'] = $startDate;
        } else {
            $dateWhere = "DATE(fecha_hora_yape) = CURRENT_DATE()";
        }
        break;
    case 'range':
    case 'custom':
        if ($startDate && $endDate) {
            $dateWhere = "DATE(fecha_hora_yape) BETWEEN :start_date AND :end_date";
            $params[':start_date'] = $startDate;
            $params[':end_date'] = $endDate;
        } elseif ($startDate) {
            $dateWhere = "DATE(fecha_hora_yape) >= :start_date";
            $params[':start_date'] = $startDate;
        } elseif ($endDate) {
            $dateWhere = "DATE(fecha_hora_yape) <= :end_date";
            $params[':end_date'] = $endDate;
        }
        break;
    case 'yesterday':
        $dateWhere = "DATE(fecha_hora_yape) = SUBDATE(CURRENT_DATE(), 1)";
        break;
    case 'today':
    default:
        $dateWhere = "DATE(fecha_hora_yape) = CURRENT_DATE()";
        break;
}

// 1. Obtener resumen de recaudación filtrado por fecha
$summarySql = "SELECT 
    COALESCE(SUM(CASE WHEN is_test = 0 THEN monto ELSE 0 END), 0) AS total_real,
    COUNT(CASE WHEN is_test = 0 THEN 1 END) AS count_real,
    COALESCE(SUM(CASE WHEN is_test = 1 THEN monto ELSE 0 END), 0) AS total_test,
    COUNT(CASE WHEN is_test = 1 THEN 1 END) AS count_test
FROM transacciones_yape
WHERE tenant_id = :id AND $dateWhere";

$summaryStmt = $pdo->prepare($summarySql);
$summaryStmt->execute($params);
$summary = $summaryStmt->fetch(\PDO::FETCH_ASSOC);

// 2. Obtener lista de transacciones filtrada por fecha
$listSql = "SELECT id, monto, remitente_nombre AS remitente, fecha_hora_yape AS fecha_hora, is_test
            FROM transacciones_yape
            WHERE tenant_id = :id AND $dateWhere";

if (!$includeTests) {
    $listSql .= " AND is_test = 0";
}

$listSql .= " ORDER BY fecha_hora_yape DESC, id DESC LIMIT 500";

$listStmt = $pdo->prepare($listSql);
$listStmt->execute($params);
$transactions = $listStmt->fetchAll(\PDO::FETCH_ASSOC);

// Normalizar tipos booleano de is_test en PHP array
foreach ($transactions as &$tx) {
    $tx['is_test'] = (bool)$tx['is_test'];
    $tx['monto'] = (float)$tx['monto'];
}
unset($tx);

echo json_encode([
    'status' => 'success',
    'data' => [
        'summary' => [
            'total_real' => (float)($summary['total_real'] ?? 0),
            'count_real' => (int)($summary['count_real'] ?? 0),
            'total_test' => (float)($summary['total_test'] ?? 0),
            'count_test' => (int)($summary['count_test'] ?? 0),
        ],
        'transactions' => $transactions,
        'filter_applied' => $filter
    ]
]);
exit;
