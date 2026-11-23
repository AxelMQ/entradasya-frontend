# EntradasYa - Frontend Web (`entradasya-frontend`)

Interfaz web unificada para la plataforma **EntradasYa**, construida con React 18, Vite, TypeScript y Tailwind CSS, servida en produccion mediante Nginx.

## Funcionalidades por Rol

- **Cliente:** Registro, inicio de sesion, exploracion de cartelera de eventos, detalle por sectores, flujo de compra, historial de ordenes y descarga de entradas PDF con QR.
- **Organizador:** Creacion, publicacion y edicion de eventos, configuracion de sectores (precio y cupos) y consulta de ventas e ingresos.
- **Portero:** Validacion de acceso en puerta mediante escaneo QR con camara (`html5-qrcode`) o ingreso manual del codigo de entrada.

## Requisitos Previos

- **Desarrollo local:** Node.js `>= 20.x` y npm.
- **Contenedor (opcional):** Docker Engine o Docker Desktop.

## Variables de Entorno

Crea un archivo `.env` a partir de `.env.example` cuando ejecutes en local. En compilacion Docker de produccion estas variables se pasan como `build-args` con rutas relativas para enrutar via Nginx Gateway.

| Variable | Valor por defecto (`.env.example`) | Valor en Docker / Gateway | Descripcion |
| :--- | :--- | :--- | :--- |
| `VITE_API_GATEWAY_URL` | _(opcional)_ | _(no definida)_ | URL base alternativa del API Gateway (tiene prioridad sobre `VITE_API_URL` si se define) |
| `VITE_API_URL` | `http://localhost:80` | `/api/v1` | URL base general para peticiones REST de `apiClient` |
| `VITE_AUTH_URL` | `http://localhost:8001` | `/api/v1/auth` | Endpoint base del servicio de autenticacion (`ms-auth`) |
| `VITE_EVENTS_URL` | `http://localhost:8002` | `/api/v1/events` | Endpoint base del servicio de eventos (`ms-events`) |
| `VITE_ORDERS_URL` | `http://localhost:8003` | `/api/v1/orders` | Endpoint base del orquestador de ordenes (`ms-orders`) |
| `VITE_TICKETS_URL` | `http://localhost:8005` | `/api/v1/tickets` | Endpoint base del servicio de tickets (`ms-tickets`) |
| `VITE_CHECKIN_URL` | `http://localhost:8007` | `/api/v1/checkin` | Endpoint base del servicio de control de acceso (`ms-checkin`) |

Nota: En modo desarrollo (`vite.config.ts`), el servidor local en el puerto `3000` incluye proxy hacia los puertos locales `8001`, `8002`, `8003`, `8005` y `8007` para las rutas `/api/v1/*`.

## Instalacion y Ejecucion Local

1. Copiar variables de entorno de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Instalar dependencias:
   ```bash
   npm ci
   ```
3. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicacion quedara disponible en `http://localhost:3000`.
4. Verificar tipos TypeScript y compilar bundle de produccion:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
   Los archivos estaticos compilados se generan en `dist/`.

## Ejecucion con Docker

El `Dockerfile` utiliza una compilacion multi-stage (`node:20-alpine` para compilar Vite y `nginx:alpine` para servir los estaticos con `nginx.conf`):

```bash
docker build \
  --build-arg VITE_API_URL=/api/v1 \
  --build-arg VITE_AUTH_URL=/api/v1/auth \
  --build-arg VITE_EVENTS_URL=/api/v1/events \
  --build-arg VITE_ORDERS_URL=/api/v1/orders \
  --build-arg VITE_TICKETS_URL=/api/v1/tickets \
  --build-arg VITE_CHECKIN_URL=/api/v1/checkin \
  -t entradasya-frontend:local .

docker run --rm -p 8080:80 entradasya-frontend:local
```

## Pipeline CI/CD (`develop`)

Cada `push` hacia la rama `develop` (y ejecucion manual `workflow_dispatch`) ejecuta `.github/workflows/ci-develop.yml`:

1. **Seguridad de secretos:** Escaneo completo de historial con Gitleaks.
2. **Validacion y compilacion:** `npm ci`, verificacion de tipos (`npx tsc --noEmit`), compilacion (`npm run build`) y carga del artifact descargable `entradasya-frontend-dist-<sha>` (`dist/` y `nginx.conf`).
3. **Imagen Docker y auditoria:** Buildx multi-stage, publicacion en `ghcr.io/<owner>/entradasya-frontend:develop` (y en Docker Hub si estan configurados `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN`), escaneo de vulnerabilidades con Trivy y carga del artifact `entradasya-frontend-trivy-report-<sha>`.

## Estado de Verificacion

- Pipeline CI/CD verificado en tiempo real con disparo automatico en rama `develop` hacia GHCR, Docker Hub y GitHub Actions Artifacts.
