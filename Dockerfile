# Multi-stage Build para Producción (Alta eficiencia y bajo peso)
# Etapa 1: Compilación de la aplicación React / Vite
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar manifiestos e instalar dependencias
COPY package.json package-lock.json* bun.lock* ./
RUN npm install

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx ligero para producción
FROM nginx:alpine-slim AS runner
WORKDIR /usr/share/nginx/html

# Limpiar archivos estáticos por defecto
RUN rm -rf ./*

# Copiar archivos compilados desde la etapa de compilación
COPY --from=builder /app/dist .

# Copiar configuración de Nginx (soporta puertos 80 y 3000)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puertos estándar
EXPOSE 80
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
