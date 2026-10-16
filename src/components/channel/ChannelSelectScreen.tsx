/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { SalesChannel } from '../../types/restaurant';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Store,
  MonitorCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const ChannelSelectScreen: React.FC = () => {
  const {
    startChannelOrder,
    branch,
    terminalId,
    currentUser,
    orders,
    tables,
  } = useRestaurant();

  const [selectedPlatform, setSelectedPlatform] = useState<'Uber Eats' | 'Glovo' | 'Rappi'>('Uber Eats');

  const occupiedTablesCount = tables.filter((t) => t.status === 'ocupada').length;
  const activeDeliveryOrdersCount = orders.filter(
    (o) => o.channel === 'delivery' && (o.status === 'en_cocina' || o.status === 'abierta')
  ).length;

  return (
    <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-3 sm:p-6 select-none font-sans">
      {/* Wireframe Browser Shell */}
      <div className="w-full max-w-5xl bg-slate-950 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[580px]">
        {/* Wireframe Browser Header Bar */}
        <div className="bg-slate-800 px-4 py-2.5 border-b-2 border-slate-700 flex items-center justify-between gap-3 text-slate-300">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:text-white transition"><ArrowLeft className="w-4 h-4" /></button>
            <button className="p-1 hover:text-white transition"><ArrowRight className="w-4 h-4" /></button>
            <button className="p-1 hover:text-white transition"><RotateCw className="w-4 h-4" /></button>
            <button className="p-1 hover:text-white transition"><Home className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 max-w-md bg-slate-900 border border-slate-600 rounded-md px-3 py-1 text-xs text-center text-slate-400 font-mono">
            https://pos.restoxyz.internal/channels
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Selección de Canal de Venta
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center items-center bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Arquitectura Omnicanal Sincronizada
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Seleccione el Canal de Atención
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mt-1">
              Las tarifas, listas de precios e impresiones de comanda se adaptan automáticamente según el canal elegido.
            </p>
          </div>

          {/* 3 Channel Cards (Matches CANAL A, CANAL B, CANAL C in Blank diagram (7).svg) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {/* CANAL A: MESA */}
            <button
              onClick={() => startChannelOrder('mesa')}
              className="bg-slate-900 border-2 border-slate-700 hover:border-emerald-500 p-6 rounded-2xl flex flex-col items-center text-center transition group hover:shadow-xl hover:shadow-emerald-950/40 relative active:scale-98"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                <UtensilsCrossed className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                CANAL A
              </span>
              <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-emerald-400 transition">
                MESA (Salón)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Servicio a pie de mesa, comanda por salón, precuentas impresas y división de cuentas por comensal.
              </p>
              <div className="mt-auto w-full pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>{occupiedTablesCount} Mesas activas</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* CANAL B: LLEVAR */}
            <button
              onClick={() => startChannelOrder('llevar')}
              className="bg-slate-900 border-2 border-slate-700 hover:border-sky-500 p-6 rounded-2xl flex flex-col items-center text-center transition group hover:shadow-xl hover:shadow-sky-950/40 relative active:scale-98"
            >
              <div className="w-16 h-16 rounded-2xl bg-sky-900/40 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                CANAL B
              </span>
              <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-sky-400 transition">
                LLEVAR (Take Out)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Atención rápida en mostrador, empaque para llevar, cobro expedito y aviso por turno de recogida.
              </p>
              <div className="mt-auto w-full pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-sky-400 font-semibold">
                <span>Tarifa Mostrador</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* CANAL C: PLATAFORMAS */}
            <div className="bg-slate-900 border-2 border-slate-700 hover:border-amber-500 p-6 rounded-2xl flex flex-col items-center text-center transition group hover:shadow-xl hover:shadow-amber-950/40 relative">
              <div className="w-16 h-16 rounded-2xl bg-amber-900/40 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
                <Bike className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                CANAL C
              </span>
              <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-amber-400 transition">
                PLATAFORMAS
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Tarifas diferenciadas automáticas, gestión de repartidores y visibilidad de platillos por plataforma.
              </p>

              {/* Platform selector */}
              <div className="w-full grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 mb-3 text-[11px] font-bold">
                {(['Uber Eats', 'Glovo', 'Rappi'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setSelectedPlatform(plat)}
                    className={`py-1 rounded ${
                      selectedPlatform === plat
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {plat.split(' ')[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => startChannelOrder('delivery', selectedPlatform)}
                className="w-full mt-auto bg-amber-600 hover:bg-amber-500 active:scale-98 text-slate-950 font-bold py-2 px-3 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <span>Abrir en {selectedPlatform}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer 3 Boxes (Faithful to Blank diagram (7).svg: SUCURSAL, EQUIPO, USUARIO) */}
        <div className="bg-slate-900 border-t-2 border-slate-700 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <Store className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">SUCURSAL</span>
              <span className="text-xs font-bold text-white truncate block">{branch}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <MonitorCheck className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">EQUIPO / DISPOSITIVO</span>
              <span className="text-xs font-bold text-white truncate block">{currentUser.device}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">USUARIO ACTIVO</span>
              <span className="text-xs font-bold text-white truncate block">
                {currentUser.name} ({currentUser.role.toUpperCase()})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
