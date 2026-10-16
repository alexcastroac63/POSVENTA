/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Banknote,
  CreditCard,
  Ticket,
  QrCode,
  DollarSign,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';

export const CashierManagementScreen: React.FC = () => {
  const {
    cashShift,
    currentUser,
    performCashCut,
    closeDailyShift,
    showToast,
  } = useRestaurant();

  const [countedCash, setCountedCash] = useState<string>(
    cashShift.expectedCashInDrawer.toFixed(2)
  );
  const [showCutSuccess, setShowCutSuccess] = useState(false);

  const numCounted = parseFloat(countedCash) || 0;
  const difference = +(numCounted - cashShift.expectedCashInDrawer).toFixed(2);

  const handleCorteX = () => {
    performCashCut(numCounted);
    setShowCutSuccess(true);
    setTimeout(() => setShowCutSuccess(false), 3000);
  };

  const handleCierreZ = () => {
    closeDailyShift(numCounted);
  };

  return (
    <div className="flex-1 bg-slate-900 flex flex-col p-3 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Control de Caja y Turnos (Carlos - Cajero)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Arqueo en tiempo real, cortes parciales X y cierre diario Z con cuadratura financiera (CU-08, CU-09).
          </p>
        </div>

        {/* Shift status badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              cashShift.status === 'abierto'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cashShift.status === 'abierto' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            ></span>
            <span>TURNO {cashShift.status.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Fondo Inicial</span>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            ${cashShift.initialCash.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Apertura: {cashShift.openedAt}</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Ventas Efectivo</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            ${cashShift.cashSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Cobros en moneda</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Ventas Tarjeta</span>
            <CreditCard className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-black text-sky-400 font-mono">
            ${cashShift.cardSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">TPV / POS Bancario</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Vales / Despensa</span>
            <Ticket className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-400 font-mono">
            ${cashShift.voucherSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Cupones y Vales</span>
        </div>

        <div className="bg-slate-950 border-2 border-emerald-500/30 rounded-2xl p-4 bg-emerald-950/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-bold text-emerald-400">Total Facturado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${cashShift.totalSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Omnicanal acumulado</span>
        </div>
      </div>

      {/* Main Reconciliation Box (Arqueo y Cuadratura) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Calculation Card (Cols 7) */}
        <div className="lg:col-span-7 bg-slate-950 border-2 border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-4">
              CUADRATURA FINANCIERA DEL CAJÓN DE DINERO
            </span>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300">Fondo Inicial Apertura:</span>
                <span className="text-sm font-mono font-bold text-white">${cashShift.initialCash.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300">(+) Total Ventas Efectivo:</span>
                <span className="text-sm font-mono font-bold text-emerald-400">+${cashShift.cashSales.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-slate-900 border-2 border-emerald-500/40 rounded-xl">
                <div>
                  <span className="text-xs font-black uppercase text-white block">
                    TOTAL ESPERADO EN CAJÓN:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Fondo inicial + Ventas netas en efectivo
                  </span>
                </div>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ${cashShift.expectedCashInDrawer.toFixed(2)}
                </span>
              </div>

              {/* Counted Cash Input */}
              <div className="pt-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                  Efectivo Físico Contado en Cajón (Arqueo):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl pl-8 pr-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Difference Status */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  difference === 0
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : difference > 0
                    ? 'bg-sky-950/40 border-sky-500/50 text-sky-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {difference === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <div>
                    <span className="text-xs font-bold block">
                      {difference === 0
                        ? 'Cuadratura Exacta (Sin discrepancias)'
                        : difference > 0
                        ? `Sobrante en Caja (+$${difference})`
                        : `Faltante en Caja (-$${Math.abs(difference)})`}
                    </span>
                    <span className="text-[10px] opacity-80">
                      Diferencia entre el efectivo registrado y el contado físicamente
                    </span>
                  </div>
                </div>
                <span className="text-lg font-mono font-black">${difference.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-3 mt-6">
            <button
              onClick={handleCorteX}
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Realizar Corte Parcial (X)</span>
            </button>

            <button
              onClick={handleCierreZ}
              className="flex-1 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
            >
              <Lock className="w-4 h-4" />
              <span>Cierre Diario de Caja (Z)</span>
            </button>
          </div>
        </div>

        {/* Right: Cashier Info & Operational Guide (Cols 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
              FICHA DEL OPERADOR DE CAJA
            </span>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h4 className="text-sm font-black text-white">{currentUser.name}</h4>
                <span className="text-xs text-emerald-400 font-medium">Cajero Principal Titular</span>
                <span className="text-[10px] text-slate-500 block">Terminal #01 (All-in-One Touch)</span>
              </div>
            </div>

            <div className="pt-3 text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <p>• El <strong>Corte Parcial X</strong> permite el cambio de turno entre cajeros sin cerrar el folio fiscal.</p>
              <p>• El <strong>Cierre Diario Z</strong> consolida la jornada y bloquea nuevas transacciones hasta la siguiente apertura de turno.</p>
            </div>
          </div>

          {/* Quick Denomination Counter Tile */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              AUDITORÍA DE CORTE
            </span>
            <p className="text-xs text-slate-400">
              Cada corte queda grabado en la bitácora inmutable de auditoría para revisión de gerencia (Elena Sandoval).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
