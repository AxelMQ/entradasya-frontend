# ==============================================================================
# Dockerfile: Frontend Web React + Vite (Alpine Multi-Stage con Nginx)
# ==============================================================================

# Etapa 1: Compilación de estáticos con Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./

# Parámetros de build para Vite (enrutamiento relativo a través del Gateway)
ARG VITE_API_URL=/api/v1
ARG VITE_AUTH_URL=/api/v1/auth
ARG VITE_EVENTS_URL=/api/v1/events
ARG VITE_ORDERS_URL=/api/v1/orders
ARG VITE_TICKETS_URL=/api/v1/tickets
ARG VITE_CHECKIN_URL=/api/v1/checkin

ENV VITE_API_URL=$VITE_API_URL \
    VITE_AUTH_URL=$VITE_AUTH_URL \
    VITE_EVENTS_URL=$VITE_EVENTS_URL \
    VITE_ORDERS_URL=$VITE_ORDERS_URL \
    VITE_TICKETS_URL=$VITE_TICKETS_URL \
    VITE_CHECKIN_URL=$VITE_CHECKIN_URL

RUN npm run build

# Etapa 2: Servidor web ultraligero con Nginx
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
