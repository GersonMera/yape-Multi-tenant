# Yape POS SaaS — Plataforma Multi-Tenant de Validación en Vivo & Control Administrativo

**Yape POS SaaS** es una plataforma empresarial multi-comercio diseñada para interceptar y registrar notificaciones de pago de Yape en tiempo real, validando cobros en una interfaz web de mostrador (cajero) de alta velocidad con alertas acústicas y visuales, acompañada de un **Panel de Super Administrador (SaaS Owner)** para la gestión, auditoría y control de suscripciones mensuales de todos los comercios afiliados, y una **App Android Nativa ("Yape POS Connector")** que actúa como puente silencioso automatizado sin depender de herramientas de terceros como MacroDroid.

---

## Características Principales

### 1. Arquitectura Multi-Tenant & Seguridad de Sesión
- **Aislamiento por Tenant ID:** Cada comercio posee su propia cuenta, token de API secreto, webhooks y flujo de transacciones aislado.
- **Autenticación HTTP Bearer & Sesiones (`AuthHelper.php`):** Control de acceso por roles (`admin` para el propietario SaaS y `comercio` para el cliente de bodega/tienda).
- **Aislamiento de Simulaciones (`is_test`):** Permite simular cobros de prueba sin contaminar la contabilidad del negocio ni los reportes de recaudo real del día. Las funciones de simulación son exclusivas del rol Super Admin.

### 2. Sistema de Suscripción SaaS & Bloqueo Automático por Día de Corte
- **Día de Corte Mensual Personalizado (1 al 31):** El Super Admin define qué día de cada mes vence el servicio de cada tienda.
- **Bloqueo Automático del Cajero (`SubscriptionBlockedScreen.jsx`):** Si llega la fecha límite y el comercio no ha pagado, el sistema bloquea automáticamente la interfaz del cajero y muestra una pantalla ejecutiva: *"Suscripción Vencida — Servicio Temporalmente Pausado"*.
- **Botón Directo de WhatsApp con Mensaje Pre-armado:** El cliente bloqueado puede presionar un solo botón que abre WhatsApp directamente con el Super Admin solicitando su renovación de inmediato.
- **Renovación Inteligente en 1 Clic (Modo A - Justo para pagos tardíos):**
  - **Modo A (30 días desde HOY):** Si el cliente estuvo bloqueado y paga fuera de fecha, el sistema le suma 30 días completos a partir de hoy (fecha de pago) y actualiza su nuevo día de corte al día actual para que reciba su mes completo sin perder días.
  - **Modo B (Mantener día fijo):** Suma +1 mes calendario al corte anterior para conservar su misma fecha fija de siempre.
  - **Fecha manual personalizada:** Permite asignar fechas libres o planes trimestrales/anuales.
- **Auditoría Transparente:** El Super Admin puede ingresar en Modo Auditoría a inspeccionar la caja de cualquier cliente incluso si está bloqueado por falta de pago, con un banner informativo visible.

### 3. Panel del Super Administrador (SaaS Owner)
- **Directorio y Alta de Comercios:** Crea nuevas cuentas, asigna correos electrónicos para recepción, define su día de corte mensual y administra el estado de los clientes (`Activo` o `Suspendido`).
- **Modo Auditoría en Vivo:** El Super Admin puede inspeccionar en tiempo real la pantalla del cajero y los cobros entrantes de cualquier negocio afiliado sin necesidad de pedir sus credenciales.
- **KPIs Consolidados del SaaS:** Monitoreo de comercios activos, suscripciones vencidas/bloqueadas, volumen total procesado y estado del sistema.
- **Gestión de WhatsApp de Contacto:** Permite configurar y actualizar en tiempo real el número de WhatsApp oficial al que los clientes escribirán para renovar.

