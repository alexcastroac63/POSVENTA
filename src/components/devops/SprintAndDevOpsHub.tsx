/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

export const SprintAndDevOpsHub: React.FC = () => {
  const { sprintStories, showToast } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'sprint' | 'docker' | 'nginx' | 's3' | 'cicd' | 'backend' | 'schema'>('sprint');
  const [schemaSubTab, setSchemaSubTab] = useState<'ddl' | 'seed'>('ddl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Código copiado al portapapeles');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const totalPoints = sprintStories.reduce((acc, s) => acc + s.storyPoints, 0);
  const donePoints = sprintStories
    .filter((s) => s.status === 'done')
    .reduce((acc, s) => acc + s.storyPoints, 0);

  const nginxSnippet = `server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Soporte SPA: redirige cualquier ruta al index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # Healthcheck para Docker
    location /health {
        access_log off;
        return 200 "healthy\\n";
    }
}`;

  const dockerComposeSnippet = `services:
  # 1. Frontend Web App (React Native Web + Vite SPA)
  restoxyz-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: restoxyz-pos-ui
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=http://localhost:5000/api
      - VITE_S3_STORAGE_URL=http://localhost:9000/restaurant-media
    depends_on:
      - restoxyz-backend
      - minio-s3
    networks:
      - restaurant-net

  # 2. Backend Real-time API (C# .NET 8 / Node.js Express)
  restoxyz-backend:
    build:
      context: ./backend-csharp
      dockerfile: Dockerfile
    container_name: restoxyz-api
    restart: always
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres-db;Port=5432;Database=restoxyz_db;Username=resto_admin;Password=secret_pwd
      - Redis__ConnectionString=redis-pubsub:6379
      - AWS__ServiceURL=http://minio-s3:9000
      - AWS__AccessKey=minio_resto_admin
      - AWS__SecretKey=minio_resto_secret_2026
    depends_on:
      - redis-pubsub
      - minio-s3
    networks:
      - restaurant-net

  # 3. Docker tipo S3 para almacenamiento de imágenes (MinIO S3-Compatible de Quay.io)
  minio-s3:
    image: quay.io/minio/minio:latest
    container_name: restoxyz-s3-storage
    restart: always
    ports:
      - "9000:9000" # S3 API endpoint
      - "9001:9001" # Web Console UI
    environment:
      - MINIO_ROOT_USER=minio_resto_admin
      - MINIO_ROOT_PASSWORD=minio_resto_secret_2026
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - restaurant-net

  # 4. Redis for Real-time Synchronized Pub/Sub (Tablets <-> KDS <-> All-in-One)
  redis-pubsub:
    image: redis:7-alpine
    container_name: restoxyz-redis
    restart: always
    ports:
      - "6379:6379"
    networks:
      - restaurant-net

volumes:
  minio_data:
    driver: local

networks:
  restaurant-net:
    driver: bridge`;

  const dockerfileSnippet = `# PASO 1: Construir la imagen localmente:
# docker build -t posventa-app .
#
# PASO 2: Detener y eliminar contenedor previo si falló:
# docker rm -f mi-posventa
#
# PASO 3: Levantar el contenedor en puerto 8080 (evitar 9001 si se usa MinIO):
# docker run -d -p 8080:80 --name mi-posventa posventa-app
# (Acceder en http://localhost:8080)

# Multi-stage Build para Producción
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar únicamente package.json para evitar conflicto de lockfiles (edgesOut)
COPY package.json ./
RUN npm install --legacy-peer-deps --no-audit

COPY . .
RUN npm run build

FROM nginx:alpine-slim AS runner
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]`;

  const cicdSnippet = `name: CI/CD Pipeline - RestoXYZ Production

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # 1. Continuous Integration (Lint, Typecheck & Tests)
  test-and-lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run TypeScript Linter & Typecheck
        run: npm run lint

      - name: Build Web Application
        run: npm run build

  # 2. Continuous Delivery: Docker Build & Registry Push
  docker-build-and-push:
    needs: test-and-lint
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      # Convertimos el nombre del repo a minúsculas (requisito estricto de Docker / GHCR)
      - name: Lowercase Repository Name for Docker Tag
        id: meta
        run: |
          REPO_LOWER=$(echo "\${{ github.repository }}" | tr '[:upper:]' '[:lower:]')
          echo "image_tag=ghcr.io/\${REPO_LOWER}/restoxyz-ui:latest" >> \$GITHUB_OUTPUT

      - name: Build & Push Frontend Image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: \${{ steps.meta.outputs.image_tag }}

  # 3. Continuous Deployment: Production Release
  deploy-to-production:
    needs: docker-build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Cloud Infrastructure (Kubernetes / Cloud Run)
        run: |
          echo "Desplegando versión a producción..."
          echo "Configurando almacenamiento S3 para fotos de menú..."
          echo "Notificando a terminales POS para actualización instantánea..."`;

  const csharpSnippet = `// Backend C# .NET 8 WebAPI con SignalR para Sincronización en Tiempo Real
using Microsoft.AspNetCore.SignalR;
using Amazon.S3;
using Amazon.S3.Model;

var builder = WebApplication.CreateBuilder(args);

// Configuración de SignalR para WebSocket con Tablets y Terminales All-in-One
builder.Services.AddSignalR();
builder.Services.AddCors(options => {
    options.AddPolicy("CorsPolicy", policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true));
});

// Configuración de Cliente S3 MinIO para almacenamiento de imágenes
builder.Services.AddSingleton<IAmazonS3>(sp => {
    var s3Config = new AmazonS3Config {
        ServiceURL = builder.Configuration["AWS:ServiceURL"] ?? "http://minio-s3:9000",
        ForcePathStyle = true
    };
    return new AmazonS3Client("minio_resto_admin", "minio_resto_secret_2026", s3Config);
});

var app = builder.Build();
app.UseCors("CorsPolicy");

// Hub SignalR para sincronización omnicanal inmediata
app.MapHub<RestaurantHub>("/hubs/restaurant");

// Endpoints RESTful
app.MapPost("/api/orders/transmit", async (OrderDto order, IHubContext<RestaurantHub> hub) => {
    // Transmitir orden automáticamente a KDS (Chef Rodrigo) y Tablets
    await hub.Clients.Group("KitchenDisplay").SendAsync("NewOrderReceived", order);
    return Results.Ok(new { success = true, orderId = order.Id });
});

app.Run();

public class RestaurantHub : Hub {
    public async Task JoinStationGroup(string station) =>
        await Groups.AddToGroupAsync(Context.ConnectionId, station);
}`;

  const sqlSchemaSnippet = `-- ============================================================================
-- RESTO-XYZ: ESQUEMA DE BASE DE DATOS RELACIONAL (POSTGRESQL / SQL DDL)
-- ============================================================================

-- 1. TABLA: ROLES Y PERFILES (RBAC)
CREATE TABLE role_profiles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    role_key VARCHAR(50) NOT NULL UNIQUE,
    can_apply_discounts BOOLEAN DEFAULT FALSE,
    can_cancel_orders BOOLEAN DEFAULT FALSE,
    can_open_cash_shift BOOLEAN DEFAULT FALSE,
    can_close_cash_shift BOOLEAN DEFAULT FALSE,
    can_view_audit_logs BOOLEAN DEFAULT FALSE,
    can_configure_catalog BOOLEAN DEFAULT FALSE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_reopen_table BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: USUARIOS Y PERSONAL
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(50) NOT NULL REFERENCES role_profiles(role_key) ON UPDATE CASCADE,
    pin VARCHAR(10) NOT NULL,
    device VARCHAR(50) DEFAULT 'terminal',
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: CANALES DE VENTA (OMNICANAL)
CREATE TABLE sales_channels (
    id VARCHAR(30) PRIMARY KEY, -- 'mesa', 'llevar', 'delivery'
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    default_price_mode VARCHAR(20) DEFAULT 'base',
    default_delta NUMERIC(10, 2) DEFAULT 0.00
);

-- 4. TABLA: MESAS Y SALONES
CREATE TABLE restaurant_tables (
    id VARCHAR(50) PRIMARY KEY,
    number INT NOT NULL,
    salon_id VARCHAR(50) NOT NULL,
    salon_name VARCHAR(100) NOT NULL,
    seats INT NOT NULL DEFAULT 4,
    status VARCHAR(30) DEFAULT 'disponible',
    current_order_id VARCHAR(50),
    waiter_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    waiter_name VARCHAR(120),
    opened_at TIMESTAMP WITH TIME ZONE
);

-- 5. TABLA: PRODUCTOS BASE (CATÁLOGO MAESTRO: COCINA INTERNA VS ARMADO)
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    preparation_type VARCHAR(30) NOT NULL, -- 'cocina_interna' (KDS), 'armado_menu'
    station VARCHAR(30) DEFAULT 'parrilla',
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. TABLA: MENÚS Y COMBOS DE VENTA (MENU ITEMS)
CREATE TABLE menu_items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    description TEXT,
    allow_discounts BOOLEAN DEFAULT TRUE,
    is_available_mesa BOOLEAN DEFAULT TRUE,
    is_available_llevar BOOLEAN DEFAULT TRUE,
    is_available_delivery BOOLEAN DEFAULT TRUE,
    station VARCHAR(30) NOT NULL DEFAULT 'pase',
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. TABLA: PRODUCTOS INTERNOS DEL MENÚ CON ORDEN DE PREPARACIÓN
CREATE TABLE menu_internal_products (
    id VARCHAR(50) PRIMARY KEY,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(150) NOT NULL,
    preparation_order INT NOT NULL DEFAULT 1
);

-- 8. TABLA: MODIFICADORES Y SUSTITUCIONES DE PRODUCTOS INTERNOS
CREATE TABLE internal_product_modifiers (
    id VARCHAR(50) PRIMARY KEY,
    internal_product_id VARCHAR(50) NOT NULL REFERENCES menu_internal_products(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN DEFAULT FALSE
);

-- 9. TABLA: COMANDAS / ÓRDENES ACTIVAS
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number INT NOT NULL,
    channel VARCHAR(30) NOT NULL REFERENCES sales_channels(id),
    platform_name VARCHAR(50),
    table_id VARCHAR(50) REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    table_number INT,
    salon_name VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'abierta', -- 'abierta', 'en_cocina', 'lista_para_servir', 'en_precuenta', 'cobrada'
    waiter_id VARCHAR(50) NOT NULL REFERENCES users(id),
    waiter_name VARCHAR(120) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_authorized_by VARCHAR(120),
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABLA: DETALLE DE COMANDA (ITEMS EN KDS)
CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id),
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL,
    station VARCHAR(30) NOT NULL, -- 'parrilla', 'barra', 'freidora', 'pase'
    status VARCHAR(30) NOT NULL DEFAULT 'en_cola', -- 'en_cola', 'preparando', 'listo', 'entregado'
    notes TEXT
);

-- 11. TABLA: HISTORIAL DE FACTURAS EMITIDAS (ENCABEZADO HISTÓRICO)
CREATE TABLE historical_invoices (
    id VARCHAR(50) PRIMARY KEY,
    document_number VARCHAR(50) NOT NULL UNIQUE, -- ej: FAC-2026-000101
    ticket_number INT NOT NULL,
    date_time_str VARCHAR(50) NOT NULL,
    iso_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cashier_id VARCHAR(50) NOT NULL REFERENCES users(id),
    cashier_name VARCHAR(120) NOT NULL,
    sales_channel VARCHAR(30) NOT NULL,
    sales_channel_label VARCHAR(150) NOT NULL,
    table_number INT,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    total_charged NUMERIC(10, 2) NOT NULL,
    change_given NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(150) NOT NULL,
    discount_applied BOOLEAN DEFAULT FALSE,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. TABLA: DETALLE DE FACTURA HISTÓRICA CON PRODUCTOS INTERNOS
CREATE TABLE historical_invoice_items (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL REFERENCES historical_invoices(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

CREATE TABLE historical_invoice_internal_products (
    id SERIAL PRIMARY KEY,
    invoice_item_id VARCHAR(50) NOT NULL REFERENCES historical_invoice_items(id) ON DELETE CASCADE,
    product_name VARCHAR(150) NOT NULL,
    preparation_order INT NOT NULL,
    preparation_type VARCHAR(30) NOT NULL,
    selected_option_name VARCHAR(150) NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 13. TABLA: TURNOS Y CORTES DE CAJA
CREATE TABLE cash_shifts (
    id VARCHAR(50) PRIMARY KEY,
    opened_at VARCHAR(50) NOT NULL,
    closed_at VARCHAR(50),
    cashier_id VARCHAR(50) NOT NULL REFERENCES users(id),
    cashier_name VARCHAR(120) NOT NULL,
    initial_cash NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    expected_cash_in_drawer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'abierto'
);`;

  const sqlSeedSnippet = `-- ============================================================================
-- RESTO-XYZ: DATOS DE PRUEBA (SEED DATA - POSTGRESQL)
-- ============================================================================

BEGIN;

-- 1. ROLES Y PERFILES
INSERT INTO role_profiles (id, name, description, role_key, can_apply_discounts, can_cancel_orders, can_open_cash_shift, can_close_cash_shift, can_view_audit_logs, can_configure_catalog, can_manage_users, can_reopen_table)
VALUES
('role-admin', 'Administrador General', 'Control total del sistema', 'administrador', true, true, true, true, true, true, true, true),
('role-gerente', 'Gerente de Sucursal', 'Supervisión operativa y autorizaciones', 'gerente', true, true, true, true, true, false, false, true),
('role-cajero', 'Cajero Principal', 'Operación de caja y cobros omnicanal', 'cajero', false, false, true, true, false, false, false, false),
('role-mesero', 'Mesero / Salonero', 'Atención en salón y comandeo', 'mesero', false, false, false, false, false, false, false, false),
('role-chef', 'Jefe de Cocina (Chef)', 'Monitor KDS y despacho por estaciones', 'chef', false, false, false, false, false, false, false, false)
ON CONFLICT (id) DO NOTHING;

-- 2. USUARIOS
INSERT INTO users (id, name, role, pin, device, avatar, is_active)
VALUES
('u1', 'Carlos Mendoza', 'administrador', '1234', 'all_in_one', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', true),
('u2', 'Valeria Rojas', 'cajero', '2222', 'all_in_one', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', true),
('u3', 'Mateo Silveira', 'mesero', '3333', 'tablet', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true),
('u4', 'Chef Rodrigo Paz', 'chef', '4444', 'kds_monitor', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150', true),
('u5', 'Lucía Fernández', 'gerente', '5555', 'all_in_one', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', true)
ON CONFLICT (id) DO NOTHING;

-- 3. CANALES DE VENTA
INSERT INTO sales_channels (id, name, code, description, is_active, default_price_mode, default_delta)
VALUES
('mesa', 'Salón / Mesa', 'MESA', 'Consumo presencial en salones', true, 'base', 0.00),
('llevar', 'Para Llevar (Take Out)', 'LLEVAR', 'Venta en mostrador para retiro', true, 'delta', -0.50),
('delivery', 'Delivery Online', 'DELIVERY', 'Plataformas Uber Eats, Glovo y Rappi', true, 'delta', 1.80)
ON CONFLICT (id) DO NOTHING;

-- 4. MESAS Y SALONES
INSERT INTO restaurant_tables (id, number, salon_id, salon_name, seats, status, waiter_id, waiter_name, opened_at)
VALUES
('tab-1', 1, 'salon-1', 'Salón Principal', 4, 'ocupada', 'u3', 'Mateo Silveira', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('tab-2', 2, 'salon-1', 'Salón Principal', 2, 'disponible', NULL, NULL, NULL),
('tab-3', 3, 'salon-1', 'Salón Principal', 6, 'ocupada', 'u3', 'Mateo Silveira', CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
('tab-4', 4, 'salon-1', 'Salón Principal', 4, 'limpieza', NULL, NULL, NULL),
('tab-5', 5, 'salon-2', 'Terraza Exterior', 4, 'disponible', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. PRODUCTOS BASE (CATÁLOGO MAESTRO: COCINA INTERNA VS ARMADO)
INSERT INTO products (id, sku, name, description, category, cost, preparation_type, station, is_active)
VALUES
('prod-angus', 'INS-001', 'Carne Angus 200g', 'Medallón 100% Angus certificada', 'Carnes', 3.20, 'cocina_interna', 'parrilla', true),
('prod-brioche', 'INS-002', 'Pan Brioche Artesanal', 'Pan horneado diariamente con mantequilla', 'Panadería', 0.45, 'armado_menu', 'pase', true),
('prod-cheddar', 'INS-003', 'Queso Cheddar Fundido', 'Láminas de cheddar madurado', 'Lácteos', 0.60, 'armado_menu', 'pase', true),
('prod-tocino', 'INS-004', 'Tocino Crujiente Ahumado', 'Tiras de tocino ahumado a la plancha', 'Carnes', 0.85, 'cocina_interna', 'parrilla', true),
('prod-papas', 'INS-005', 'Papas Rústicas Corte Grueso', 'Papas con romero y sal marina', 'Guarniciones', 0.70, 'cocina_interna', 'freidora', true),
('prod-costillas', 'INS-009', 'Costillas BBQ St. Louis 500g', 'Costillar cocido a baja temperatura 8h', 'Carnes', 6.50, 'cocina_interna', 'parrilla', true)
ON CONFLICT (id) DO NOTHING;

-- 6. MENÚS Y COMBOS DE VENTA (MENU ITEMS)
INSERT INTO menu_items (id, sku, name, category, base_price, image_url, description, allow_discounts, station, is_active)
VALUES
('m1', 'MENU-001', 'Hamburguesa Clásica Angus', 'hamburguesas', 12.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', 'Carne Angus 200g, pan brioche, cheddar fundido y papas rústicas.', true, 'parrilla', true),
('m2', 'MENU-002', 'Doble Bacon Cheddar Burger', 'hamburguesas', 15.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500', 'Doble carne Angus, extra tocino, queso cheddar y papas fritas.', true, 'parrilla', true),
('m3', 'MENU-003', 'Costillas BBQ Ahumadas', 'cenas', 19.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', 'Medio costillar glaseado con salsa BBQ de la casa.', true, 'parrilla', true)
ON CONFLICT (id) DO NOTHING;

-- 7. PRODUCTOS INTERNOS DEL MENÚ CON ORDEN DE PREPARACIÓN
INSERT INTO menu_internal_products (id, menu_item_id, product_id, product_name, preparation_order)
VALUES
('mip-1', 'm1', 'prod-angus', 'Medallón Angus 200g', 1),
('mip-2', 'm1', 'prod-brioche', 'Pan Brioche Tostado', 2),
('mip-3', 'm1', 'prod-cheddar', 'Queso Cheddar Fundido', 3),
('mip-4', 'm1', 'prod-papas', 'Porción Papas Rústicas', 4)
ON CONFLICT (id) DO NOTHING;

-- 8. MODIFICADORES Y SUSTITUCIONES INTERNAS
INSERT INTO internal_product_modifiers (id, internal_product_id, name, price_delta, is_default)
VALUES
('mod-1', 'mip-1', 'Término Medio (3/4)', 0.00, true),
('mod-2', 'mip-1', 'Bien Cocida', 0.00, false),
('mod-4', 'mip-3', 'Cheddar Clásico', 0.00, true),
('mod-5', 'mip-3', 'Queso Suizo / Emmental', 0.80, false),
('mod-6', 'mip-4', 'Papas Rústicas Estándar', 0.00, true),
('mod-7', 'mip-4', 'Cambiar por Aros de Cebolla', 1.20, false)
ON CONFLICT (id) DO NOTHING;

-- 9. COMANDAS ACTIVAS EN CURSO
INSERT INTO orders (id, order_number, channel, table_id, table_number, salon_name, status, waiter_id, waiter_name, subtotal, tax_amount, total, notes)
VALUES
('ord-101', 101, 'mesa', 'tab-1', 1, 'Salón Principal', 'en_cocina', 'u3', 'Mateo Silveira', 27.50, 2.75, 30.25, 'Carne a término medio.'),
('ord-102', 102, 'mesa', 'tab-3', 3, 'Salón Principal', 'lista_para_servir', 'u3', 'Mateo Silveira', 39.00, 3.90, 42.90, 'Servicio rápido.')
ON CONFLICT (id) DO NOTHING;

-- 10. FACTURAS HISTÓRICAS EMITIDAS
INSERT INTO historical_invoices (id, document_number, ticket_number, date_time_str, iso_date, cashier_id, cashier_name, waiter_name, sales_channel, sales_channel_label, table_number, salon_name, subtotal, tax_amount, total_amount, total_charged, change_given, payment_method)
VALUES
('inv-1001', 'FAC-2026-000098', 98, '18/10/2026 13:45:12', '2026-10-18T13:45:12Z', 'u2', 'Valeria Rojas', 'Mateo Silveira', 'mesa', 'Mesa #4 (Salón Principal)', 4, 'Salón Principal', 33.50, 3.35, 36.85, 40.00, 3.15, 'Efectivo')
ON CONFLICT (id) DO NOTHING;

-- 11. DETALLE DE PRODUCTOS FACTURADOS
INSERT INTO historical_invoice_items (id, invoice_id, menu_item_id, name, sku, category, quantity, base_price, unit_price, subtotal, allow_discounts)
VALUES
('inv-item-1', 'inv-1001', 'm1', 'Hamburguesa Clásica Angus', 'MENU-001', 'hamburguesas', 2, 12.50, 12.50, 25.00, true)
ON CONFLICT (id) DO NOTHING;

-- 12. SUB-DETALLE DE PRODUCTOS INTERNOS FACTURADOS
INSERT INTO historical_invoice_internal_products (invoice_item_id, product_id, product_name, preparation_order, preparation_type, station, selected_option_name, price_delta)
VALUES
('inv-item-1', 'prod-angus', 'Medallón Angus 200g', 1, 'cocina_interna', 'parrilla', 'Término Medio (3/4)', 0.00),
('inv-item-1', 'prod-brioche', 'Pan Brioche Tostado', 2, 'armado_menu', 'pase', 'Pan Brioche Clásico', 0.00),
('inv-item-1', 'prod-cheddar', 'Queso Cheddar', 3, 'armado_menu', 'pase', 'Cheddar Fundido', 0.00),
('inv-item-1', 'prod-papas', 'Porción Papas Rústicas', 4, 'cocina_interna', 'freidora', 'Papas Rústicas Estándar', 0.00);

-- 13. TURNO DE CAJA
INSERT INTO cash_shifts (id, opened_at, cashier_id, cashier_name, initial_cash, cash_sales, total_sales, expected_cash_in_drawer, status)
VALUES
('shift-current', '18/10/2026 08:00:00', 'u2', 'Valeria Rojas', 150.00, 56.85, 85.58, 206.85, 'abierto')
ON CONFLICT (id) DO NOTHING;

COMMIT;`;

  return (
    <div className="flex-1 bg-slate-50 flex flex-col p-3 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Metodología Ágil (Sprint 2 Semanas) & Arquitectura DevOps
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Planificación ágil de Historias de Usuario (CU-01 a CU-13), Base de Datos PostgreSQL, Docker S3, Backend y Pipeline CI/CD.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 overflow-x-auto text-xs font-bold shadow-2xs">
          <button
            onClick={() => setActiveTab('sprint')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'sprint' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tablero Sprint (2 Semanas)
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'schema' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Esquema BD (PostgreSQL)
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'docker' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            docker-compose.yml
          </button>
          <button
            onClick={() => setActiveTab('nginx')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'nginx' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            nginx.conf
          </button>
          <button
            onClick={() => setActiveTab('s3')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 's3' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dockerfile
          </button>
          <button
            onClick={() => setActiveTab('cicd')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'cicd' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pipeline CI/CD
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'backend' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Backend C# .NET 8
          </button>
        </div>
      </div>

      {activeTab === 'sprint' && (
        <div className="mt-5 space-y-6">
          {/* Sprint Meta Banner */}
          <div className="bg-white border border-slate-300 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  SPRINT 1 - RESTO-XYZ MVP OMNICANAL
                </span>
                <span className="text-xs text-slate-500 font-mono">Duración: 10 días hábiles (2 semanas)</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Objetivo del Sprint: Entrega Integral de Flujos POS, KDS, Cobros y Despliegue en Contenedores
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase">VELOCIDAD DEL SPRINT</span>
                <span className="text-xl font-black text-emerald-700">{donePoints} / {totalPoints} Pts</span>
              </div>
              <div className="w-24 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${Math.round((donePoints / totalPoints) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Agile Ceremonies Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold block">DÍA 1: PLANNING</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Definición de Historias & Fichas Personas</span>
              <span className="text-[10px] text-slate-500">Estimación en Story Points Fibonacci</span>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-mono text-sky-700 uppercase font-bold block">DIARIOS: STANDUPS</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Sincronización 15 min a las 09:00</span>
              <span className="text-[10px] text-slate-500">Bloqueos de Tablets y KDS</span>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-mono text-purple-700 uppercase font-bold block">DÍA 10: DEMO REVIEW</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Demostración en Vivo del Flujo Wireframe</span>
              <span className="text-[10px] text-slate-500">Aprobación con Sofia, Carlos, Rodrigo y Elena</span>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block">DÍA 10: RETROSPECTIVA</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Mejora Continua y Calidad de Código</span>
              <span className="text-[10px] text-slate-500">Preparación para Sprint 2</span>
            </div>
          </div>

          {/* User Stories Cards */}
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              Historias de Usuario del Sprint (Mapeadas a Requerimientos):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sprintStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 flex flex-col justify-between transition group shadow-2xs hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-emerald-800 px-2 py-0.5 rounded">
                        {story.code}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {story.storyPoints} Story Points
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-sky-700 block mb-1">
                      {story.persona}
                    </span>

                    <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                      {story.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {story.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold mb-1">
                        Criterios de Aceptación:
                      </span>
                      <ul className="text-[10px] text-slate-600 space-y-0.5">
                        {story.acceptanceCriteria.map((ac, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span>{ac}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Día {story.dayAssigned}</span>
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      COMPLETADA ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docker' && (
        <div className="mt-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs">
            <span className="font-bold text-amber-900 block mb-1">
              ⚠️ ¿El puerto 8080 ya está ocupado en tu equipo?
            </span>
            <p className="text-amber-800 leading-relaxed mb-2">
              Si tu sistema muestra <code className="bg-amber-100 px-1 rounded font-mono">port is already allocated</code> o el puerto 8080 está en uso por otro programa, simplemente asigna cualquier otro puerto libre a tu máquina:
            </p>
            <div className="space-y-1.5 font-mono text-[11px] bg-amber-100/70 p-2.5 rounded-lg border border-amber-200 text-amber-950">
              <div><span className="text-slate-500 font-sans">Opción A (Puerto 8085):</span> <code className="font-bold">docker run -d -p 8085:80 --name mi-posventa posventa-app</code></div>
              <div><span className="text-slate-500 font-sans">Opción B (Puerto 3001):</span> <code className="font-bold">docker run -d -p 3001:80 --name mi-posventa posventa-app</code></div>
              <div><span className="text-slate-500 font-sans">Opción C (Puerto 8888):</span> <code className="font-bold">docker run -d -p 8888:80 --name mi-posventa posventa-app</code></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-sky-800 uppercase">
              docker-compose.yml (Orquestación de Multi-Contenedores)
            </span>
            <button
              onClick={() => copyToClipboard(dockerComposeSnippet, 'compose')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copiedKey === 'compose' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'compose' ? 'Copiado' : 'Copiar docker-compose.yml'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed shadow-sm">
            {dockerComposeSnippet}
          </pre>
        </div>
      )}

      {activeTab === 'nginx' && (
        <div className="mt-5 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs">
            <span className="font-bold text-emerald-800 block mb-1">
              ✓ Solución al error: &quot;host not found in upstream restoxyz-backend in default.conf:15&quot;
            </span>
            <p className="text-emerald-700 leading-relaxed">
              El error se producía porque Nginx intentaba resolver el host estático <code className="bg-emerald-100 px-1 rounded font-mono">restoxyz-backend</code> al arrancar el contenedor. Al cambiarlo por una variable con <code className="bg-emerald-100 px-1 rounded font-mono">resolver 127.0.0.11</code> y respuesta de contingencia, Nginx ya no se detiene y arranca perfectamente de inmediato.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-teal-800 uppercase">
              nginx.conf (Configuración Corregida)
            </span>
            <button
              onClick={() => copyToClipboard(nginxSnippet, 'nginx')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copiedKey === 'nginx' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'nginx' ? 'Copiado' : 'Copiar nginx.conf'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed shadow-sm">
            {nginxSnippet}
          </pre>
        </div>
      )}

      {activeTab === 's3' && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-800 uppercase">
              Dockerfile (Multi-Stage Build para Producción)
            </span>
            <button
              onClick={() => copyToClipboard(dockerfileSnippet, 'dockerfile')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copiedKey === 'dockerfile' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'dockerfile' ? 'Copiado' : 'Copiar Dockerfile'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed shadow-sm">
            {dockerfileSnippet}
          </pre>
        </div>
      )}

      {activeTab === 'cicd' && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-800 uppercase">
              .github/workflows/ci-cd.yml (Pipeline Automatizado)
            </span>
            <button
              onClick={() => copyToClipboard(cicdSnippet, 'cicd')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copiedKey === 'cicd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'cicd' ? 'Copiado' : 'Copiar Pipeline CI/CD'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed shadow-sm">
            {cicdSnippet}
          </pre>
        </div>
      )}

      {activeTab === 'backend' && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase">
              Program.cs (Backend C# .NET 8 WebAPI + SignalR + S3 Client)
            </span>
            <button
              onClick={() => copyToClipboard(csharpSnippet, 'csharp')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copiedKey === 'csharp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'csharp' ? 'Copiado' : 'Copiar Program.cs'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed shadow-sm">
            {csharpSnippet}
          </pre>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="mt-5 space-y-4">
          {/* Sub-tabs: DDL vs Seed Data */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSchemaSubTab('ddl')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  schemaSubTab === 'ddl'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                1. Esquema DDL (database/schema.sql)
              </button>
              <button
                type="button"
                onClick={() => setSchemaSubTab('seed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  schemaSubTab === 'seed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                2. Datos de Prueba (database/seed.sql)
              </button>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  schemaSubTab === 'ddl' ? sqlSchemaSnippet : sqlSeedSnippet,
                  schemaSubTab === 'ddl' ? 'schema_ddl' : 'schema_seed'
                )
              }
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {(schemaSubTab === 'ddl' && copiedKey === 'schema_ddl') ||
              (schemaSubTab === 'seed' && copiedKey === 'schema_seed') ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>
                {schemaSubTab === 'ddl'
                  ? copiedKey === 'schema_ddl'
                    ? 'Copiado'
                    : 'Copiar Esquema DDL'
                  : copiedKey === 'schema_seed'
                  ? 'Copiado'
                  : 'Copiar Datos de Prueba (Seed)'}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-600 font-mono">
            {schemaSubTab === 'ddl'
              ? '📄 Script DDL de creación de tablas, llaves primarias, foráneas e índices (PostgreSQL / Relacional).'
              : '🌱 Script de inserción con registros iniciales de prueba (roles, usuarios, catálogo, órdenes, facturas históricas y caja).'}
          </div>

          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed shadow-sm max-h-[600px]">
            {schemaSubTab === 'ddl' ? sqlSchemaSnippet : sqlSeedSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
