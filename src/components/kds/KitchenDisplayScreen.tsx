/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, OrderItem } from '../../types/restaurant';
import {
  ChefHat,
  Clock,
  CheckCircle,
  Bell,
  Flame,
  Wine,
  Utensils,
  Filter,
  Volume2,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

export const KitchenDisplayScreen: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    updateItemKitchenStatus,
    showToast,
  } = useRestaurant();

  const [stationFilter, setStationFilter] = useState<'todas' | 'parrilla' | 'barra' | 'freidora' | 'pase'>('todas');
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Play beep sound simulation
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext fallback
    }
  };

  // Kitchen active orders (in preparation or queued)
  const kitchenOrders = orders.filter(
    (o) => o.status === 'en_cocina' || o.status === 'abierta' || o.status === 'lista_para_servir'
  );

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
    <div className="flex-1 bg-slate-950 flex flex-col p-3 sm:p-5 font-sans select-none overflow-y-auto">
      {/* Top KDS Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                KDS - Sistema de Pantalla de Cocina (Chef Rodrigo)
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Recepción automática, temporizadores con semáforo y enrutamiento por estación (CU-01, CU-12).
            </p>
          </div>
        </div>

        {/* Audio notification toggle & live clock */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              audioEnabled
                ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Alerta Sonora {audioEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Station Filters */}
      <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-800 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Estación:
        </span>
        {[
          { id: 'todas', label: 'Todas las Estaciones' },
          { id: 'parrilla', label: 'Parrilla / Grill' },
          { id: 'freidora', label: 'Freidora & Fritos' },
          { id: 'barra', label: 'Barra & Bebidas' },
          { id: 'pase', label: 'Pase / Platos Fríos' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => setStationFilter(st.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              stationFilter === st.id
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Kitchen Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
        {kitchenOrders.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
            <CheckCircle className="w-16 h-16 stroke-1 text-emerald-500 mb-3" />
            <h3 className="text-lg font-bold text-white">Línea de Cocina al Día</h3>
            <p className="text-xs text-slate-400 mt-1">No hay comandas pendientes de preparación en este momento.</p>
          </div>
        ) : (
          kitchenOrders.map((order, idx) => {
            // Simulated elapsed minutes
            const elapsedMins = 8 + (idx * 5);
            const isDelayed = elapsedMins >= 15;
            const isWarning = elapsedMins >= 10 && elapsedMins < 15;

            // Timer color scheme
            let timerBadge = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
            if (isDelayed) timerBadge = 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse';
            else if (isWarning) timerBadge = 'bg-amber-950 text-amber-300 border-amber-500';

            const filteredItems = order.items.filter((item) => {
              if (stationFilter === 'todas') return true;
              return item.station === stationFilter;
            });

            if (filteredItems.length === 0) return null;

            const isAllReady = order.items.every((i) => i.status === 'listo');

            return (
              <div
                key={order.id}
                className={`border-2 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl transition ${
                  isDelayed
                    ? 'border-rose-500 bg-slate-900/90'
                    : isAllReady
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                {/* Order Header Card */}
                <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white font-mono">
                        ORDEN #{order.orderNumber}
                      </span>
                      {order.platformName && (
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                          {order.platformName}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                      {order.tableNumber ? `Salón - MESA ${order.tableNumber}` : 'PARA LLEVAR / DELIVERY'}
                    </span>
                  </div>

                  {/* Timer Badge (Semáforo de tiempos) */}
                  <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 text-xs font-mono font-bold ${timerBadge}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsedMins} min</span>
                  </div>
                </div>

                {/* Items Checklist Area */}
                <div className="p-3.5 flex-1 space-y-2.5 overflow-y-auto max-h-[300px]">
                  {filteredItems.map((item) => {
                    const isDone = item.status === 'listo';

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(order, item)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 select-none ${
                          isDone
                            ? 'bg-emerald-950/30 border-emerald-500/40 opacity-70'
                            : 'bg-slate-950 border-slate-800 hover:border-amber-500'
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition flex-shrink-0 ${
                            isDone
                              ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {isDone && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <div className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.quantity}x {item.name}
                          </div>

                          {/* Modifiers & Substitutions */}
                          {item.selectedModifiers.length > 0 && (
                            <div className="text-[10px] text-amber-300 font-mono mt-0.5 space-y-0.5">
                              {item.selectedModifiers.map((mod, i) => (
                                <div key={i}>• {mod.groupName}: {mod.optionName}</div>
                              ))}
                            </div>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <div className="text-[10px] text-rose-300 font-bold bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/30 mt-1 inline-block">
                              ⚠️ {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action footer */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Mesero: {order.waiterName}
                  </div>

                  <button
                    onClick={() => handleMarkAllOrderReady(order)}
                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
                      isAllReady
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                        : 'bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Listo para Servir</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
