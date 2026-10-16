/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Table } from '../../types/restaurant';
import {
  Users,
  Clock,
  DollarSign,
  ArrowRight,
  Merge,
  UserCheck,
  Receipt,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const TableManagementScreen: React.FC = () => {
  const {
    tables,
    openTableOrder,
    joinTables,
    reassignTableWaiter,
    currentUser,
    setShowPreBillModal,
    setSelectedTable,
    showToast,
  } = useRestaurant();

  const [activeSalon, setActiveSalon] = useState<string>('Salón 1');
  const [mergingSourceTable, setMergingSourceTable] = useState<Table | null>(null);
  const [reassigningTable, setReassigningTable] = useState<Table | null>(null);
  const [newWaiterName, setNewWaiterName] = useState<string>('Sofia Méndez');

  const filteredTables = tables.filter((t) => t.salonName === activeSalon);

  // Status counters
  const totalFree = tables.filter((t) => t.status === 'libre').length;
  const totalOccupied = tables.filter((t) => t.status === 'ocupada').length;
  const totalPreBill = tables.filter((t) => t.status === 'precuenta').length;
  const totalCleaning = tables.filter((t) => t.status === 'limpieza').length;

  const handleTableClick = (table: Table) => {
    if (mergingSourceTable) {
      if (mergingSourceTable.id === table.id) {
        setMergingSourceTable(null);
        showToast('Fusión de mesas cancelada');
        return;
      }
      joinTables(mergingSourceTable.id, table.id);
      setMergingSourceTable(null);
      return;
    }

    openTableOrder(table);
  };

  const handleStartMerge = (e: React.MouseEvent, table: Table) => {
    e.stopPropagation();
    setMergingSourceTable(table);
    showToast(`Seleccione la segunda mesa para unir con Mesa ${table.number}`);
  };

  const handleOpenPreBill = (e: React.MouseEvent, table: Table) => {
    e.stopPropagation();
    setSelectedTable(table);
    setShowPreBillModal(true);
  };

  return (
    <div className="flex-1 bg-slate-900 flex flex-col p-3 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Gestión de Salón y Mesas
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo en tiempo real, asignación de comandas por ubicación y fusión de cuentas.
          </p>
        </div>

        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Libre ({totalFree})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Ocupada ({totalOccupied})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Precuenta ({totalPreBill})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Limpieza ({totalCleaning})
          </span>
        </div>
      </div>

      {/* Merge Action Notification Bar */}
      {mergingSourceTable && (
        <div className="mt-3 p-3 bg-amber-950/90 border border-amber-500/50 rounded-xl flex items-center justify-between text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <Merge className="w-4 h-4 text-amber-400 animate-spin" />
            <span>
              <strong>Modo Unión Activo:</strong> Mesa de origen: <strong>Mesa {mergingSourceTable.number}</strong>. Toque la mesa destino para fusionar las cuentas.
            </span>
          </div>
          <button
            onClick={() => setMergingSourceTable(null)}
            className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-bold"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Salon Tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-2 overflow-x-auto">
        {['Salón 1', 'Salón 2', 'Terraza'].map((salon) => (
          <button
            key={salon}
            onClick={() => setActiveSalon(salon)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap active:scale-95 ${
              activeSalon === salon
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {salon}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {filteredTables.map((table) => {
          const isSourceForMerge = mergingSourceTable?.id === table.id;

          let statusBg = 'bg-slate-800/90 border-slate-700 hover:border-emerald-500';
          let statusBadge = (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Libre
            </span>
          );

          if (table.status === 'ocupada') {
            statusBg = 'bg-amber-950/30 border-amber-500/60 hover:border-amber-400';
            statusBadge = (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                Ocupada
              </span>
            );
          } else if (table.status === 'precuenta') {
            statusBg = 'bg-purple-950/30 border-purple-500/60 hover:border-purple-400';
            statusBadge = (
              <span className="text-[11px] font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/40">
                En Precuenta
              </span>
            );
          } else if (table.status === 'limpieza') {
            statusBg = 'bg-slate-800/50 border-slate-700 opacity-70';
            statusBadge = (
              <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                En Limpieza
              </span>
            );
          }

          if (isSourceForMerge) {
            statusBg = 'bg-amber-950/70 border-2 border-amber-400 ring-2 ring-amber-400/40 animate-pulse';
          }

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`border-2 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition shadow-lg active:scale-98 relative group ${statusBg}`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-lg text-white">
                    {table.number}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">MESA {table.number}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" /> {table.seats} plazas
                    </span>
                  </div>
                </div>
                {statusBadge}
              </div>

              {/* Table Body info */}
              <div className="space-y-1.5 my-2">
                {table.status === 'ocupada' || table.status === 'precuenta' ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> Abierta:
                      </span>
                      <span className="font-mono font-medium">{table.openedAt || '12:30'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-400" /> Mesero:
                      </span>
                      <span className="font-semibold text-emerald-300 truncate max-w-[120px]">
                        {table.waiterName || currentUser.name}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Total acumulado:</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        ${(table.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500 italic">
                    {table.status === 'limpieza' ? 'Mesa en acondicionamiento' : 'Mesa disponible para comensales'}
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
                {table.status === 'ocupada' || table.status === 'precuenta' ? (
                  <>
                    <button
                      onClick={(e) => handleStartMerge(e, table)}
                      title="Unir con otra mesa"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-amber-300 transition text-[11px] flex items-center gap-1"
                    >
                      <Merge className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Unir</span>
                    </button>
                    <button
                      onClick={(e) => handleOpenPreBill(e, table)}
                      title="Emitir precuenta"
                      className="p-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 rounded-lg text-purple-300 transition text-[11px] flex items-center gap-1 font-semibold"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Precuenta</span>
                    </button>
                    <button
                      onClick={() => openTableOrder(table)}
                      className="ml-auto px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openTableOrder(table)}
                    className="w-full py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <span>Ocupar Mesa {table.number}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
