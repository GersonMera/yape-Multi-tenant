package com.yape.pos.connector

import android.content.ComponentName
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.text.TextUtils
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {

    private lateinit var prefs: PrefsManager
    private val handler = Handler(Looper.getMainLooper())
    private val apiClient = ApiClient()

    // UI — Configuración
    private lateinit var configSection: LinearLayout
    private lateinit var inputUrl: EditText
    private lateinit var inputToken: EditText
    private lateinit var btnSave: Button

    // UI — Estado
    private lateinit var statusSection: LinearLayout
    private lateinit var txtStatus: TextView
    private lateinit var txtPermission: TextView
    private lateinit var txtServerUrl: TextView
    private lateinit var txtTotalSent: TextView
    private lateinit var txtLastStatus: TextView
    private lateinit var btnTest: Button
    private lateinit var btnPermission: Button
    private lateinit var btnReset: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        prefs = PrefsManager(this)

        // Vincular vistas — Configuración
        configSection = findViewById(R.id.config_section)
        inputUrl = findViewById(R.id.input_url)
        inputToken = findViewById(R.id.input_token)
        btnSave = findViewById(R.id.btn_save)

        // Vincular vistas — Estado
        statusSection = findViewById(R.id.status_section)
        txtStatus = findViewById(R.id.txt_status)
        txtPermission = findViewById(R.id.txt_permission)
        txtServerUrl = findViewById(R.id.txt_server_url)
        txtTotalSent = findViewById(R.id.txt_total_sent)
        txtLastStatus = findViewById(R.id.txt_last_status)
        btnTest = findViewById(R.id.btn_test)
        btnPermission = findViewById(R.id.btn_permission)
        btnReset = findViewById(R.id.btn_reset)

        // Guardar configuración
        btnSave.setOnClickListener {
            val url = inputUrl.text.toString().trim()
            val token = inputToken.text.toString().trim()

            if (url.isBlank() || token.isBlank()) {
                Toast.makeText(this, "Completa ambos campos", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            prefs.saveConfig(url, token)
            Toast.makeText(this, "Configuración guardada", Toast.LENGTH_SHORT).show()
            updateUI()
            startKeepAliveService()
        }

        // Abrir ajustes de permisos de notificación
        btnPermission.setOnClickListener {
            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        }

        // Enviar prueba manual
        btnTest.setOnClickListener {
            btnTest.isEnabled = false
            btnTest.text = "Enviando..."

            Executors.newSingleThreadExecutor().execute {
                val (success, message) = apiClient.sendYapePayment(
                    serverUrl = prefs.serverUrl,
                    apiToken = prefs.apiToken,
                    monto = "1.00",
                    remitente = "Prueba desde App Android"
                )

                handler.post {
                    btnTest.isEnabled = true
                    btnTest.text = "Enviar prueba manual"

                    if (success) {
                        prefs.totalSent = prefs.totalSent + 1
                        prefs.lastStatus = "Prueba: S/ 1.00 — OK"
                        Toast.makeText(this, "Prueba enviada correctamente", Toast.LENGTH_SHORT).show()
                    } else {
                        prefs.lastStatus = "Error: $message"
                        Toast.makeText(this, "Error: $message", Toast.LENGTH_LONG).show()
                    }
                    updateUI()
                }
            }
        }

        // Cambiar configuración
        btnReset.setOnClickListener {
            prefs.isConfigured = false
            updateUI()
        }

        updateUI()
    }

    override fun onResume() {
        super.onResume()
        updateUI()
    }

    private fun updateUI() {
        val configured = prefs.isConfigured
        val hasPermission = isNotificationServiceEnabled()

        // Mostrar/ocultar secciones
        configSection.visibility = if (configured) View.GONE else View.VISIBLE
        statusSection.visibility = if (configured) View.VISIBLE else View.GONE

        if (!configured) {
            // Pre-llenar si hay datos previos
            if (prefs.serverUrl.isNotBlank()) inputUrl.setText(prefs.serverUrl)
            if (prefs.apiToken.isNotBlank()) inputToken.setText(prefs.apiToken)
            return
        }

        // Estado de conexión
        if (hasPermission) {
            txtStatus.text = "Escuchando notificaciones de Yape"
            txtStatus.setTextColor(getColor(R.color.yape_green))
            txtPermission.text = "Permiso de notificaciones: ACTIVADO"
            txtPermission.setTextColor(getColor(R.color.yape_green))
            btnPermission.visibility = View.GONE
        } else {
            txtStatus.text = "Permiso requerido para funcionar"
            txtStatus.setTextColor(getColor(R.color.yape_red))
            txtPermission.text = "Permiso de notificaciones: DESACTIVADO"
            txtPermission.setTextColor(getColor(R.color.yape_red))
            btnPermission.visibility = View.VISIBLE
        }

        txtServerUrl.text = prefs.serverUrl
        txtTotalSent.text = "${prefs.totalSent} pagos enviados"
        txtLastStatus.text = prefs.lastStatus

        // Iniciar servicio si está configurado
        if (configured && hasPermission) {
            startKeepAliveService()
        }
    }

    private fun isNotificationServiceEnabled(): Boolean {
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        if (!TextUtils.isEmpty(flat)) {
            val names = flat.split(":")
            val myComponent = ComponentName(this, YapeNotificationListener::class.java).flattenToString()
            return names.any { it == myComponent }
        }
        return false
    }

    private fun startKeepAliveService() {
        val intent = Intent(this, YapeKeepAliveService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }
}
