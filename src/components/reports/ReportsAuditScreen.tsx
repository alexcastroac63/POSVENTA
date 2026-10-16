/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  PieChart,
  ShieldCheck,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  FileText,
  UserCheck,
  Search,
  Filter,
} from 'lucide-react';

export const ReportsAuditScreen: React.FC = () => {
  const { auditLogs, orders, cashShift } = useRestaurant();
  const [selectedAuditFilter, setSelectedAuditFilter] = useState<string>('todos');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Hourly sales distribution mock based on orders
  const hourlyData = [
    { hour: '11:00 - 13:00', amount: 320, orders: 12, percentage: 35 },
    { hour: '13:00 - 15:00 (Pico)', amount: 980, orders: 34, percentage: 95 },
    { hour: '15:00 - 18:00', amount: 240, orders: 8, percentage: 25 },
    { hour: '18:00 - 20:00', amount: 560, orders: 19, percentage: 55 },
    { hour: '20:00 - 22:00 (Pico)', amount: 1150, orders: 41, percentage: 100 },
    { hour: '22:00 - 00:00', amount: 380, orders: 14, percentage: 40 },
  ];

  // Channel breakdown
  const channelData = [
    { channel: 'MESA (Salón & Terraza)', amount: 1850.50, orders: 58, color: 'bg-emerald-500', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { channel: 'PLATAFORMAS (Delivery)', amount: 1120.00, orders: 39, color: 'bg-amber-500', icon: <Bike className="w-4 h-4" /> },
    { channel: 'LLEVAR (Take Out)', amount: 660.00, orders: 24, color: 'bg-sky-500', icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  const totalChannelSales = channelData.reduce((acc, c) => acc + c.amount, 0);

  // Top products
  const topProducts = [
    { name: 'PRODUCTO 1: Burger Master XYZ', units: 48, revenue: 960.00 },
    { name: 'PRODUCTO 3: Bife de Chorizo Grill', units: 31, revenue: 868.00 },
    { name: 'PRODUCTO 7: Combo Pareja XYZ', units: 26, revenue: 832.00 },
    { name: 'PRODUCTO 2: Smash Bacon Cheese', units: 25, revenue: 437.50 },
    { name: 'PRODUCTO 9: Cerveza Artesanal Draft', units: 62, revenue: 403.00 },
  ];

  // Filtered audit logs
  const filteredLogs = auditLogs.filter((log) => {
    if (selectedAuditFilter !== 'todos' && log.action !== selectedAuditFilter) return false;
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      return (
        log.description.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 bg-slate-900 flex flex-col p-3 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Reportes & Auditoría Gerencial (Elena - Gerente)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Análisis de ventas por franja horaria, rendimiento omnicanal y bitácora de auditoría (CU-10, CU-13).
          </p>
        </div>

        {/* Date range badge */}
        <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300">
          Jornada Operativa: <strong className="text-emerald-400">Hoy ({new Date().toLocaleDateString()})</strong>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Venta Total Facturada</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${totalChannelSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">+14.2% vs misma jornada semana anterior</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Total de Órdenes</span>
            <UtensilsCrossed className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            121 comandas
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">58 salón • 39 delivery • 24 llevar</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Ticket Promedio</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            ${(totalChannelSales / 121).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Salón ($31.90) | Delivery ($28.70)</span>
        </div>
      </div>

      {/* Charts Grid: Hourly Breakdown & Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Ventas por Franja Horaria (Cols 7) */}
        <div className="lg:col-span-7 bg-slate-950 border-2 border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              VENTAS POR FRANJA HORARIA (Picos de Demanda):
            </span>
          </div>

          <div className="space-y-3">
            {hourlyData.map((slot, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">{slot.hour}</span>
                  <span className="text-white font-bold">
                    ${slot.amount.toFixed(2)}{' '}
                    <span className="text-slate-500 font-normal">({slot.orders} pedidos)</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      slot.percentage >= 80 ? 'bg-emerald-500' : slot.percentage >= 50 ? 'bg-amber-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${slot.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ventas por Canal y Top Platos (Cols 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              VENTAS POR CANAL DE VENTA:
            </span>

            <div className="space-y-3">
              {channelData.map((ch, i) => {
                const pct = Math.round((ch.amount / totalChannelSales) * 100);
                return (
                  <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <span className="text-slate-400">{ch.icon}</span>
                        <span>{ch.channel}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">${ch.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{ch.orders} órdenes</span>
                      <span className="font-mono font-bold">{pct}% del total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bitácora de Auditoría (Audit Trail) */}
      <div className="mt-6 bg-slate-950 border-2 border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                BITÁCORA INMUTABLE DE AUDITORÍA (AUDIT TRAIL):
              </span>
              <p className="text-[11px] text-slate-400">
                Trazabilidad de cancelaciones, descuentos otorgados, apertura/cierre de turnos y eliminación de ítems.
              </p>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Buscar evento..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedAuditFilter}
              onChange={(e) => setSelectedAuditFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="todos">Todas las acciones</option>
              <option value="APLICAR_DESCUENTO">Descuentos</option>
              <option value="ELIMINAR_ITEM">Eliminación Ítems</option>
              <option value="CORTE_CAJA">Cortes de Caja</option>
              <option value="UNIR_MESAS">Unión de Mesas</option>
              <option value="CREAR_ORDEN">Comandas</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                <th className="py-2.5 px-3">Hora</th>
                <th className="py-2.5 px-3">Usuario Responsable</th>
                <th className="py-2.5 px-3">Acción Crítica</th>
                <th className="py-2.5 px-3">Detalle / Descripción</th>
                <th className="py-2.5 px-3">Supervisor Autorizador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2.5 px-3 text-white font-sans font-bold whitespace-nowrap">
                    {log.userName}{' '}
                    <span className="text-[10px] text-emerald-400 font-mono capitalize">
                      ({log.userRole})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.action === 'APLICAR_DESCUENTO'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : log.action === 'ELIMINAR_ITEM'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : log.action === 'CORTE_CAJA' || log.action === 'CIERRE_CAJA'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans max-w-md">{log.description}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-sans whitespace-nowrap">
                    {log.supervisorName ? `✓ ${log.supervisorName}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
