# Yape POS SaaS — Plataforma Multi-Tenant de Validación en Vivo & Control Administrativo

**Yape POS SaaS** es una plataforma empresarial multi-comercio diseñada para interceptar y registrar notificaciones de pago de Yape en tiempo real, validando cobros en una interfaz web de mostrador (cajero) de alta velocidad con alertas acústicas y visuales, acompañada de un **Panel de Super Administrador (SaaS Owner)** para la gestión y auditoría en tiempo real de todos los comercios afiliados.

---

## ✨ Características Principales

### 🏢 1. Arquitectura Multi-Tenant & Seguridad de Sesión
- **Aislamiento por Tenant ID:** Cada comercio posee su propia cuenta, token de API secreto, webhooks y flujo de transacciones aislado.
- **Autenticación HTTP Bearer & Sesiones (`AuthHelper.php`):** Control de acceso por roles (`admin` para el propietario SaaS y `comercio` para el cliente de bodega/tienda).
- **Aislamiento de Simulaciones (`is_test`):** Permite simular cobros de prueba sin contaminar la contabilidad del negocio ni los reportes de recaudo real del día.

### 👑 2. Panel del Super Administrador (SaaS Owner)
- **Directorio y Alta de Comercios:** Crea nuevas cuentas, asigna correos electrónicos para recepción y administra el estado de los clientes (`Activo` o `Suspendido`).
- **👀 Modo Auditoría en Vivo:** El Super Admin puede inspeccionar en tiempo real la pantalla del cajero y los cobros entrantes de cualquier negocio afiliado sin necesidad de pedir sus credenciales.
- **KPIs Consolidados del SaaS:** Monitoreo del volumen total de dinero procesado y estado del sistema.

### ⚡ 3. Terminal POS de Cajero (Comercio / Tienda)
- **Recepción en Vivo con WebSockets (Pusher):** Alertas de sonido instantáneas (`yape_alert.mp3`) sin necesidad de refrescar la página.
- **🗣️ Alerta por Voz Inteligente (TTS):** Síntesis de voz nativa del navegador (*Web Speech API*) que pronuncia en voz alta el monto y nombre del cliente al recibir cada pago.
- **📅 Filtros de Fecha & Exportación Contable:** Selector de periodos (Hoy, Ayer, Últimos 7 Días, Últimos 30 Días) con descarga inmediata en archivo **Excel / CSV**.
- **📊 Ticket de Cierre de Caja Digital:** Módulo con facturación limpia y formato automático listo para copiar al portapapeles y enviar por **WhatsApp** o imprimir en PDF.
- **⚡ Simulador Rápido Integrado:** Botón de simulación para pruebas de capacitación o demostraciones sin depender de MacroDroid.

### 🎨 4. Diseño Minimalista Empresarial (Blanco Corporativo & Morado Institucional)
- **Layout Enterprise con Sidebar:** Arquitectura ejecutiva de pantalla completa con **Barra Lateral Izquierda (SIDEBAR)** en morado institucional (`#280C34`) con textos claros, ideal para operación corporativa continua en PC, tablet o móvil.
- **Paleta Blanco Corporativo Minimalista:** Fondo blanco perla / slate claro (`#F8FAFC`), tarjetas limpias en blanco puro (`#FFFFFF`) con bordes finos gris pizarra (`#E2E8F0`), acentos morados oficiales de Yape (`#7C3AED`) y montos en verde contable (`#059669`). Cero negro y cero luces de neón.
- **Tipografía Oficial Google Fonts:** Incorpora **Plus Jakarta Sans** para máxima claridad ejecutiva y **JetBrains Mono** para alineación numérica contable sin sobrecargar la vista.

---

## 🚀 Stack Tecnológico

- **Frontend:** React 18, Vite, Tailwind CSS v4, Context API (`AuthContext`), y WebSockets Client (`usePusher`).
- **Backend REST API:** PHP 8.2 nativo con arquitectura orientada a servicios (`auth.php`, `admin.php`, `tenant.php`, `transactions.php`).
- **Base de Datos:** MySQL / MariaDB (Esquema Multi-Tenant con claves foráneas, índices de unicidad por transacción y flag `is_test`).
- **Integración Móvil (Webhooks):** MacroDroid (o Tasker) en Android para reenvío instantáneo de notificaciones push de Yape.
- **Realtime Engine:** Pusher Channels / WebSockets.

---

## 📁 Estructura del Repositorio

