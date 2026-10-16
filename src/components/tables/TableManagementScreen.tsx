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
  ArrowRight,
  Merge,
  UserCheck,
  Receipt,
} from 'lucide-react';

export const TableManagementScreen: React.FC = () => {
  const {
    tables,
    openTableOrder,
    joinTables,
    currentUser,
    setShowPreBillModal,
    setSelectedTable,
    showToast,
  } = useRestaurant();

  const [activeSalon, setActiveSalon] = useState<string>('Salón 1');
  const [mergingSourceTable, setMergingSourceTable] = useState<Table | null>(null);

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
    <div className="flex-1 bg-slate-50 flex flex-col p-3 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Gestión de Salón y Mesas
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en tiempo real, asignación de comandas por ubicación y fusión de cuentas.
          </p>
        </div>

        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Libre ({totalFree})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Ocupada ({totalOccupied})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Precuenta ({totalPreBill})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Limpieza ({totalCleaning})
          </span>
        </div>
      </div>

      {/* Merge Action Notification Bar */}
      {mergingSourceTable && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Merge className="w-4 h-4 text-amber-600 animate-spin" />
            <span>
              <strong>Modo Unión Activo:</strong> Mesa de origen: <strong>Mesa {mergingSourceTable.number}</strong>. Toque la mesa destino para fusionar las cuentas.
            </span>
          </div>
          <button
            onClick={() => setMergingSourceTable(null)}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Salon Tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-slate-200 pb-2 overflow-x-auto">
        {['Salón 1', 'Salón 2', 'Terraza'].map((salon) => (
          <button
            key={salon}
            onClick={() => setActiveSalon(salon)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
              activeSalon === salon
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
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

          let statusBg = 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs';
          let statusBadge = (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Libre
            </span>
          );

          if (table.status === 'ocupada') {
            statusBg = 'bg-amber-50/40 border-amber-300 hover:border-amber-500 shadow-xs';
            statusBadge = (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                Ocupada
              </span>
            );
          } else if (table.status === 'precuenta') {
            statusBg = 'bg-purple-50/40 border-purple-300 hover:border-purple-500 shadow-xs';
            statusBadge = (
              <span className="text-[11px] font-bold text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200">
                En Precuenta
              </span>
            );
          } else if (table.status === 'limpieza') {
            statusBg = 'bg-slate-100 border-slate-200 opacity-70';
            statusBadge = (
              <span className="text-[11px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                En Limpieza
              </span>
            );
          }

          if (isSourceForMerge) {
            statusBg = 'bg-amber-100 border-2 border-amber-500 ring-2 ring-amber-400/40 animate-pulse';
          }

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`border-2 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition active:scale-98 relative group ${statusBg}`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center font-black text-lg text-slate-800 shadow-2xs">
                    {table.number}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">MESA {table.number}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" /> {table.seats} plazas
                    </span>
                  </div>
                </div>
                {statusBadge}
              </div>

              {/* Table Body info */}
              <div className="space-y-1.5 my-2">
                {table.status === 'ocupada' || table.status === 'precuenta' ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> Abierta:
                      </span>
                      <span className="font-mono font-medium text-slate-800">{table.openedAt || '12:35'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="text-slate-500 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600" /> Mesero:
                      </span>
                      <span className="font-bold text-slate-800 truncate max-w-[120px]">
                        {table.waiterName || currentUser.name}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Total acumulado:</span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        ${(table.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400 italic">
                    {table.status === 'limpieza' ? 'Mesa en acondicionamiento' : 'Mesa libre para comensales'}
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-1.5">
                {table.status === 'ocupada' || table.status === 'precuenta' ? (
                  <>
                    <button
                      onClick={(e) => handleStartMerge(e, table)}
                      title="Unir con otra mesa"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 hover:text-amber-800 transition text-[11px] flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Merge className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Unir</span>
                    </button>
                    <button
                      onClick={(e) => handleOpenPreBill(e, table)}
                      title="Emitir precuenta"
                      className="p-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-800 transition text-[11px] flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Precuenta</span>
                    </button>
                    <button
                      onClick={() => openTableOrder(table)}
                      className="ml-auto px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openTableOrder(table)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Ocupar Mesa {table.number}</span>
                    <ArrowRight className="w-3 h-3" />
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
