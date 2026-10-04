# Plataforma de Eventos e Inscripciones

API REST inicial para una plataforma de talleres, conferencias, retiros, actividades culturales y encuentros comunitarios.

## Objetivo de las entregas iniciales

Establecer una arquitectura inicial por capas con Node.js y Express, registro seguro de usuarios y autenticación basada en JWT almacenado en cookies HttpOnly.

## Tecnologías

- Node.js
- Express
- JavaScript con módulos ESM
- dotenv
- Mongoose
- bcrypt
- jsonwebtoken
- cookie-parser

## Requisitos previos

- Node.js 18 o superior
- npm

## Instalación y variables de entorno

1. Abrir una terminal en la carpeta `proyecto-eventos`.
2. Ejecutar `npm install`.
3. Copiar `.env.example` como `.env`.
4. Ajustar `PORT` si se desea usar otro puerto.

MongoDB debe estar disponible antes de iniciar el servidor. Configura `MONGO_URL`, `JWT_SECRET` y `JWT_EXPIRES_IN` en tu archivo `.env` a partir de `.env.example`. No incluyas credenciales reales ni secretos en archivos versionados.

## Ejecución

```bash
npm start
```

Para desarrollo con reinicio automático:

```bash
npm run dev
```

El servidor usa el puerto definido en `PORT` o el puerto `8080` de forma predeterminada.

## Estructura

```text
src/
├── app.js                 # Configura Express y registra routers
├── server.js              # Inicia el servidor
├── config/                # Variables de entorno
├── routes/                # Define rutas HTTP
├── controllers/           # Genera respuestas HTTP
├── services/              # Lógica de negocio futura
├── repositories/          # Abstracción de persistencia
├── dao/                   # Acceso directo a MongoDB
├── models/                # Estructuras de User y Event
├── middlewares/           # Funciones intermedias futuras
└── utils/                 # Utilidades reutilizables futuras
```

## Rutas disponibles

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/sessions/register` | Registrar usuario |
| POST | `/api/sessions/login` | Iniciar sesión |
| GET | `/api/sessions/current` | Obtener usuario autenticado |
| POST | `/api/sessions/logout` | Cerrar sesión |
| GET | `/api/health` | Estado del servidor |
| GET | `/api/events` | Listar eventos |
| GET | `/api/sessions` | Estructura inicial de sesiones |

## Registro de usuarios

**POST** `/api/sessions/register`

Body esperado:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Todos los campos son obligatorios. El email se normaliza (se eliminan espacios y se convierte a minúsculas) y la contraseña debe tener al menos 8 caracteres. El registro público ignora cualquier `role` enviado por el cliente; el modelo asigna `user` por defecto. La contraseña se almacena como hash bcrypt y nunca se devuelve en la respuesta.

Respuestas:

- `201`: usuario creado.
- `400`: campos faltantes, email inválido o contraseña demasiado corta.
- `409`: el email ya está registrado.

Ejemplo de respuesta correcta (`201`):

```json
{
  "status": "success",
  "payload": {
    "id": "...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

## Autenticación

### Login

**POST** `/api/sessions/login`

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Respuesta correcta (`200`):

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

La respuesta crea la cookie `currentUser`, que es `HttpOnly`, usa `SameSite=Lax` y solo se marca como `Secure` en producción. El JWT contiene únicamente `id`, `email` y `role`; no se devuelve en JSON.

Si las credenciales no son válidas, responde (`401`):

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

### Usuario actual

**GET** `/api/sessions/current`

Con una cookie válida responde (`200`):

```json
{
  "status": "success",
  "payload": {
    "id": "...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Sin cookie, con un token inválido o expirado responde (`401`):

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### Logout

**POST** `/api/sessions/logout`

Elimina la cookie `currentUser` y responde (`200`):

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Las contraseñas se almacenan como hash bcrypt y nunca se devuelven, ni se incluyen en el JWT. `JWT_SECRET` permanece exclusivamente en `.env`, fuera de GitHub.

## Pendiente para futuras entregas

- CRUD de eventos.
- Inscripciones, cupos y notificaciones.
