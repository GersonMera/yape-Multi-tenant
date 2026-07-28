<?php

function buildAuthToken($payload) {
    $secret = $_ENV['ADMIN_SECRET'] ?? 'default_jwt_secret_key_123';
    $json = json_encode($payload);
    $base64 = base64_encode($json);
    $signature = hash_hmac('sha256', $base64, $secret);
    return $base64 . '.' . $signature;
}

function verifyAuthToken($token) {
    $secret = $_ENV['ADMIN_SECRET'] ?? 'default_jwt_secret_key_123';
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;
    list($base64, $signature) = $parts;
    $expectedSig = hash_hmac('sha256', $base64, $secret);
    if (!hash_equals($expectedSig, $signature)) return null;
    $decoded = json_decode(base64_decode($base64), true);
    return $decoded;
}

function getActiveTenantIdFromRequest($defaultId = 1) {
    $authHeader = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (strpos($authHeader, 'Bearer ') === 0) {
        $authHeader = substr($authHeader, 7);
    }
    $user = verifyAuthToken($authHeader);
    if ($user) {
        if (($user['rol'] ?? '') === 'admin') {
            return (int)($_GET['tenant_id'] ?? $defaultId);
        }
        if (($user['rol'] ?? '') === 'tenant' && !empty($user['tenant_id'])) {
            return (int)$user['tenant_id'];
        }
    }
    return (int)($_GET['tenant_id'] ?? $defaultId);
}

