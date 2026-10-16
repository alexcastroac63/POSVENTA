/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
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
    currentUser,
    tables,
  } = useRestaurant();

  const [selectedPlatform, setSelectedPlatform] = useState<'Uber Eats' | 'Glovo' | 'Rappi'>('Uber Eats');
  const occupiedTablesCount = tables.filter((t) => t.status === 'ocupada').length;

  return (
    <div className="flex-1 bg-slate-50 flex flex-col justify-between p-4 sm:p-8 select-none font-sans overflow-y-auto">
      {/* Header Info */}
      <div className="text-center max-w-2xl mx-auto my-4 sm:my-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 mb-2.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Arquitectura Omnicanal Sincronizada
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
          Seleccione el Canal de Atención
        </h2>
        <p className="text-sm text-slate-500 mt-1.5">
          Las tarifas, listas de precios e impresiones de comanda se adaptan automáticamente según el canal seleccionado.
        </p>
      </div>

      {/* 3 Channel Cards (CANAL A, CANAL B, CANAL C) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto my-auto">
        {/* CANAL A: MESA */}
        <button
          onClick={() => startChannelOrder('mesa')}
          className="bg-white border-2 border-slate-200 hover:border-emerald-600 p-6 sm:p-8 rounded-3xl flex flex-col items-center text-center transition group hover:shadow-lg relative active:scale-98 cursor-pointer"
        >
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition shadow-2xs">
            <UtensilsCrossed className="w-10 h-10" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
            CANAL A
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mb-2 group-hover:text-emerald-700 transition">
            MESA (Salón)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Servicio a pie de mesa, comanda por salón, precuentas impresas y división de cuentas por comensal.
          </p>
          <div className="mt-auto w-full pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
            <span>{occupiedTablesCount} Mesas activas</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* CANAL B: LLEVAR */}
        <button
          onClick={() => startChannelOrder('llevar')}
          className="bg-white border-2 border-slate-200 hover:border-sky-600 p-6 sm:p-8 rounded-3xl flex flex-col items-center text-center transition group hover:shadow-lg relative active:scale-98 cursor-pointer"
        >
          <div className="w-20 h-20 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-5 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition shadow-2xs">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
            CANAL B
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mb-2 group-hover:text-sky-700 transition">
            LLEVAR (Take Out)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Atención rápida en mostrador, empaque para llevar, cobro expedito y aviso por turno de recogida.
          </p>
          <div className="mt-auto w-full pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-sky-700 font-bold">
            <span>Tarifa Mostrador</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* CANAL C: PLATAFORMAS */}
        <div className="bg-white border-2 border-slate-200 hover:border-amber-500 p-6 sm:p-8 rounded-3xl flex flex-col items-center text-center transition group hover:shadow-lg relative">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition shadow-2xs">
            <Bike className="w-10 h-10" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
            CANAL C
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mb-2 group-hover:text-amber-700 transition">
            PLATAFORMAS
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Tarifas diferenciadas automáticas (+18%), gestión de repartidores y visibilidad de platillos por plataforma.
          </p>

          {/* Platform selector */}
          <div className="w-full grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mb-4 text-[11px] font-bold">
            {(['Uber Eats', 'Glovo', 'Rappi'] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`py-1.5 rounded-lg transition cursor-pointer ${
                  selectedPlatform === plat
                    ? 'bg-amber-500 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {plat.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => startChannelOrder('delivery', selectedPlatform)}
            className="w-full mt-auto bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold py-3 px-4 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Abrir en {selectedPlatform}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Footer 3 Boxes */}
      <div className="w-full max-w-5xl mx-auto pt-6 mt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <Store className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">SUCURSAL</span>
            <span className="text-xs font-bold text-slate-800 truncate block">{branch}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <MonitorCheck className="w-5 h-5 text-sky-600 flex-shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">EQUIPO / TERMINAL</span>
            <span className="text-xs font-bold text-slate-800 truncate block">{currentUser.device}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <UserCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">USUARIO ACTIVO</span>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {currentUser.name} ({currentUser.role.toUpperCase()})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
