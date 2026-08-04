package com.yape.pos.connector

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import java.util.concurrent.Executors

/**
 * Servicio que intercepta las notificaciones push de la app Yape (BCP).
 * Filtra solo las notificaciones del paquete oficial de Yape, extrae el monto
 * y remitente usando regex, y las reenvía al backend Yape POS SaaS via HTTP POST.
 */
class YapeNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "YapeListener"

        // Paquete oficial de la app Yape (BCP Perú)
        private const val YAPE_PACKAGE = "com.bcp.innovacxion.yapeapp"

        // Regex para extraer el monto: busca "S/" o "S/ " seguido de un número
        private val MONTO_REGEX = Regex("""S/\s*(\d+[.,]?\d*)""")

        // Regex para extraer el remitente: "Pago NOMBRE te envió" o "NOMBRE te ha enviado"
        private val REMITENTE_REGEX = Regex(
            """(?:Pago\s+(.+?)\s+te\s+envió)|(?:(.+?)\s+te\s+ha\s+enviado)""",
            RegexOption.IGNORE_CASE
        )
    }

    private val executor = Executors.newSingleThreadExecutor()
    private val apiClient = ApiClient()

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        sbn ?: return

        // Solo procesar notificaciones de la app Yape
        if (sbn.packageName != YAPE_PACKAGE) return

        val extras = sbn.notification?.extras ?: return
        val title = extras.getCharSequence("android.title")?.toString() ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val bigText = extras.getCharSequence("android.bigText")?.toString() ?: ""

        // Usar el texto más completo disponible
        val fullText = if (bigText.isNotBlank()) "$title $bigText" else "$title $text"

        Log.d(TAG, "Notificación Yape detectada: $fullText")

        // Verificar que contiene un monto (filtrar notificaciones irrelevantes de Yape)
        val montoMatch = MONTO_REGEX.find(fullText)
        if (montoMatch == null) {
            Log.d(TAG, "Notificación sin monto, ignorada: $fullText")
            return
        }

        val monto = montoMatch.groupValues[1].replace(",", ".")
        
        // Extraer remitente
        val remitenteMatch = REMITENTE_REGEX.find(fullText)
        val remitente = remitenteMatch?.let {
            it.groupValues[1].ifBlank { it.groupValues[2] }
        }?.trim() ?: fullText // Fallback: enviar el texto completo para que el backend parsee

        Log.d(TAG, "Monto extraído: S/ $monto | Remitente: $remitente")

        // Leer configuración
        val prefs = PrefsManager(applicationContext)
        if (!prefs.isConfigured) {
            Log.w(TAG, "App no configurada, notificación ignorada")
            return
        }

        // Enviar al backend en hilo separado
        executor.execute {
            val (success, message) = apiClient.sendYapePayment(
                serverUrl = prefs.serverUrl,
                apiToken = prefs.apiToken,
                monto = monto,
                remitente = remitente
            )

            if (success) {
                prefs.totalSent = prefs.totalSent + 1
                prefs.lastStatus = "Enviado: S/ $monto — $remitente"
                Log.i(TAG, "Pago enviado al backend: S/ $monto de $remitente")
            } else {
                prefs.lastStatus = "Error: $message"
                Log.e(TAG, "Error al enviar: $message")
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // No necesitamos hacer nada cuando se elimina una notificación
    }
}
