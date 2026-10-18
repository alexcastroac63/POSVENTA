/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, OrderItem } from '../../types/restaurant';
import {
  ChefHat,
  Clock,
  CheckCircle,
  Bell,
  Filter,
  Volume2,
  VolumeX,
  LogOut,
  ArrowRight,
  Flame,
  Zap,
  Layers,
  UtensilsCrossed,
  Sparkles,
  Store,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const KitchenDisplayScreen: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    updateItemKitchenStatus,
    showToast,
    setCurrentScreen,
    setDeviceMode,
    branch,
    currentUser,
  } = useRestaurant();

  const [stationFilter, setStationFilter] = useState<
    'todas' | 'parrilla' | 'barra' | 'freidora' | 'pase' | 'ensamblado'
  >('todas');
  const [audioEnabled, setAudioEnabled] = useState(true);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // fallback
    }
  };

  const kitchenOrders = orders.filter(
    (o) => o.status === 'en_cocina' || o.status === 'abierta' || o.status === 'lista_para_servir'
  );

  const countEnCocina = kitchenOrders.filter((o) => o.status === 'en_cocina' || o.status === 'abierta').length;
  const countListas = kitchenOrders.filter((o) => o.status === 'lista_para_servir').length;

  const handleMarkAllOrderReady = (order: Order) => {
    updateOrderStatus(order.id, 'lista_para_servir');
    if (audioEnabled) playChime();
    showToast(`🔔 ¡Orden #${order.orderNumber} marcada LISTA PARA SERVIR! Notificando a salón.`);
  };

  const handleToggleItem = (order: Order, item: OrderItem) => {
    const nextStatus = item.status === 'listo' ? 'preparando' : 'listo';
    updateItemKitchenStatus(order.id, item.id, nextStatus);
    if (audioEnabled && nextStatus === 'listo') playChime();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Standalone KDS Navigation Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800 shadow-md sticky top-0 z-40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Brand & Standalone KDS Identification */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xs flex-shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  APLICACIÓN COMPLEMENTARIA INDEPENDIENTE
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  • Fuera del POS
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                <span>KDS • MONITOR INDUSTRIAL DE COCINA & DESPACHO</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
              </h1>
            </div>
          </div>

          {/* Action Controls & Navigation Outside POS */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Audio chime toggle */}
            <button
              onClick={() => {
                const nextState = !audioEnabled;
                setAudioEnabled(nextState);
                if (nextState) playChime();
                showToast(`Alerta sonora de cocina: ${nextState ? 'ACTIVADA' : 'SILENCIADA'}`);
              }}
              title="Activar o silenciar avisos sonoros de comanda"
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95 ${
                audioEnabled
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>Sonido {audioEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Active Orders Count Badge */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{kitchenOrders.length} Comandas</span>
            </div>

            {/* Open POS terminal button */}
            <button
              onClick={() => {
                setCurrentScreen('channel_select');
                setDeviceMode('responsive');
                showToast('Ingresando al Terminal POS');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              title="Abrir terminal de punto de venta"
            >
              <span>Abrir POS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Return to Login / Start portal */}
            <button
              onClick={() => {
                setCurrentScreen('login');
                showToast('Sesión de KDS cerrada. Regresando al portal de inicio.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer active:scale-95"
              title="Salir al portal principal de inicio"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Salir al Login</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Stations & Filters */}
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Station Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1 uppercase">
              <Filter className="w-3 h-3 text-amber-400" /> Estación:
            </span>
            {[
              { id: 'todas', label: 'Todas las Estaciones', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'parrilla', label: 'Parrilla / Grill', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
              { id: 'freidora', label: 'Freidora & Fritos', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
              { id: 'barra', label: 'Barra & Bebidas', icon: <UtensilsCrossed className="w-3.5 h-3.5 text-sky-400" /> },
              { id: 'pase', label: 'Pase / Platos Fríos', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStationFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
                  stationFilter === st.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {st.icon}
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Status Breakdown */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
              En Cocina: {countEnCocina}
            </span>
            <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              Listas para Servir: {countListas}
            </span>
          </div>
        </div>
      </header>

      {/* Main KDS Grid Canvas */}
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
        {kitchenOrders.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-500 mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-black text-slate-200 uppercase tracking-tight">
              Línea de Cocina al Día
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No hay comandas pendientes de cocción en este momento. Las nuevas órdenes ingresadas desde el salón, delivery o mostrador aparecerán aquí automáticamente con timbre de aviso.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kitchenOrders.map((order, idx) => {
              const elapsedMins = 8 + idx * 5;
              const isDelayed = elapsedMins >= 15;
              const isWarning = elapsedMins >= 10 && elapsedMins < 15;

              let timerBadge = 'bg-emerald-950 text-emerald-300 border-emerald-800';
              if (isDelayed) timerBadge = 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse';
              else if (isWarning) timerBadge = 'bg-amber-950 text-amber-300 border-amber-700';

              const filteredItems = order.items.filter((item) => {
                if (stationFilter === 'todas') return true;
                return item.station === stationFilter;
              });

              if (filteredItems.length === 0) return null;

              const isAllReady = order.items.every((i) => i.status === 'listo');

              return (
                <div
                  key={order.id}
                  className={`border-2 rounded-2xl flex flex-col justify-between overflow-hidden shadow-lg transition bg-slate-900 ${
                    isDelayed
                      ? 'border-rose-500 ring-1 ring-rose-500/20'
                      : isAllReady
                      ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Order Card Header */}
                  <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-mono">
                          ORDEN #{order.orderNumber}
                        </span>
                        {order.platformName && (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-2xs">
                            {order.platformName}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-amber-400 block mt-0.5">
                        {order.tableNumber ? `Salón - MESA ${order.tableNumber}` : 'PARA LLEVAR / DELIVERY'}
                      </span>
                    </div>

                    {/* Timer Badge */}
                    <div
                      className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-black shadow-xs ${timerBadge}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsedMins} min</span>
                    </div>
                  </div>

                  {/* Items Checklist Area */}
                  <div className="p-3.5 flex-1 space-y-2.5 overflow-y-auto max-h-[340px]">
                    {filteredItems.map((item) => {
                      const isDone = item.status === 'listo';

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(order, item)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 select-none ${
                            isDone
                              ? 'bg-emerald-950/40 border-emerald-800/80 opacity-70'
                              : 'bg-slate-800/70 border-slate-700/80 hover:border-amber-500 hover:bg-slate-800'
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition flex-shrink-0 ${
                              isDone
                                ? 'border-emerald-500 bg-emerald-600 text-white'
                                : 'border-slate-600 bg-slate-900'
                            }`}
                          >
                            {isDone && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="flex-1 overflow-hidden">
                            <div
                              className={`text-xs font-bold leading-tight ${
                                isDone ? 'line-through text-slate-500' : 'text-slate-100'
                              }`}
                            >
                              <span className="text-amber-400 font-mono font-black">{item.quantity}x</span>{' '}
                              <span>{item.name}</span>
                            </div>

                            {/* Station & Preparation Process Badge */}
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono uppercase bg-slate-900 border border-slate-700 text-slate-300 px-1.5 py-0.2 rounded">
                                Estación: {item.station || 'parrilla'}
                              </span>
                            </div>

                            {/* Modifiers List */}
                            {item.selectedModifiers.length > 0 && (
                              <div className="text-[11px] text-amber-200/90 font-mono mt-1 space-y-0.5 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                                {item.selectedModifiers.map((mod, i) => (
                                  <div key={i} className="flex items-center justify-between">
                                    <span>• {mod.groupName}: <strong>{mod.optionName}</strong></span>
                                    {mod.priceDelta > 0 && (
                                      <span className="text-[9px] text-amber-400 font-bold font-mono">
                                        (+${mod.priceDelta.toFixed(2)})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Kitchen Notes */}
                            {item.notes && (
                              <div className="text-[10px] text-rose-300 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800 mt-1 inline-block">
                                ⚠️ Nota: {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Footer */}
                  <div className="p-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-400 font-mono">
                      Mesero: <strong className="text-slate-200">{order.waiterName}</strong>
                    </div>

                    <button
                      onClick={() => handleMarkAllOrderReady(order)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isAllReady
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          : 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-black shadow-xs'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isAllReady ? 'Listo Despachado' : 'Listo para Servir'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Industrial KDS Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-500" />
          <span>{branch} • KDS Monitor de Cocina</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Línea Activa: Rodrigo (Chef)</span>
          <span className="text-emerald-400 font-bold">• Sincronizado en Tiempo Real</span>
        </div>
      </footer>
    </div>
  );
};

