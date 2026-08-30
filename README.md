# Yape POS SaaS — Plataforma Multi-Tenant de Validación en Vivo & Control Administrativo

**Yape POS SaaS** es una plataforma empresarial multi-comercio diseñada para interceptar y registrar notificaciones de pago de Yape en tiempo real, validando cobros en una interfaz web de mostrador (cajero) de alta velocidad con alertas acústicas y visuales, acompañada de un **Panel de Super Administrador (SaaS Owner)** para la gestión y auditoría en tiempo real de todos los comercios afiliados, y una **App Android Nativa ("Yape POS Connector")** que actúa como puente silencioso automatizado sin depender de herramientas de terceros como MacroDroid.

---

## Características Principales

### 1. Arquitectura Multi-Tenant & Seguridad de Sesión
- **Aislamiento por Tenant ID:** Cada comercio posee su propia cuenta, token de API secreto, webhooks y flujo de transacciones aislado.
- **Autenticación HTTP Bearer & Sesiones (`AuthHelper.php`):** Control de acceso por roles (`admin` para el propietario SaaS y `comercio` para el cliente de bodega/tienda).
- **Aislamiento de Simulaciones (`is_test`):** Permite simular cobros de prueba sin contaminar la contabilidad del negocio ni los reportes de recaudo real del día. Las funciones de simulación son exclusivas del rol Super Admin.

### 2. Panel del Super Administrador (SaaS Owner)
- **Directorio y Alta de Comercios:** Crea nuevas cuentas, asigna correos electrónicos para recepción y administra el estado de los clientes (`Activo` o `Suspendido`).
- **Modo Auditoría en Vivo:** El Super Admin puede inspeccionar en tiempo real la pantalla del cajero y los cobros entrantes de cualquier negocio afiliado sin necesidad de pedir sus credenciales.
- **KPIs Consolidados del SaaS:** Monitoreo del volumen total de dinero procesado y estado del sistema.
- **Funciones Demo Exclusivas:** El botón de simulación de pagos, la tarjeta de pruebas y el toggle de simulaciones solo son visibles para el Super Admin. Los cajeros/comercios ven únicamente cobros reales.

### 3. Terminal POS de Cajero (Comercio / Tienda)
- **Recepción en Vivo con WebSockets (Pusher):** Alertas de sonido instantáneas (`yape_alert.mp3`) sin necesidad de refrescar la página.
- **Alerta por Voz Inteligente (TTS):** Síntesis de voz nativa del navegador (*Web Speech API*) que pronuncia en voz alta el monto, nombre del cliente y hora al recibir cada pago. Incluye frase introductoria de apertura de canal de audio (`". . Nuevo pago Yape. ."`) para evitar recortes en Windows/Chrome, invocación instantánea sin demoras (0ms) y formato de hora en 12h.
- **Filtros de Fecha & Exportación Contable:** Selector de periodos (Hoy, Ayer, Últimos 7 Días, Últimos 30 Días) con descarga inmediata en archivo **Excel / CSV**.
- **Ticket de Cierre de Caja Digital:** Módulo con facturación limpia y formato automático listo para copiar al portapapeles y enviar por **WhatsApp** o imprimir en PDF.
- **Carrusel Horizontal de Tarjetas Yape en Tiempo Real:** En lugar de una lista vertical tradicional, el POS muestra las transacciones entrantes en un carrusel interactivo horizontal de derecha a izquierda con flechas de navegación (`< / >`) y desplazamiento automático animado al primer lugar cuando ingresa un nuevo cobro con animación de entrada (`animate-yape-carousel-enter`).

### 4. App Nativa Android ("Yape POS Connector")
- **Reemplazo total de MacroDroid:** App ligera en Kotlin (~6 MB) que intercepta automáticamente notificaciones push de la app oficial de Yape (`com.bcp.innovacxion.yapeapp`).
- **Servicio en Segundo Plano Persistente:** Utiliza `NotificationListenerService` y un `ForegroundService` para mantenerse activa 24/7 sin ser cerrada por el sistema operativo.
- **Extracción Inteligente por Regex:** Parsea automáticamente el monto (`S/ XX.XX`) y el remitente de la notificación para enviarlos por HTTP POST al webhook del backend.
- **Cero Configuración Manual:** Viene preconfigurada en código con la IP local y token por defecto.
- **Compilación en 1 solo comando:** Integrada al flujo de trabajo del proyecto mediante `npm run build:apk` o `.\build-apk.bat`.

### 5. Diseño Minimalista Empresarial (Blanco Corporativo & Morado Institucional)
- **Layout Enterprise con Sidebar:** Arquitectura ejecutiva de pantalla completa con **Barra Lateral Izquierda (SIDEBAR)** en **Blanco Puro Ejecutivo (`#FFFFFF`)** con bordes finos gris pizarra (`#E2E8F0`), ideal para operación corporativa continua en PC, tablet o móvil.
- **Paleta Blanco Corporativo Minimalista:** Fondo blanco perla / slate claro (`#F8FAFC`), tarjetas y menú en blanco puro (`#FFFFFF`) con bordes finos (`#E2E8F0`), acentos morados oficiales de Yape (`#7C3AED`) en botones activos y montos en verde contable (`#059669`). Cero negro y cero luces de neón.
- **Tipografía Oficial Google Fonts:** Incorpora **Plus Jakarta Sans** para máxima claridad ejecutiva y **JetBrains Mono** para alineación numérica contable sin sobrecargar la vista.
- **Iconografía SVG Profesional:** Sistema completo de iconos vectoriales SVG corporativos (estilo Bloomberg/Stripe) en lugar de emojis.
- **Modales en Blanco Corporativo:** Los modales de Configuración API, Cierre de Caja e inicio de sesión utilizan el mismo estilo Blanco Puro (`#FFFFFF`) con bordes finos y textos oscuros legibles.

