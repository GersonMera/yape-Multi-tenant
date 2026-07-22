<?php

// Requerir el autoloader de Composer (para Pusher y Dotenv)
require_once __DIR__ . '/../vendor/autoload.php';

// Cargar variables de entorno (.env)
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Requerir el Controlador
require_once __DIR__ . '/../src/Controllers/WebhookController.php';

use App\Controllers\WebhookController;

// Headers para API REST
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Si es una petición OPTIONS de preflight (CORS), responder 200 OK y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Para este MVP, este index.php actuará directamente como el Webhook
// Instanciamos el controlador y procesamos la petición
$controller = new WebhookController();
$controller->handleYapeWebhook();
