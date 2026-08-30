package com.yape.pos.connector

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

/**
 * Cliente HTTP que envía los pagos interceptados al backend Yape POS SaaS.
 * Usa OkHttp con timeout de 15 segundos y formato JSON idéntico al de MacroDroid.
 */
class ApiClient {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    /**
     * Envía un pago Yape al backend.
     * @return Pair<Boolean, String> — (éxito, mensaje)
     */
    fun sendYapePayment(
        serverUrl: String,
        apiToken: String,
        monto: String,
        remitente: String,
        isTest: Boolean = false
    ): Pair<Boolean, String> {
        return try {
            val fechaHora = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                .format(Date())

            val json = JSONObject().apply {
                put("monto", monto)
                put("remitente", remitente)
                put("fecha_hora", fechaHora)
                put("is_test", isTest)
            }

            val body = json.toString().toRequestBody(JSON_MEDIA)

            val request = Request.Builder()
                .url(serverUrl)
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer $apiToken")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            val code = response.code

            if (response.isSuccessful) {
                Pair(true, "HTTP $code — Enviado correctamente")
            } else {
                Pair(false, "HTTP $code — $responseBody")
            }
        } catch (e: IOException) {
            Pair(false, "Error de red: ${e.localizedMessage}")
        } catch (e: Exception) {
            Pair(false, "Error: ${e.localizedMessage}")
        }
    }
}