---

## Stack Tecnológico

- **Frontend:** React 18, Vite, Tailwind CSS v4, Context API (`AuthContext`), y WebSockets Client (`usePusher`).
- **App Android:** Kotlin 1.9, Android SDK 34, OkHttp 4.12, Gson 2.11, Material Design 3, Gradle 8.7.
- **Backend REST API:** PHP 8.2 nativo con arquitectura orientada a servicios (`auth.php`, `admin.php`, `tenant.php`, `transactions.php`).
- **Base de Datos:** MySQL / MariaDB (Esquema Multi-Tenant con claves foráneas, índices de unicidad por transacción y flag `is_test`).
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
│   │   │   │   ├── ApiClient.kt             # Envío HTTP POST con OkHttp
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
│   │   │   ├── admin.php          # REST API Super Admin (Alta de tiendas, auditoría, KPIs)
│   │   │   ├── auth.php           # Autenticación y control de sesiones
│   │   │   ├── tenant.php         # Gestión de credenciales, nombres y simulaciones
│   │   │   └── transactions.php   # Historial filtrable (Cobros Reales vs. Pruebas)
│   │   └── index.php              # Webhook principal receptor de notificaciones Yape
│   ├── src/
│   │   ├── AuthHelper.php         # Middleware de validación de tokens y sesiones
│   │   ├── config.php             # Configuración centralizada MySQL y Pusher
│   │   └── Controllers/           # Controladores del Webhook
│   ├── setup_db.sql               # Inicialización de BD y tabla de Tenants
│   ├── seed_auth.php              # Sembrado de cuentas demo (Admin, Bodega, Farmacia)
│   └── migrate_is_test.sql        # Migración de columna is_test para simulaciones
│
├── frontend/                      # Aplicación Web React / Vite
│   ├── index.html                 # Importación de tipografías Google Fonts
│   ├── src/
│   │   ├── components/
│   │   │   ├── SuperAdminDashboard.jsx   # Panel completo con SIDEBAR para SaaS Owner
│   │   │   ├── LoginPage.jsx             # Login corporativo (cuentas demo solo en modo demo)
│   │   │   ├── CashierSummary.jsx        # KPIs de mostrador y contador contable
│   │   │   ├── CashierCloseModal.jsx     # Recibo digital (Blanco Corporativo) para WhatsApp / Imprimir
│   │   │   ├── TenantModal.jsx           # Modal corporativo para copiar token y webhook de tienda
│   │   │   ├── YapeCard.jsx              # Tarjeta individual de pago en formato carrusel horizontal
│   │   │   └── Icons.jsx                 # Sistema de iconos SVG corporativos profesionales
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Manejo global del usuario, JWT/Token y Auditoría
│   │   ├── hooks/
│   │   │   └── usePusher.js              # Suscripción al canal privado WebSocket del Tenant
│   │   ├── App.jsx                       # Terminal POS principal con SIDEBAR y carrusel horizontal
│   │   └── index.css                     # Sistema de diseño Blanco Corporativo Minimalista y animaciones
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
4. Pulsa **"Enviar prueba manual"** para verificar que el cobro llega instantáneamente al panel web con sonido y voz.

---

## Cuentas Demo Iniciales

> **Nota:** Las cuentas de demostración rápida en el Login solo aparecen cuando `VITE_MODE=demo`. Las funciones de simulación (botón Simular Yape, tarjeta de pruebas, toggle de simulaciones) solo son visibles para el rol **Super Admin**.

| Rol | Correo Electrónico | Contraseña | Funcionalidades |
| :--- | :--- | :--- | :--- |
| **Super Admin (SaaS Owner)** | `admin@yape.com` | `admin123` | Alta de clientes, suspensión de tiendas, auditoría en vivo, KPIs SaaS, simulación de pagos. |
| **Mi Bodega VIP (Cliente 1)** | `bodega@prueba.com` | `123456` | Terminal POS, alertas sonoras, cierre de caja WhatsApp. Sin acceso a funciones demo. |
| **Farmacia VIP 24/7 (Cliente 2)** | `farmacia@prueba.com` | `123456` | Terminal POS aislado e independiente (Tenant 2). Sin acceso a funciones demo. |

---

## Integración Alternativa con MacroDroid (Opcional)

Si en lugar de la App Nativa prefieres utilizar MacroDroid:
1. En MacroDroid, crea un disparador en la aplicación **Yape** con texto de notificación que contenga `S/`.
2. Añade la acción **Solicitud HTTP (POST)** a `http://tu_dominio/yape/backend/public/index.php`.
3. Encabezado HTTP:
   ```http
   Authorization: Bearer tu_token_secreto_aqui
   Content-Type: application/json
   ```
4. Cuerpo JSON:
   ```json
   {
     "monto": "[not_title] [notification]",
     "remitente": "[not_title] [notification]"
   }
   ```

---

## Seguridad & Mejores Prácticas Implementadas
- Prevención de inyección SQL mediante sentencias preparadas PDO (`PDO::PARAM_STR`, `PARAM_INT`).
- Validación contra notificaciones duplicadas usando índices únicos (`INSERT IGNORE`).
- Exclusión total de contraseñas, hashes y secretos en los endpoints del frontend.
- Funciones de demo y simulación restringidas exclusivamente al rol Super Admin (`user.rol === 'admin'`).
- Tipografía monospaced bancaria (`JetBrains Mono`) y contraste óptimo en modo blanco corporativo según guías UI/UX modernas.
- Iconografía SVG profesional en lugar de emojis para máxima sobriedad empresarial.
- Conexión Android con red local permitida mediante `network_security_config.xml`.
