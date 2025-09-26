# XpertBackend

Servicio backend en Node.js + TypeScript que actúa como fachada de [TheCatAPI](https://thecatapi.com/) y añade endpoints propios para gestionar usuarios. Incluye validaciones de entrada, manejo centralizado de errores y persistencia en MongoDB para las operaciones de autenticación.

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- Instancia de MongoDB accesible (local o remota) para las rutas de usuarios

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` (puedes partir de `.env.example`) con las variables necesarias:

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `CAT_API_KEY` | **Obligatoria.** API key emitida por TheCatAPI. | _sin valor_ |
| `CAT_API_BASE_URL` | URL base opcional para TheCatAPI. | `https://api.thecatapi.com/v1` |
| `MONGODB_URI` | Cadena de conexión de MongoDB para las rutas de usuarios. | `mongodb://localhost:27017/xpert` |
| `PORT` | Puerto donde escuchará el servidor HTTP. | `3000` |

Las rutas que consultan TheCatAPI (`/breeds`, `/breeds/:breed_id`, `/breeds/search`, `/imagesbybreedid`) requieren que `CAT_API_KEY` esté configurada; de lo contrario el servicio devolverá un error 500 al inicializarse.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run start:dev` | Levanta el servidor en modo desarrollo con `ts-node`. |
| `npm run build` | Transpila el proyecto TypeScript a JavaScript en `dist/`. |
| `npm start` | Ejecuta la versión compilada (requiere `npm run build` previo). |
| `npm test` | Ejecuta la suite de pruebas unitarias con Jest. |
| `npm run test:watch` | Ejecuta los tests en modo observador. |
| `npm run test:coverage` | Genera un reporte de cobertura de código. |

## Arquitectura y flujo interno

- **Bootstrap (`src/index.ts`)**: carga la configuración, establece la conexión con MongoDB, instancia la app de Express y registra los manejadores de apagado ordenado.
- **Aplicación (`src/app.ts`)**: crea la instancia de Express, inicializa los servicios y registra los controladores de gatos, imágenes y usuarios en un router común.
- **Controladores (`src/controllers/`)**: exponen rutas HTTP y delegan la lógica a sus servicios. Cada handler valida parámetros o cuerpos mediante DTOs.
- **Servicios (`src/services/`)**:
  - `CatsService` e `ImagesService` consumen TheCatAPI usando `axios` y normalizan las respuestas.
  - `UsersService` maneja registro e inicio de sesión, utilizando `bcryptjs` para hash/compare de contraseñas y `mongoose` para persistencia.
- **Validaciones (`src/middleware/validation.middleware.ts`)**: convierte las entradas a DTOs usando `class-transformer` y valida con `class-validator`, devolviendo errores 400 estructurados si la validación falla.
- **Manejo de errores (`src/middleware/error-handler.ts`)**: captura excepciones `HttpError` para responder con el estado adecuado y, para errores inesperados, devuelve un 500 genérico tras loguearlos.
- **Modelos y esquemas (`src/models/`)**: definen las interfaces de dominio para razas, imágenes y usuarios, así como el esquema de Mongoose con sanitización automática del campo `password` al serializar.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/breeds` | Obtiene todas las razas disponibles en TheCatAPI. |
| `GET` | `/breeds/:breed_id` | Recupera los detalles de una raza concreta. Parámetro validado por `BreedIdParamDto`. |
| `GET` | `/breeds/search?q=<término>` | Busca razas por nombre usando `CatSearchQueryDto`. |
| `GET` | `/imagesbybreedid?breed_id=<id>&limit=<n>` | Devuelve imágenes asociadas a una raza. `limit` es opcional (máx. 20) y validado por `ImagesByBreedQueryDto`. |
| `POST` | `/users/register` | Crea una cuenta de usuario. Cuerpo requerido: `{ email, password, name }`. La contraseña debe tener al menos 8 caracteres. |
| `POST` | `/users/login` | Inicia sesión con email y contraseña. Devuelve la información del usuario sin el hash de la contraseña. |

### Reglas de negocio destacadas

- Los emails se normalizan a minúsculas antes de consultarse o almacenarse para evitar duplicados por mayúsculas/minúsculas.
- Las contraseñas se almacenan con `bcrypt` utilizando 10 rondas de sal (`SALT_ROUNDS = 10`).
- Cuando TheCatAPI devuelve 404 en `/breeds/:breed_id`, el servicio transforma el error en un `HttpError` 404 con un mensaje claro.

## Ejecución local

1. Instala dependencias con `npm install`.
2. Configura `.env` con tu `CAT_API_KEY` y la cadena de conexión `MONGODB_URI`.
3. Asegúrate de tener MongoDB en ejecución y accesible.
4. Inicia el servidor en modo desarrollo:

   ```bash
   npm run start:dev
   ```

   El servicio mostrará en consola `Server listening on port <PORT>` cuando esté listo.

## Despliegue / Producción

1. Ejecuta `npm run build` para generar la salida en `dist/`.
2. Define las variables de entorno en el entorno de despliegue.
3. Lanza la aplicación compilada:

   ```bash
   npm start
   ```

El proceso incluye manejadores de señal (`SIGINT`, `SIGTERM`) que cierran la conexión HTTP y desconectan MongoDB antes de finalizar.

## Pruebas automatizadas

La suite de Jest cubre controladores y servicios principales:

- `test/cats.controller.spec.ts`: verifica que los handlers llamen al servicio correspondiente y manejen errores mediante `next()`.
- `test/cats.service.spec.ts`: usa `nock` para simular TheCatAPI y comprobar el mapeo de respuestas y manejo de errores de configuración.
- `test/users.service.spec.ts`: mockea el modelo de Mongoose para validar registro e inicio de sesión, incluyendo hash de contraseñas y errores por credenciales.

Para ejecutar las pruebas:

```bash
npm test
```

Puedes obtener cobertura de código con:

```bash
npm run test:coverage
```

Ambos comandos pueden ejecutarse sin depender de servicios externos gracias a los dobles de prueba incluidos (mocks/nock).
