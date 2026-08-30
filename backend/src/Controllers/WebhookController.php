<?php

namespace App\Controllers;

use PDO;
use PDOException;
use Pusher\Pusher;

class WebhookController {
    
    private $pdo;

    private $pusher;

    public function __construct() {
        // Obtenemos credenciales desde el .env
        $db_host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $db_name = $_ENV['DB_NAME'] ?? 'yape_saas';
        $db_user = $_ENV['DB_USER'] ?? 'root';
        $db_pass = $_ENV['DB_PASS'] ?? '';

        // Inicializamos Base de Datos
        try {
            $this->pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            $this->sendResponse(['status' => 'error', 'message' => 'Database connection failed'], 500);
        }

        // Inicializamos Pusher usando credenciales del .env
        $options = array(
            'cluster' => $_ENV['PUSHER_CLUSTER'] ?? 'us2',
            'useTLS' => true
        );
        $this->pusher = new Pusher(
            $_ENV['PUSHER_KEY'],
            $_ENV['PUSHER_SECRET'],
            $_ENV['PUSHER_APP_ID'],
            $options
        );
    }

    public function handleYapeWebhook() {
        // 1. Validar Método HTTP
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendResponse(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
        }

        // 2. Extraer el Token del Header Authorization
        $authHeader = '';
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        }
        if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }
        
        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $this->sendResponse(['status' => 'error', 'message' => 'Unauthorized: Missing or invalid token'], 401);
        }

        $api_token = $matches[1];

        // 3. Validar el Token y obtener el Tenant ID
        $stmt = $this->pdo->prepare("SELECT id, estado FROM tenants WHERE api_token = :token LIMIT 1");
        $stmt->execute([':token' => $api_token]);
        $tenant = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tenant) {
            $this->sendResponse(['status' => 'error', 'message' => 'Unauthorized: Invalid token'], 401);
        }

        if ($tenant['estado'] !== 'Activo') {
            $this->sendResponse(['status' => 'error', 'message' => 'Forbidden: Tenant subscription is suspended'], 403);
        }

        $tenant_id = $tenant['id'];

        // 2. Obtener el cuerpo de la petición
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);
        if (!$data) {
            $data = $_POST;
        }

        // GUARDAR UN REGISTRO PARA DEPURAR (DEBUG)
        file_put_contents(__DIR__ . '/../../../../webhook_debug.txt', date('Y-m-d H:i:s') . " - Raw: " . $rawInput . "\nParsed: " . print_r($data, true) . "\n", FILE_APPEND);

        if (empty($data)) {
            $this->sendResponse(['status' => 'error', 'message' => 'Bad Request: Invalid JSON payload'], 400);
        }

        // 5. Limpieza de datos (Por si MacroDroid envía texto extra)
        // Extraer el monto exacto
        $monto = $this->cleanMonto(isset($data['monto']) ? $data['monto'] : '');
        
        // Extraer el nombre del remitente del texto completo ("Confirmación de Pago Juan Perez te envió...")
        $rawText = isset($data['remitente']) ? trim(strip_tags($data['remitente'])) : '';
        $remitente = 'Desconocido';
        if (preg_match('/Pago\s+(.+?)\s+te envió/i', $rawText, $matches)) {
            $remitente = trim($matches[1]);
        } else {
            $remitente = $rawText; // Fallback si cambia el formato
        }
        $fecha_hora = isset($data['fecha_hora']) && !empty($data['fecha_hora']) 
                        ? date('Y-m-d H:i:s', strtotime($data['fecha_hora'])) 
                        : date('Y-m-d H:i:s');

        if ($monto <= 0) {
            $this->sendResponse(['status' => 'error', 'message' => 'Unprocessable Entity: Monto inválido'], 422);
        }

        if ($monto <= 0) {
            $this->sendResponse(['status' => 'error', 'message' => 'Unprocessable Entity: Invalid amount'], 422);
        }

        $is_test = !empty($data['is_test']) ? 1 : 0;

        // 6. Insertar en la Base de Datos
        try {
            // Usamos INSERT IGNORE para aprovechar el índice UNIQUE. 
            // Si MacroDroid o la app mandan 2 veces el mismo JSON por mala red, el 2do intento será ignorado.
            $sql = "INSERT IGNORE INTO transacciones_yape 
                    (tenant_id, monto, remitente_nombre, fecha_hora_yape, is_test) 
                    VALUES (:tenant_id, :monto, :remitente, :fecha_hora, :is_test)";
            
            $insertStmt = $this->pdo->prepare($sql);
            $insertStmt->execute([
                ':tenant_id'  => $tenant_id,
                ':monto'      => $monto,
                ':remitente'  => $remitente,
                ':fecha_hora' => $fecha_hora,
                ':is_test'    => $is_test
            ]);

            if ($insertStmt->rowCount() > 0) {
                // Disparar evento a Pusher (Canal privado por Tenant)
                $canal = "tenant-" . $tenant_id;
                $evento = "NuevoYape";
                $payload = [
                    'monto' => $monto,
                    'remitente' => $remitente,
                    'fecha_hora' => $fecha_hora,
                    'is_test' => (bool)$is_test
                ];
                
                $this->pusher->trigger($canal, $evento, $payload);
                
                $this->sendResponse(['status' => 'success', 'message' => 'Transacción registrada y notificada'], 200);
            } else {
                // Retornamos 200 igual para que MacroDroid no intente re-enviar el payload
                $this->sendResponse(['status' => 'success', 'message' => 'Transacción ignorada (Duplicado)'], 200);
            }

        } catch (PDOException $e) {
            error_log("Webhook DB Error: " . $e->getMessage());
            $this->sendResponse(['status' => 'error', 'message' => 'Internal Server Error'], 500);
        }
    }

    /**
     * Extrae solo el valor numérico (con decimales) de cualquier string
     * Ej: "S/ 15.50" -> 15.50 | "15,50" -> 15.50
     */
    private function cleanMonto($montoRaw) {
        $montoString = str_replace(',', '.', (string)$montoRaw);
        
        // Buscar específicamente el número después de "S/" o "Soles"
        if (preg_match('/(?:S\/\s*|Soles\s*)([0-9]+(?:\.[0-9]+)?)/i', $montoString, $matches)) {
            return (float)$matches[1];
        }
        
        // Fallback genérico: el primer número con decimales
        if (preg_match('/(\d+\.\d+)/', $montoString, $matches)) {
            return (float)$matches[1];
        }
        
        // Último intento: el primer entero (cuidado con códigos de seguridad)
        if (preg_match('/(\d+)/', $montoString, $matches)) {
            return (float)$matches[1];
        }

        return 0;
    }

    private function sendResponse($data, $statusCode) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
