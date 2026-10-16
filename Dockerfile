# Multi-stage Build for High-Performance Production Container
# Stage 1: Build React Native Web App
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies with cached layers
COPY package.json package-lock.json* ./
RUN npm ci

# Copy full source and compile
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine-slim AS runner
WORKDIR /usr/share/nginx/html

# Clean default static assets
RUN rm -rf ./*

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist .

# Production custom Nginx reverse proxy configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 3000;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    location /api/ {
        proxy_pass http://restoxyz-backend:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
