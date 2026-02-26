# Slack Clone Backend

Este proyecto es el backend para un clon de Slack, construido con Node.js y Express. Proporciona una API robusta para gestionar autenticación de usuarios, espacios de trabajo (workspaces), canales y mensajería en tiempo real.

## 🚀 Características

-   **Autenticación**: Registro, inicio de sesión (JWT), recuperación de contraseña y verificación de correo electrónico vía Nodemailer.
-   **Workspaces**: Creación, edición, eliminación y listado de espacios de trabajo.
-   **Gestión de Miembros**: Invitaciones por correo, roles (Owner, Admin, Member) y gestión de permisos.
-   **Canales**: Creación, actualización y eliminación de canales dentro de cada workspace.
-   **Mensajería**: Sistema de mensajes con persistencia en MongoDB.
-   **Seguridad**: Middleware de API Key y validación de tokens JWT.

## 🛠️ Requisitos

-   **Node.js**: v18 o superior.
-   **MongoDB**: Instancia local o cluster en MongoDB Atlas.
-   **Cuenta de Gmail**: Para el envío de correos (requiere "Contraseña de aplicación").

## 📥 Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd backend
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto (puedes usar el archivo `.env.example` como referencia si existe):
    ```env
    MONGO_DB_URI=mongodb+srv://...
    MONGO_DB_NAME=UTN-SLACK
    JWT_SECRET_KEY=tu_clave_secreta_super_segura
    GMAIL_USERNAME=tu_email@gmail.com
    GMAIL_PASSWORD=tu_password_de_aplicacion
    URL_FRONTEND=http://localhost:5173
    URL_BACKEND=http://localhost:8080
    API_KEY=tu_uuid_api_key
    ```

## 🏃 Ejecución

-   **Modo desarrollo (con auto-reload):**
    ```bash
    npm run dev
    ```

-   **Modo producción:**
    ```bash
    npm start
    ```
    El servidor corre por defecto en `http://localhost:8080`.

## 📖 Documentación de la API

### Headers Requeridos

| Header | Valor | Requerido en |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Todas las peticiones POST/PUT |
| `x-api-key` | Su `API_KEY` del `.env` | Rutas de Workspace, Canales, Mensajes |
| `Authorization` | `Bearer <TOKEN_JWT>` | Todas las rutas privadas |

---

### 🔐 Autenticación (`/api/auth`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | `/register` | Registra un nuevo usuario. |
| POST | `/login` | Inicia sesión y devuelve un token JWT. |
| GET | `/verify-email?token=...` | Verifica la cuenta del usuario. |
| POST | `/forgot-password` | Envía correo para recuperar contraseña. |
| PUT | `/reset-password` | Cambia la contraseña usando el token recibido. |

### 🏢 Workspaces (`/api/workspace`)

*Requieren `x-api-key` y `Authorization`.*

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| GET | `/` | Obtiene todos los workspaces del usuario. |
| POST | `/` | Crea un nuevo workspace. |
| GET | `/:workspace_id` | Obtiene detalles de un workspace específico. |
| PUT | `/:workspace_id` | Actualiza un workspace (Admin/Owner). |
| DELETE | `/:workspace_id` | Elimina un workspace. |

### 👥 Miembros e Invitaciones

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| GET | `/api/workspace/:id/members` | Lista miembros del workspace. |
| POST | `/api/workspace/:id/members` | Envía invitación a un nuevo miembro. |
| GET | `/api/invitations/accept?token=...` | Acepta una invitación (Público). |
| PUT | `/api/workspace/:id/members/:m_id` | Actualiza rol de un miembro. |
| DELETE | `/api/workspace/:id/members/:m_id` | Elimina un miembro del workspace. |

### 💬 Canales (`/api/workspace/:id/channels`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| GET | `/` | Lista canales del workspace. |
| POST | `/` | Crea un canal (Admin/Owner). |
| PUT | `/:channel_id` | Edita un canal. |
| DELETE | `/:channel_id` | Elimina un canal. |

### ✉️ Mensajes (`/api/workspace/:id/channels/:c_id/messages`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| GET | `/` | Obtiene historial de mensajes del canal. |
| POST | `/` | Envía un mensaje al canal. |
| DELETE | `/:message_id` | Elimina un mensaje específico. |

---

## 🛠️ Tecnologías Utilizadas

- **Express.js**: Framework web.
- **Mongoose**: Modelado de objetos para MongoDB.
- **Bcrypt**: Encriptación de contraseñas.
- **JSONWebToken**: Autenticación basada en tokens.
- **Nodemailer**: Envío de correos electrónicos.
- **CORS**: Intercambio de recursos de origen cruzado.
