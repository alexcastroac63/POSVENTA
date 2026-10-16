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

  return (
    <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none font-sans">
      {/* Wireframe Browser Shell (Executive Light Theme) */}
      <div className="w-full max-w-5xl bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[580px]">
        {/* Wireframe Browser Header Bar */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 text-slate-600">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:text-slate-900 transition"><ArrowLeft className="w-4 h-4" /></button>
            <button className="p-1 hover:text-slate-900 transition"><ArrowRight className="w-4 h-4" /></button>
            <button className="p-1 hover:text-slate-900 transition"><RotateCw className="w-4 h-4" /></button>
            <button className="p-1 hover:text-slate-900 transition"><Home className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 max-w-md bg-white border border-slate-300 rounded-md px-3 py-1 text-xs text-center text-slate-600 font-mono shadow-2xs">
            https://pos.restoxyz.internal/channels
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Selección de Canal de Venta
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center items-center bg-slate-50/70">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Arquitectura Omnicanal Sincronizada
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Seleccione el Canal de Atención
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mt-1">
              Las tarifas, listas de precios e impresiones de comanda se adaptan automáticamente según el canal elegido.
            </p>
          </div>

          {/* 3 Channel Cards (Matches CANAL A, CANAL B, CANAL C in Blank diagram (7).svg) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {/* CANAL A: MESA */}
            <button
              onClick={() => startChannelOrder('mesa')}
              className="bg-white border-2 border-slate-200 hover:border-emerald-600 p-6 rounded-2xl flex flex-col items-center text-center transition group hover:shadow-lg relative active:scale-98 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition">
                <UtensilsCrossed className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                CANAL A
              </span>
              <h3 className="text-xl font-black text-slate-900 uppercase mb-2 group-hover:text-emerald-700 transition">
                MESA (Salón)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Servicio a pie de mesa, comanda por salón, precuentas impresas y división de cuentas por comensal.
              </p>
              <div className="mt-auto w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span>{occupiedTablesCount} Mesas activas</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* CANAL B: LLEVAR */}
            <button
              onClick={() => startChannelOrder('llevar')}
              className="bg-white border-2 border-slate-200 hover:border-sky-600 p-6 rounded-2xl flex flex-col items-center text-center transition group hover:shadow-lg relative active:scale-98 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-4 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                CANAL B
              </span>
              <h3 className="text-xl font-black text-slate-900 uppercase mb-2 group-hover:text-sky-700 transition">
                LLEVAR (Take Out)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Atención rápida en mostrador, empaque para llevar, cobro expedito y aviso por turno de recogida.
              </p>
              <div className="mt-auto w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-sky-700 font-bold">
                <span>Tarifa Mostrador</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* CANAL C: PLATAFORMAS */}
            <div className="bg-white border-2 border-slate-200 hover:border-amber-500 p-6 rounded-2xl flex flex-col items-center text-center transition group hover:shadow-lg relative">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition">
                <Bike className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                CANAL C
              </span>
              <h3 className="text-xl font-black text-slate-900 uppercase mb-2 group-hover:text-amber-700 transition">
                PLATAFORMAS
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Tarifas diferenciadas automáticas (+18%), gestión de repartidores y visibilidad de platillos por plataforma.
              </p>

              {/* Platform selector */}
              <div className="w-full grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 mb-3 text-[11px] font-bold">
                {(['Uber Eats', 'Glovo', 'Rappi'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setSelectedPlatform(plat)}
                    className={`py-1 rounded transition cursor-pointer ${
                      selectedPlatform === plat
                        ? 'bg-amber-500 text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {plat.split(' ')[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => startChannelOrder('delivery', selectedPlatform)}
                className="w-full mt-auto bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold py-2 px-3 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Abrir en {selectedPlatform}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer 3 Boxes (Faithful to Blank diagram (7).svg: SUCURSAL, EQUIPO, USUARIO) */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs">
            <Store className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">SUCURSAL</span>
              <span className="text-xs font-bold text-slate-800 truncate block">{branch}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs">
            <MonitorCheck className="w-5 h-5 text-sky-600 flex-shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">EQUIPO / DISPOSITIVO</span>
              <span className="text-xs font-bold text-slate-800 truncate block">{currentUser.device}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs">
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
    </div>
  );
};
