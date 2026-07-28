<?php

namespace App;

date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'America/Lima');

class Config {
    const DEFAULT_TENANT_ID = 1;

    public static function requireAdminAuth() {
        $expectedSecret = $_ENV['ADMIN_SECRET'] ?? 'demo_admin_secret';

        // Obtener headers HTTP de manera confiable
        $headers = [];
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
        }

        // Buscar X-Admin-Secret en varios formatos posibles (case-insensitive)
        $receivedSecret = null;
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'x-admin-secret') {
                $receivedSecret = $value;
                break;
            }
        }

        if (!$receivedSecret && isset($_SERVER['HTTP_X_ADMIN_SECRET'])) {
            $receivedSecret = $_SERVER['HTTP_X_ADMIN_SECRET'];
        }

        if (empty($receivedSecret) || !hash_equals((string)$expectedSecret, (string)$receivedSecret)) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'Unauthorized: Se requiere autenticación de administrador para realizar esta acción.'
            ]);
            exit;
        }
    }
}