```text
/
├── backend/
│   ├── public/
│   │   ├── api/
│   │   │   ├── admin.php          # REST API Super Admin (Alta de tiendas, auditoría, KPIs)
│   │   │   ├── auth.php           # Autenticación y control de sesiones
│   │   │   ├── tenant.php         # Gestión de credenciales, nombres y simulaciones
│   │   │   └── transactions.php   # Historial filtrable (Cobros Reales vs. Pruebas)
│   │   └── index.php              # Webhook principal para MacroDroid / Push
│   ├── src/
│   │   ├── AuthHelper.php         # Middleware de validación de tokens y sesiones
│   │   ├── config.php             # Configuración centralizada MySQL y Pusher
│   │   └── Controllers/           # Controladores del Webhook
│   ├── setup_db.sql               # Inicialización de BD y tabla de Tenants
│   ├── seed_auth.sql              # Creación de cuentas demo (Super Admin, Bodega VIP, Farmacia VIP)
│   └── migrate_is_test.sql        # Migración de columna is_test para simulaciones
│
└── frontend/
    ├── index.html                 # Importación de tipografías Google Fonts
    ├── src/
    │   ├── components/
    │   │   ├── SuperAdminDashboard.jsx   # Panel completo con SIDEBAR para SaaS Owner
    │   │   ├── LoginPage.jsx             # Login sobrio corporativo con cuentas demo
    │   │   ├── CashierSummary.jsx        # KPIs de mostrador y contador contable
    │   │   ├── CashierCloseModal.jsx     # Recibo digital para WhatsApp / Imprimir
    │   │   ├── TenantModal.jsx           # Modal para copiar token y webhook de tienda
    │   │   └── YapeCard.jsx              # Tarjeta individual de pago verificado
    │   ├── context/
    │   │   └── AuthContext.jsx           # Manejo global del usuario, JWT/Token y Auditoría
    │   ├── hooks/
    │   │   └── usePusher.js              # Suscripción al canal privado WebSocket del Tenant
    │   ├── App.jsx                       # Terminal POS principal del cajero con SIDEBAR
    │   └── index.css                     # Sistema de tokens Dark Obsidian y animaciones
```

---

## ⚙️ Guía de Instalación y Puesta en Marcha

### 1. Variables de Entorno y Configuración Base

1. Copia y edita `backend/src/config.php` o crea tu archivo `backend/.env` con tus credenciales de MySQL y Pusher.
2. Crea tu archivo `frontend/.env`:
   ```ini
   VITE_PUSHER_APP_KEY=tu_pusher_key
   VITE_PUSHER_CLUSTER=us2
   VITE_MODE=demo
   ```

### 2. Configuración de Base de Datos (MySQL)

Ejecuta en orden los scripts SQL en tu servidor MySQL (ej. phpMyAdmin):
```sql
-- 1. Crear el esquema inicial de tablas
SOURCE backend/setup_db.sql;

-- 2. Aplicar migración para la columna de simulaciones is_test
SOURCE backend/migrate_is_test.sql;

-- 3. Cargar usuarios de prueba y tokens inmutables
SOURCE backend/seed_auth.sql;
```

### 3. Iniciar Backend y Frontend

1. **Servidor PHP:** Asegúrate de que XAMPP / Apache sirva la carpeta del proyecto en el puerto local (ej. `http://localhost/yape/`).
2. **Servidor Vite (React):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔐 Cuentas Demo Iniciales

Puedes hacer clic en los botones del pie de página del Login o usar las siguientes credenciales para probar los dos perfiles de usuario del sistema:

| Rol | Correo Electrónico | Contraseña | Funcionalidades |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin (SaaS Owner)** | `admin@yape.com` | `admin123` | Alta de clientes, suspensión de tiendas, auditoría en vivo, KPIs SaaS. |
| **🏪 Mi Bodega VIP (Cliente 1)** | `bodega@prueba.com` | `123456` | Terminal POS, alertas sonoras, cierre de caja WhatsApp, simulación. |
| **💊 Farmacia VIP 24/7 (Cliente 2)** | `farmacia@prueba.com` | `123456` | Terminal POS aislado e independiente (Tenant 2). |

---

## 📱 Configuración en MacroDroid (Celular de Tienda)

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

## 🛡️ Seguridad & Mejores Prácticas Implementadas
- Prevención de inyección SQL mediante sentencias preparadas PDO (`PDO::PARAM_STR`, `PARAM_INT`).
- Validación contra notificaciones duplicadas usando índices únicos (`INSERT IGNORE`).
- Exclusión total de contraseñas, hashes y secretos en los endpoints del frontend.
- Tipografía monospaced bancaria (`JetBrains Mono`) y contraste óptimo en modo oscuro según guías UI/UX modernas.
