# Panel de Caja Yape - Arquitectura Multi-Tenant

Este proyecto es un MVP (Producto Mínimo Viable) diseñado para registrar pagos de Yape en tiempo real y mostrarlos instantáneamente en una pantalla de caja para validación visual. Está construido con una arquitectura Multi-Tenant, permitiendo escalar a múltiples negocios (comerciantes) usando la misma base de datos.

## 🚀 Tecnologías Utilizadas

1. **Disparador Móvil (MacroDroid):** Una app en Android que intercepta las notificaciones push de Yape en el celular del comercio y envía una petición HTTP POST instantánea al backend.
2. **Backend Webhook (PHP 8 + MySQL):** 
   - Autenticación por Tokens Bearer por negocio (Tenant).
   - Base de datos relacional para guardar Tenants y el historial de transacciones.
   - Algoritmo de extracción de monto y nombre del remitente inmune a fraudes o notificaciones duplicadas (INSERT IGNORE).
3. **Mensajería en Tiempo Real (Pusher):** WebSockets para retransmitir el evento validado desde PHP hacia el navegador sin recargar la página.
4. **Frontend Cajero (React + Vite + TailwindCSS):** Pantalla en modo oscuro (Glassmorphism) que recibe el evento vía WebSockets y dispara una animación visual y una alerta sonora (`yape_alert.mp3`).

## 📁 Estructura del Proyecto

El repositorio contiene tanto el frontend como el backend:

- `/backend`: Contiene la lógica del servidor.
  - `composer.json`: Dependencias (Pusher PHP Server, vlucas/phpdotenv).
  - `/public/index.php`: Punto de entrada del Webhook.
  - `/src/Controllers/WebhookController.php`: Lógica de validación, seguridad y notificaciones.
  - `setup_db.sql`: Script SQL para inicializar la base de datos y la tabla de Tenants.
- `/frontend`: Contiene la aplicación web de caja.
  - Creado con React y Vite.
  - Estilizado con Tailwind CSS v4 (PostCSS).
  - `/src/hooks/usePusher.js`: Hook para conectarse al canal WebSocket privado del Tenant.
  - `/src/App.jsx`: Componente principal con alertas y tarjeta de pago interactiva.

## ⚙️ Configuración e Instalación

### 1. Variables de Entorno (.env)
Este proyecto usa variables de entorno para proteger contraseñas y llaves de API. Debes crear dos archivos `.env`:

**Archivo `backend/.env`:**
```ini
DB_HOST=127.0.0.1
DB_NAME=yape_saas
DB_USER=root
DB_PASS=

PUSHER_APP_ID=tu_app_id
PUSHER_KEY=tu_key
PUSHER_SECRET=tu_secret
PUSHER_CLUSTER=us2
```

**Archivo `frontend/.env`:**
```ini
VITE_PUSHER_APP_KEY=tu_key
VITE_PUSHER_CLUSTER=us2
```

### 2. Backend (PHP)
1. Instalar dependencias de Composer:
   ```bash
   cd backend
   composer install
   ```
2. Correr el script `setup_db.sql` en tu MySQL (phpMyAdmin) para crear las tablas y un Tenant de prueba.
3. Asegurarte que tu servidor web local (Ej: XAMPP, Apache) esté sirviendo la carpeta en el puerto 80.

### 3. Frontend (React)
1. Instalar dependencias de Node:
   ```bash
   cd frontend
   npm install
   ```
2. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Hacer clic en cualquier parte de la pantalla negra para permitir que el navegador habilite la reproducción del sonido de alerta.

### 4. MacroDroid (El Celular)
- Instalar MacroDroid.
- Otorgar permiso de "Acceso a notificaciones".
- Crear un macro que se dispare con notificaciones de la app "Yape" que **Contengan** la palabra `S/`.
- Configurar la Acción "Solicitud HTTP" apuntando a la IP local del servidor (`http://tu_ip_local/yape/backend/public/index.php`).
- Añadir un header `Authorization` con el valor `Bearer tu_token_secreto_aqui`.
- Cuerpo JSON:
  ```json
  {
    "monto": "[not_title] [notification]",
    "remitente": "[not_title] [notification]"
  }
  ```

## 🔒 Seguridad
- Validación estricta de Token (Autenticación HTTP Bearer).
- Ignora pagos con montos inválidos o nulos.
- Exclusión automática en Base de datos para prevenir registros duplicados si el teléfono pierde la conexión e intenta reintentar la solicitud.
- Las contraseñas de BD y secretos de Pusher nunca se exponen al cliente de React ni se suben a Git.