### 4. Terminal POS de Cajero (Comercio / Tienda)
- **Recepción en Vivo con WebSockets (Pusher):** Alertas de sonido instantáneas (`yape_alert.mp3`) sin necesidad de refrescar la página.
- **Alerta por Voz Inteligente (TTS):** Síntesis de voz nativa del navegador (*Web Speech API*) que pronuncia en voz alta el monto, nombre del cliente y hora al recibir cada pago. Incluye frase introductoria de apertura de canal de audio (`". . Nuevo pago Yape. ."`) para evitar recortes en Windows/Chrome, invocación instantánea sin demoras (0ms) y formato de hora en 12h.
- **Filtros de Fecha & Exportación Contable:** Selector de periodos (Hoy, Ayer, Últimos 7 Días, Últimos 30 Días) con descarga inmediata en archivo **Excel / CSV**.
- **Ticket de Cierre de Caja Digital:** Módulo con facturación limpia y formato automático listo para copiar al portapapeles y enviar por **WhatsApp** o imprimir en PDF.
- **Carrusel Horizontal de Tarjetas Yape en Tiempo Real:** En lugar de una lista vertical tradicional, el POS muestra las transacciones entrantes en un carrusel interactivo horizontal de derecha a izquierda con flechas de navegación (`< / >`) y desplazamiento automático animado al primer lugar cuando ingresa un nuevo cobro con animación de entrada (`animate-yape-carousel-enter`).

### 5. App Nativa Android ("Yape POS Connector")
- **Reemplazo total de MacroDroid:** App ligera en Kotlin (~6 MB) que intercepta automáticamente notificaciones push de la app oficial de Yape (`com.bcp.innovacxion.yapeapp`).
- **Servicio en Segundo Plano Persistente:** Utiliza `NotificationListenerService` y un `ForegroundService` para mantenerse activa 24/7 sin ser cerrada por el sistema operativo.
- **Extracción Inteligente por Regex:** Parsea automáticamente el monto (`S/ XX.XX`) y el remitente de la notificación para enviarlos por HTTP POST al webhook del backend.
- **Diferenciación de Pruebas:** El botón "Enviar prueba manual" envía `is_test: true` registrándose en simulaciones, mientras que los Yapes reales de clientes se acreditan como recaudación real.
- **Compilación en 1 solo comando:** Integrada al flujo de trabajo del proyecto mediante `npm run build:apk` o `.\build-apk.bat`.

### 6. Diseño Minimalista Empresarial (Blanco Corporativo & Morado Institucional)
- **Layout Enterprise con Sidebar:** Arquitectura ejecutiva de pantalla completa con **Barra Lateral Izquierda (SIDEBAR)** en **Blanco Puro Ejecutivo (`#FFFFFF`)** con bordes finos gris pizarra (`#E2E8F0`), ideal para operación corporativa continua en PC, tablet o móvil.
- **Paleta Blanco Corporativo Minimalista:** Fondo blanco perla / slate claro (`#F8FAFC`), tarjetas y menú en blanco puro (`#FFFFFF`) con bordes finos (`#E2E8F0`), acentos morados oficiales de Yape (`#7C3AED`) en botones activos y montos en verde contable (`#059669`). Cero negro y cero luces de neón.
- **Tipografía Oficial Google Fonts:** Incorpora **Plus Jakarta Sans** para máxima claridad ejecutiva y **JetBrains Mono** para alineación numérica contable sin sobrecargar la vista.
- **Iconografía SVG Profesional:** Sistema completo de iconos vectoriales SVG corporativos (estilo Bloomberg/Stripe) en lugar de emojis.
- **Modales en Blanco Corporativo:** Los modales de Configuración API, Cierre de Caja, Renovación de Suscripción e inicio de sesión utilizan el mismo estilo Blanco Puro (`#FFFFFF`) con bordes finos y textos oscuros legibles.

---

## Stack Tecnológico

- **Frontend:** React 18, Vite, Tailwind CSS v4, Context API (`AuthContext`), y WebSockets Client (`usePusher`).
- **App Android:** Kotlin 1.9, Android SDK 34, OkHttp 4.12, Gson 2.11, Material Design 3, Gradle 8.7.
- **Backend REST API:** PHP 8.2 nativo con arquitectura orientada a servicios (`auth.php`, `admin.php`, `tenant.php`, `transactions.php`, `SubscriptionHelper.php`).
- **Base de Datos:** MySQL / MariaDB (Esquema Multi-Tenant con claves foráneas, índices de unicidad por transacción, control de suscripciones y flag `is_test`).
- **Realtime Engine:** Pusher Channels / WebSockets.

