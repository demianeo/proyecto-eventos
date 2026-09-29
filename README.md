# Plataforma de Eventos e Inscripciones

API REST inicial para una plataforma de talleres, conferencias, retiros, actividades culturales y encuentros comunitarios.

## Objetivo de las entregas iniciales

Establecer una arquitectura inicial por capas con Node.js y Express y añadir un registro seguro de usuarios mediante MongoDB. Las rutas básicas de salud, eventos y sesiones se mantienen disponibles.

## Tecnologías

- Node.js
- Express
- JavaScript con módulos ESM
- dotenv
- Mongoose
- bcrypt

## Requisitos previos

- Node.js 18 o superior
- npm

## Instalación y variables de entorno

1. Abrir una terminal en la carpeta `proyecto-eventos`.
2. Ejecutar `npm install`.
3. Copiar `.env.example` como `.env`.
4. Ajustar `PORT` si se desea usar otro puerto.

MongoDB debe estar disponible antes de iniciar el servidor. Configura `MONGO_URL` en tu archivo `.env` a partir de `.env.example`. No incluyas credenciales reales en archivos versionados. `JWT_SECRET` queda reservado para una entrega futura y no se utiliza todavía.

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

## Endpoints disponibles

| Método | Ruta | Respuesta esperada |
| --- | --- | --- |
| GET | `/api/health` | `{"status":"ok","message":"Servidor activo"}` |
| GET | `/api/events` | `{"status":"success","payload":[]}` |
| GET | `/api/sessions` | `{"status":"success","payload":[]}` |

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

## Pendiente para futuras entregas

- Inicio de sesión y autenticación JWT.
- CRUD de eventos.
- Inscripciones, cupos y notificaciones.
