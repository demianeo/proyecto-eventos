# Plataforma de Eventos e Inscripciones

API REST inicial para una plataforma de talleres, conferencias, retiros, actividades culturales y encuentros comunitarios.

## Objetivo de las entregas iniciales

Establecer una arquitectura inicial por capas con Node.js y Express, autenticación con JWT en cookies HttpOnly y autorización por roles.

## Tecnologías

- Node.js
- Express
- JavaScript con módulos ESM
- dotenv
- Mongoose
- bcrypt
- jsonwebtoken
- cookie-parser
- passport
- passport-local
- passport-jwt
- nodemailer

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
├── config/                # Entorno, MongoDB, Passport y correo
├── routes/                # Define rutas HTTP
├── controllers/           # Genera respuestas HTTP
├── services/              # Lógica de negocio
├── repositories/          # Operaciones orientadas al dominio
├── dao/                   # Acceso directo a MongoDB
├── dto/                   # Respuestas públicas y seguras
├── models/                # Esquemas de User, Event y Ticket
├── middlewares/           # Auth, autorización y errores
└── utils/                 # JWT y hash de contraseñas
```

## Arquitectura

La API mantiene sus mismas rutas y contratos externos, pero separa las responsabilidades internas para que las reglas de negocio no dependan de Express ni de Mongoose.

- **Routes** definen endpoints y middlewares.
- **Controllers** extraen datos de la request y construyen la respuesta HTTP.
- **Services** contienen las reglas de negocio: roles, ownership, cupos, duplicados, estados y validaciones.
- **Repositories** exponen operaciones del dominio y delegan persistencia.
- **DAO** son la única capa que importa modelos Mongoose y ejecuta queries.
- **Models** definen los esquemas de MongoDB.
- **DTO** transforma respuestas públicas y evita filtrar datos sensibles.
- **Middlewares** centralizan autenticación, autorización y errores.

```text
Client
  ↓
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Mongoose Model
  ↓
MongoDB

MongoDB
  ↓
DAO
  ↓
Repository
  ↓
Service
  ↓
DTO
  ↓
Controller
  ↓
Client
```

Los DTO de usuario, evento y ticket aceptan documentos Mongoose o datos ya transformados. `CurrentUserDTO` deja salir solo `id`, `email` y `role`; el DTO de usuario excluye siempre `password`; el de evento sanitiza un organizer poblado; y el de ticket sanitiza un user poblado y limita los datos públicos del evento. Por eso, ni `/api/sessions/current`, ni eventos, ni tickets exponen hashes o contraseñas.

## Rutas disponibles

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/sessions/register` | Registrar usuario |
| POST | `/api/sessions/login` | Iniciar sesión |
| GET | `/api/sessions/current` | Obtener usuario autenticado |
| POST | `/api/sessions/logout` | Cerrar sesión |
| GET | `/api/health` | Estado del servidor |
| GET | `/api/events` | Listar eventos publicados, con filtros y paginación |
| GET | `/api/events/:id` | Consultar un evento público |
| POST | `/api/events` | Crear evento (organizer o admin) |
| PUT | `/api/events/:id` | Modificar un evento propio (organizer) o cualquiera (admin) |
| PATCH | `/api/events/:id/status` | Cambiar estado de un evento propio (organizer) o cualquiera (admin) |
| GET | `/api/users` | Listar usuarios (admin) |
| POST | `/api/events/:eid/tickets` | Inscribirse a un evento autenticado |
| GET | `/api/tickets/my-tickets` | Consultar tickets propios |
| GET | `/api/events/:eid/tickets` | Tickets de un evento propio (organizer) o cualquiera (admin) |
| PATCH | `/api/tickets/:tid/cancel` | Cancelar ticket propio o como admin |
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

## Passport.js

La autenticación se centraliza en `src/config/passport.config.js`. La aplicación queda preparada para sumar estrategias futuras, como Google o GitHub, sin modificar `app.js`.

### register

La estrategia `register` valida los campos del registro, normaliza el email, comprueba duplicados, crea el hash bcrypt y crea el usuario. El rol recibido desde el cliente se ignora y el modelo asigna `user`.

### login

La estrategia `login` busca el usuario y valida la contraseña mediante bcrypt. Solo deja disponible un usuario autenticado seguro para el controlador. El controlador genera el JWT y configura la cookie; Passport no genera JWT durante login.

