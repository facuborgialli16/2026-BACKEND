# Slack Clone Backend

Este proyecto es el backend para un clon de Slack, construido con Node.js y Express. Proporciona una API para gestionar autenticación de usuarios, espacios de trabajo, canales y mensajería.

## Características

-   **Autenticación**: Registro, inicio de sesión y verificación de correo electrónico.
-   **Workspaces**: Creación, gestión y listado de espacios de trabajo. Gestión de miembros e invitaciones.
-   **Canales**: Gestión de canales dentro de un workspace.
-   **Mensajería**: Envío y recepción de mensajes en canales.
-   **Base de datos**: Persistencia de datos utilizando MongoDB y Mongoose.

## Requisitos

-   Node.js (v14 o superior recomendado)
-   MongoDB (Instancia local o cluster en la nube como MongoDB Atlas)

## Instalación

1.  **Clonar el repositorio:**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**

    Crea un archivo `.env` en la raíz del proyecto y define las siguientes variables:

    ```env
    MONGO_DB_URI=tu_uri_de_mongodb
    MONGO_DB_NAME=nombre_de_tu_base_de_datos
    JWT_SECRET_KEY=clave_secreta_para_jwt
    GMAIL_USERNAME=tu_email_para_nodemailer
    GMAIL_PASSWORD=tu_password_de_aplicacion
    URL_FRONTEND=url_de_tu_frontend
    URL_BACKEND=http://localhost:8080
    ```

## Ejecución

-   **Modo desarrollo (con "watch" para recarga automática):**

    ```bash
    npm run dev
    ```

-   **Modo producción:**

    ```bash
    npm start
    ```

El servidor se iniciará por defecto en el puerto `8080`.

## Ejemplos de Requests (API)

A continuación se detallan algunos de los endpoints principales.

### Autenticación

**Registro de Usuario**
`POST /api/auth/register`

```json
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Login**
`POST /api/auth/login`

```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

### Workspaces (Requiere Header `Authorization`)

_Nota: Para todas las rutas protegidas, incluir el header:_
`Authorization: Bearer <TOKEN_JWT>`

**Crear Workspace**
`POST /api/workspace`

```json
{
  "name": "Mi Equipo",
  "image": "https://url-imagen.com/logo.png" // Opcional
}
```

**Obtener mis Workspaces**
`GET /api/workspace`

**Invitar Miembro**
`POST /api/workspace/:workspace_id/members`

```json
{
  "email": "nuevo_miembro@example.com"
}
```

### Canales

**Crear Canal**
`POST /api/workspace/:workspace_id/channels`

```json
{
  "name": "general"
}
```

**Obtener Canales de un Workspace**
`GET /api/workspace/:workspace_id/channels`

### Mensajes

**Enviar Mensaje a un Canal**
`POST /api/workspace/:workspace_id/channels/:channel_id/messages`

```json
{
  "content": "Hola mundo!"
}
```

**Obtener Mensajes de un Canal**
`GET /api/workspace/:workspace_id/channels/:channel_id/messages`
