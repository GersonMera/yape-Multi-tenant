<?php

namespace App;

use DateTime;

class SubscriptionHelper {

    /**
     * Calcula el estado de vigencia de la suscripción de un comercio.
     * 
     * @param string|null $fechaVencimiento Formato 'YYYY-MM-DD'
     * @param string $estado 'Activo' | 'Suspendido'
     * @return array
     */
    public static function getStatus(?string $fechaVencimiento, string $estado = 'Activo'): array {
        if ($estado === 'Suspendido') {
            return [
                'is_expired' => true,
                'dias_restantes' => -999,
                'badge' => 'SUSPENDIDO',
                'texto' => 'Servicio suspendido manualmente',
                'color' => 'red'
            ];
        }

        if (empty($fechaVencimiento)) {
            return [
                'is_expired' => false,
                'dias_restantes' => 999,
                'badge' => 'SIN_LIMITE',
                'texto' => 'Sin fecha de corte asignada',
                'color' => 'green'
            ];
        }

        $hoy = new DateTime(date('Y-m-d'));
        $vence = new DateTime($fechaVencimiento);
        $diff = $hoy->diff($vence);
        $invert = $diff->invert; // 1 si hoy es mayor a vence (ya pasó), 0 si está a tiempo
        $days = (int)$diff->days;
        $diasRestantes = $invert ? -$days : $days;

        if ($diasRestantes < 0) {
            $diasVencido = abs($diasRestantes);
            $texto = $diasVencido === 1 ? "Vencido ayer" : "Vencido hace {$diasVencido} días";
            return [
                'is_expired' => true,
                'dias_restantes' => $diasRestantes,
                'badge' => 'VENCIDO',
                'texto' => $texto,
                'color' => 'red'
            ];
        }

        if ($diasRestantes === 0) {
            return [
                'is_expired' => false,
                'dias_restantes' => 0,
                'badge' => 'VENCE_HOY',
                'texto' => 'Vence hoy (último día de servicio)',
                'color' => 'amber'
            ];
        }

        if ($diasRestantes <= 3) {
            return [
                'is_expired' => false,
                'dias_restantes' => $diasRestantes,
                'badge' => 'POR_VENCER',
                'texto' => "Vence en {$diasRestantes} días",
                'color' => 'amber'
            ];
        }

        return [
            'is_expired' => false,
            'dias_restantes' => $diasRestantes,
            'badge' => 'VIGENTE',
            'texto' => "Vence en {$diasRestantes} días",
            'color' => 'green'
        ];
    }

    /**
     * Obtiene el número de WhatsApp de soporte del Super Admin
     */
    public static function getWhatsAppSupport(\PDO $pdo): string {
        try {
            $stmt = $pdo->query("SELECT whatsapp_soporte FROM superadmins ORDER BY id ASC LIMIT 1");
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!empty($row['whatsapp_soporte'])) {
                return trim($row['whatsapp_soporte']);
            }
        } catch (\Exception $e) {
            // Fallback si la tabla no tiene la columna aún
        }
        return '+51999999999';
    }
}
