<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$text = trim($_GET['text'] ?? '');
if (empty($text)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Texto requerido']);
    exit;
}

// Limitar longitud para evitar abusos
if (strlen($text) > 250) {
    $text = substr($text, 0, 250);
}

// Voces permitidas (Prioridad Perú)
$validVoices = [
    'camila' => 'es-PE-CamilaNeural', // Femenina Perú (Cálida, Amigable)
    'alex'   => 'es-PE-AlexNeural',   // Masculina Perú (Clara, Ejecutiva)
    'dalia'  => 'es-MX-DaliaNeural',  // Femenina México (Muy Suave)
    'jorge'  => 'es-MX-JorgeNeural',  // Masculina México
];

$voiceParam = strtolower($_GET['voice'] ?? 'camila');
$voice = $validVoices[$voiceParam] ?? 'es-PE-CamilaNeural';

$cacheDir = __DIR__ . '/../../cache_tts';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0777, true);
}

$hash = md5($text . '_' . $voice);
$cachedFile = $cacheDir . '/' . $hash . '.mp3';

if (!file_exists($cachedFile) || filesize($cachedFile) < 100) {
    $cmd = sprintf(
        'python -m edge_tts --voice %s --text %s --write-media %s',
        escapeshellarg($voice),
        escapeshellarg($text),
        escapeshellarg($cachedFile)
    );
    @exec($cmd, $output, $returnCode);
    
    if ($returnCode !== 0 || !file_exists($cachedFile) || filesize($cachedFile) < 100) {
        // Si por alguna razón falla edge-tts, intentar con Google TTS libre
        $gUrl = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es-ES&q=" . urlencode($text);
        $ch = curl_init($gUrl);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 4);
        $gAudio = curl_exec($ch);
        $gCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($gCode === 200 && strlen($gAudio) > 500) {
            file_put_contents($cachedFile, $gAudio);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'No se pudo sintetizar audio']);
            exit;
        }
    }
}

if (file_exists($cachedFile)) {
    header('Content-Type: audio/mpeg');
    header('Content-Length: ' . filesize($cachedFile));
    header('Cache-Control: public, max-age=86400');
    readfile($cachedFile);
    exit;
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error de archivo de audio']);
    exit;
}