---

## Estructura del Repositorio

```text
/
├── android-app/                   # App nativa Android (Yape POS Connector)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/yape/pos/connector/
│   │   │   │   ├── ApiClient.kt             # Envío HTTP POST con OkHttp (soporta is_test)
│   │   │   │   ├── MainActivity.kt          # UI de estado y prueba manual
│   │   │   │   ├── PrefsManager.kt          # Persistencia y configuración por defecto
│   │   │   │   ├── YapeKeepAliveService.kt  # Foreground service anti-cierre
│   │   │   │   └── YapeNotificationListener.kt # Interceptor de notificaciones Yape
│   │   │   └── res/                         # Layouts, iconos y temas Material Design
│   │   └── build.gradle.kts
│   ├── gradle/wrapper/                      # Gradle 8.7 Wrapper
│   ├── build.gradle.kts
│   ├── gradle.properties                    # Enlace directo a JDK 21
│   └── gradlew.bat
│
├── backend/                       # API REST y Webhooks PHP
│   ├── public/
│   │   ├── api/
│   │   │   ├── admin.php          # REST API Super Admin (Alta, auditoría, KPIs, renovaciones)
│   │   │   ├── auth.php           # Autenticación y control de sesiones
│   │   │   ├── tenant.php         # Gestión de credenciales, corte y WhatsApp
│   │   │   └── transactions.php   # Historial filtrable (Cobros Reales vs. Pruebas)
│   │   └── index.php              # Webhook principal receptor de notificaciones Yape
│   ├── src/
│   │   ├── AuthHelper.php         # Middleware de validación de tokens y sesiones
│   │   ├── SubscriptionHelper.php # Motor de cálculo de vigencia, corte y días restantes
│   │   ├── config.php             # Configuración centralizada MySQL y Pusher
│   │   └── Controllers/           # Controladores del Webhook
│   ├── setup_db.sql               # Inicialización de BD y tabla de Tenants
│   ├── migrate_is_test.sql        # Migración de columna is_test para simulaciones
│   ├── migrate_suscripciones.sql  # Migración para día de corte, fecha vencimiento y WhatsApp
│   └── seed_auth.php              # Sembrado de cuentas demo (Admin, Bodega, Farmacia)
│
├── frontend/                      # Aplicación Web React / Vite
│   ├── index.html                 # Importación de tipografías Google Fonts
│   ├── src/
│   │   ├── components/
│   │   │   ├── SuperAdminDashboard.jsx       # Panel completo con gestión de suscripciones y renovación
│   │   │   ├── SubscriptionBlockedScreen.jsx # Pantalla de bloqueo de cajero con botón WhatsApp
│   │   │   ├── LoginPage.jsx                 # Login corporativo (cuentas demo solo en modo demo)
│   │   │   ├── CashierSummary.jsx            # KPIs de mostrador y contador contable
│   │   │   ├── CashierCloseModal.jsx         # Recibo digital para WhatsApp / Imprimir
│   │   │   ├── TenantModal.jsx               # Modal corporativo para copiar token y webhook
│   │   │   ├── YapeCard.jsx                  # Tarjeta individual de pago en formato carrusel
│   │   │   └── Icons.jsx                     # Sistema de iconos SVG corporativos profesionales
│   │   ├── context/
│   │   │   └── AuthContext.jsx               # Manejo global del usuario, JWT/Token y Auditoría
│   │   ├── hooks/
│   │   │   └── usePusher.js                  # Suscripción al canal privado WebSocket del Tenant
│   │   ├── App.jsx                           # Terminal POS principal con bloqueo automático
│   │   └── index.css                         # Sistema de diseño Blanco Corporativo Minimalista
│
├── build-apk.bat                  # Script Windows para compilar el APK con un doble clic
├── package.json                   # Scripts npm unificados (dev, build, build:apk)
└── README.md
```

---

## Guía de Instalación y Puesta en Marcha

### 1. Variables de Entorno y Configuración Base

