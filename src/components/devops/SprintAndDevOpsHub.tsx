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
  const [activeTab, setActiveTab] = useState<'sprint' | 'docker' | 's3' | 'cicd' | 'backend'>('sprint');
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

  const dockerComposeSnippet = `version: '3.8'

services:
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

  # 3. Docker tipo S3 para almacenamiento de imágenes (MinIO S3-Compatible)
  minio-s3:
    image: minio/minio:latest
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

  const dockerfileSnippet = `# PASO 1: Construir la imagen localmente antes de ejecutar:
# docker build -t posventa-app .
#
# PASO 2: Levantar el contenedor:
# docker run -d -p 9090:80 --name mi-posventa posventa-app
# (Acceder en http://localhost:9090)

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

      - name: Build & Push Frontend Image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ghcr.io/\${{ github.repository }}/restoxyz-ui:latest

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
            Planificación ágil de Historias de Usuario (CU-01 a CU-13), Docker S3, Backend y Pipeline CI/CD.
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
            onClick={() => setActiveTab('docker')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'docker' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            docker-compose.yml
          </button>
          <button
            onClick={() => setActiveTab('s3')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 's3' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Almacenamiento S3 (MinIO)
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
            Backend C# .NET 8 / SignalR
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
    </div>
  );
};
