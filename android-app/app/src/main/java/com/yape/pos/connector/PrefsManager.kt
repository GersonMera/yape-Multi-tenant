package com.yape.pos.connector

import android.content.Context
import android.content.SharedPreferences

/**
 * Wrapper de SharedPreferences para persistir la configuración del comercio.
 * Almacena la URL del servidor backend y el API Token del tenant.
 */
class PrefsManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("yape_pos_config", Context.MODE_PRIVATE)

    companion object {
        const val DEFAULT_SERVER_URL = "http://192.168.1.142/yape/backend/public/index.php"
        const val DEFAULT_API_TOKEN = "mi_token_secreto_123"

        private const val KEY_SERVER_URL = "server_url"
        private const val KEY_API_TOKEN = "api_token"
        private const val KEY_IS_CONFIGURED = "is_configured"
        private const val KEY_TOTAL_SENT = "total_sent"
        private const val KEY_LAST_STATUS = "last_status"
    }

    var serverUrl: String
        get() = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL
        set(value) = prefs.edit().putString(KEY_SERVER_URL, value.trim()).apply()

    var apiToken: String
        get() = prefs.getString(KEY_API_TOKEN, DEFAULT_API_TOKEN) ?: DEFAULT_API_TOKEN
        set(value) = prefs.edit().putString(KEY_API_TOKEN, value.trim()).apply()

    var isConfigured: Boolean
        get() = prefs.getBoolean(KEY_IS_CONFIGURED, true)
        set(value) = prefs.edit().putBoolean(KEY_IS_CONFIGURED, value).apply()

    var totalSent: Int
        get() = prefs.getInt(KEY_TOTAL_SENT, 0)
        set(value) = prefs.edit().putInt(KEY_TOTAL_SENT, value).apply()

    var lastStatus: String
        get() = prefs.getString(KEY_LAST_STATUS, "Sin actividad") ?: "Sin actividad"
        set(value) = prefs.edit().putString(KEY_LAST_STATUS, value).apply()

    fun saveConfig(url: String, token: String) {
        serverUrl = url
        apiToken = token
        isConfigured = url.isNotBlank() && token.isNotBlank()
    }

    fun clearConfig() {
        prefs.edit().clear().apply()
    }
}