### current

La estrategia `current` extrae el JWT desde la cookie `currentUser`, valida firma y expiración, y expone exclusivamente `id`, `email` y `role` en `req.user`.

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

## Roles y autorización

El campo `role` de cada usuario admite `user`, `organizer` y `admin`; su valor por defecto es `user`. El registro público ignora cualquier rol recibido en el body, por lo que no permite crear organizadores ni administradores.

| Acción | user | organizer | admin |
| --- | --- | --- | --- |
| Consultar eventos publicados | Sí | Sí | Sí |
| Crear eventos | No | Sí | Sí |
| Modificar o cancelar eventos propios | No | Sí | Sí |
| Modificar cualquier evento | No | No | Sí |
| Ver todos los usuarios | No | No | Sí |

Las rutas privadas usan dos middlewares reutilizables:

- `authMiddleware`: lee el JWT de la cookie `currentUser`, lo valida y carga `req.user`. Sin una sesión válida responde `401` con `No autenticado`.
- `authorize(...roles)`: compara `req.user.role` con los roles permitidos. Una sesión válida sin permiso responde `403` con `No tenés permisos para realizar esta acción`.

La edición de eventos incluye una validación de propiedad: un `organizer` solo puede modificar o cancelar sus propios eventos; un `admin` puede modificar cualquiera.

## Events

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/events` | organizer, admin |
| GET | `/api/events` | Público |
| GET | `/api/events/:id` | Público |
| PUT | `/api/events/:id` | Organizer dueño, admin |
| PATCH | `/api/events/:id/status` | Organizer dueño, admin |

Un evento requiere `title`, `description`, `category`, `date`, `location`, `capacity` y `price`. Al crearlo, el organizer se obtiene exclusivamente desde el usuario autenticado; cualquier `organizer` enviado en el body se ignora. El estado inicial siempre es `draft`.

Reglas de negocio:

- La fecha debe ser futura al crear o actualizarla.
- `capacity` debe ser mayor a 0 y `price` mayor o igual a 0.
- Los estados válidos son `draft`, `published`, `cancelled` y `finished`.
- Cancelar no elimina el documento: cambia su estado a `cancelled`.
- Los eventos cancelados son inmutables y no pueden publicarse ni modificarse.
- Un evento `finished` no puede volver a `published`.

### Listado, filtros y paginación

`GET /api/events` admite `status`, `category`, `location`, `dateFrom`, `dateTo`, `page`, `limit` y `sort`. Los valores predeterminados son `page=1`, `limit=10` y orden ascendente por `date`; `limit` tiene máximo 100. Los campos permitidos en `sort` son `date`, `price`, `createdAt` y `title`; se puede usar `-date` para orden descendente.

Ejemplo:

```text
GET /api/events?status=published&category=workshop&page=2&limit=5&sort=date
```

Respuesta paginada:

```json
{
  "status": "success",
  "data": [],
  "page": 2,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

## Tickets e inscripciones

Un ticket relaciona únicamente referencias ObjectId a `user` y `event`. Sus estados son `confirmed`, `pending` y `cancelled`. Al crear una inscripción se genera un `reservationCode`; al cancelar se conserva el documento, cambia a `cancelled` y registra `cancelledAt`.

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/events/:eid/tickets` | Autenticado |
| GET | `/api/tickets/my-tickets` | Autenticado, solo propios |
| GET | `/api/events/:eid/tickets` | Organizer dueño o admin |
| PATCH | `/api/tickets/:tid/cancel` | Dueño del ticket o admin |

La inscripción solo es posible cuando el evento existe, está `published`, la cantidad solicitada es mayor a cero, hay cupos suficientes y el usuario no tiene otra inscripción activa. Los tickets `confirmed` y `pending` ocupan cupo; los `cancelled` no. Por eso, una cancelación libera cupos sin eliminar datos.

`GET /api/tickets/my-tickets` incluye únicamente datos públicos del evento asociado: `title`, `date` y `location`.

Al confirmar una inscripción se intenta enviar un email con Nodemailer. Configura estas variables únicamente en `.env`:

```dotenv
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

No incluyas esas credenciales en GitHub. Si faltan, el ticket se confirma y el servidor registra que el email no pudo enviarse; al completar las variables, Nodemailer envía la confirmación.

## Pendiente para futuras entregas

- Integraciones adicionales de pago o recordatorios de eventos.