1. Copia y edita `backend/src/config.php` o crea tu archivo `backend/.env` con tus credenciales de MySQL y Pusher.
2. Crea tu archivo `frontend/.env`:
   ```ini
   VITE_PUSHER_APP_KEY=tu_pusher_key
   VITE_PUSHER_CLUSTER=us2
   VITE_MODE=demo
   ```

### 2. Configuración de Base de Datos (MySQL)

Ejecuta en orden los scripts SQL en tu servidor MySQL (ej. phpMyAdmin o terminal):
```sql
-- 1. Crear el esquema inicial de tablas
SOURCE backend/setup_db.sql;

-- 2. Aplicar migración para la columna de simulaciones is_test
SOURCE backend/migrate_is_test.sql;

-- 3. Aplicar migración para control de suscripciones y corte mensual
SOURCE backend/migrate_suscripciones.sql;
```
Y ejecuta el sembrado de usuarios:
```bash
php backend/seed_auth.php
```

### 3. Iniciar Backend y Frontend

1. **Servidor PHP:** Asegúrate de que XAMPP / Apache sirva la carpeta del proyecto en el puerto local (ej. `http://localhost/yape/`).
2. **Servidor Vite (React):**
   ```bash
   npm run dev
   # o desde la carpeta frontend:
   cd frontend && npm run dev
   ```

---

## Compilación e Instalación de la App Android

### Prerrequisitos
Tener instalado JDK 21 (vía `winget` en Windows):
```powershell
winget install EclipseAdoptium.Temurin.21.JDK
```

### Compilar el APK (1 solo comando)
Desde la raíz del proyecto, ejecuta:
```bash
npm run build:apk
```
*O ejecuta directamente `.\build-apk.bat`*.

El instalador se generará en:
```
android-app/app/build/outputs/apk/debug/app-debug.apk
```

### Instalación en el Celular
1. Transfiere el archivo `app-debug.apk` a tu teléfono Android (vía WhatsApp, Drive o cable USB) e instálalo.
2. Abre la app **Yape POS Connector**.
3. La app ya viene configurada por defecto. Solo pulsa el botón **"Activar permiso de notificaciones"** y habilita el acceso en Ajustes de Android.
4. Pulsa **"Enviar prueba manual"** para verificar que el cobro llega a simulaciones en el panel web.

---

## Cuentas Demo Iniciales

> **Nota:** Las cuentas de demostración rápida en el Login solo aparecen cuando `VITE_MODE=demo`. Las funciones de simulación (botón Simular Yape, tarjeta de pruebas, toggle de simulaciones) solo son visibles para el rol **Super Admin**.

| Rol | Correo Electrónico | Contraseña | Funcionalidades |
| :--- | :--- | :--- | :--- |
| **Super Admin (SaaS Owner)** | `admin@yape.com` | `admin123` | Control de comercios, configuración de corte mensual, renovación Modo A (+30d), auditoría en vivo, KPIs SaaS. |
| **Mi Bodega VIP (Cliente 1)** | `bodega@prueba.com` | `123456` | Terminal POS, alertas sonoras y voz TTS, cierre de caja WhatsApp. Bloqueo automático si vence suscripción. |
| **Farmacia VIP 24/7 (Cliente 2)** | `farmacia@prueba.com` | `123456` | Terminal POS independiente (Tenant 2). Bloqueo automático si vence suscripción. |

---

## Seguridad & Mejores Prácticas Implementadas
- Prevención de inyección SQL mediante sentencias preparadas PDO (`PDO::PARAM_STR`, `PARAM_INT`).
- Validación contra notificaciones duplicadas usando índices únicos (`INSERT IGNORE`).
- Bloqueo preventivo de webhooks si el comercio está vencido o suspendido (HTTP 403).
- Exclusión total de contraseñas, hashes y secretos en los endpoints del frontend.
- Funciones de demo y simulación restringidas exclusivamente al rol Super Admin (`user.rol === 'admin'`).
- Tipografía monospaced bancaria (`JetBrains Mono`) y contraste óptimo en modo blanco corporativo según guías UI/UX modernas.
- Iconografía SVG profesional en lugar de emojis para máxima sobriedad empresarial.
- Conexión Android con red local permitida mediante `network_security_config.xml` y `usesCleartextTraffic="true"`.
