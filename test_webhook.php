<?php
// Script temporal para simular un Yape de prueba desde MacroDroid

$webhookUrl = 'http://localhost/yape/backend/public/index.php'; // Ajusta esto a tu URL real donde esté el WebhookController

// El payload JSON simulando un Yape (Monto aleatorio para no ser detectado como duplicado)
$data = [
    'monto' => rand(10, 50) . '.50',
    'remitente' => 'Maria Lopez',
    'fecha_hora' => date('Y-m-d H:i:s')
];

$payload = json_encode($data);

// Token simulado (El que pondrías en la tabla 'tenants')
$token = 'mi_token_secreto_123';

$ch = curl_init($webhookUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Respuesta del Servidor (HTTP $httpCode): \n";
echo $response;
