/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { HistoricalInvoice } from '../../types/restaurant';
import {
  Banknote,
  CreditCard,
  Ticket,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Receipt,
  Search,
  Layers,
  Tag,
  Eye,
  Calendar,
  UtensilsCrossed,
  Filter,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const CashierManagementScreen: React.FC = () => {
  const {
    cashShift,
    currentUser,
    performCashCut,
    closeDailyShift,
    historicalInvoices,
    setSelectedInvoiceForDetail,
    setShowInvoiceDetailModal,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'arqueo' | 'invoices'>('arqueo');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('todos');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('todos');

  const [countedCash, setCountedCash] = useState<string>(
    cashShift.expectedCashInDrawer.toFixed(2)
  );

  const numCounted = parseFloat(countedCash) || 0;
  const difference = +(numCounted - cashShift.expectedCashInDrawer).toFixed(2);

  const handleCorteX = () => {
    performCashCut(numCounted);
  };

  const handleCierreZ = () => {
    closeDailyShift(numCounted);
  };

  const handleViewInvoiceDetail = (inv: HistoricalInvoice) => {
    setSelectedInvoiceForDetail(inv);
    setShowInvoiceDetailModal(true);
  };

  const filteredInvoices = historicalInvoices.filter((inv) => {
    if (selectedChannelFilter !== 'todos' && inv.header.salesChannel !== selectedChannelFilter) {
      return false;
    }
    if (selectedPaymentFilter !== 'todos') {
      const p = selectedPaymentFilter.toLowerCase();
      if (!inv.header.paymentMethod.toLowerCase().includes(p)) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        inv.header.documentNumber.toLowerCase().includes(q) ||
        String(inv.header.ticketNumber).includes(q) ||
        inv.header.salesChannelLabel.toLowerCase().includes(q) ||
        inv.header.cashierName.toLowerCase().includes(q) ||
        inv.header.dateTime.toLowerCase().includes(q) ||
        inv.items.some((item) => item.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalInvoicesAmount = historicalInvoices.reduce((acc, inv) => acc + inv.header.totalAmount, 0);
  const totalDiscountsGranted = historicalInvoices.reduce((acc, inv) => acc + (inv.header.discountAmount || 0), 0);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col p-3 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Screen Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Control de Caja & Facturación (Carlos - Cajero)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Arqueo en tiempo real, cuadratura de turno y repositorio oficial de facturas históricas con desglose interno (CU-08, CU-09).
          </p>
        </div>

        {/* Tab switchers & status */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-300 text-xs font-bold">
            <button
              onClick={() => setActiveTab('arqueo')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'arqueo'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Arqueo & Cuadratura</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'invoices'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Facturas Históricas</span>
              <span className="bg-emerald-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-0.5">
                {historicalInvoices.length}
              </span>
            </button>
          </div>

          <span
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
              cashShift.status === 'abierto'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cashShift.status === 'abierto' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
              }`}
            ></span>
            <span>TURNO {cashShift.status.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {activeTab === 'arqueo' ? (
        /* TAB 1: ARQUEO & CUADRATURA FINANCIERA */
        <>
          {/* Financial Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Fondo Inicial</span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">
                ${cashShift.initialCash.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Apertura: {cashShift.openedAt}</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Ventas Efectivo</span>
                <Banknote className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700 font-mono">
                ${cashShift.cashSales.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Cobros en moneda</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Ventas Tarjeta</span>
                <CreditCard className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-xl font-black text-sky-700 font-mono">
                ${cashShift.cardSales.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">TPV / POS Bancario</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Vales / Despensa</span>
                <Ticket className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-black text-purple-700 font-mono">
                ${cashShift.voucherSales.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Cupones y Vales</span>
            </div>

            <div className="bg-emerald-50/60 border-2 border-emerald-300 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-900 text-xs mb-1">
                <span className="font-bold">Total Facturado</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-emerald-800 font-mono">
                ${cashShift.totalSales.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Omnicanal acumulado</span>
            </div>
          </div>

          {/* Main Reconciliation Box (Arqueo y Cuadratura) */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Calculation Card (Cols 7) */}
            <div className="lg:col-span-7 bg-white border border-slate-300 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block mb-4">
                  CUADRATURA FINANCIERA DEL CAJÓN DE DINERO
                </span>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-600 font-medium">Fondo Inicial Apertura:</span>
                    <span className="text-sm font-mono font-bold text-slate-900">${cashShift.initialCash.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-600 font-medium">(+) Total Ventas Efectivo:</span>
                    <span className="text-sm font-mono font-bold text-emerald-700">+${cashShift.cashSales.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-emerald-50/50 border-2 border-emerald-300 rounded-xl">
                    <div>
                      <span className="text-xs font-black uppercase text-slate-900 block">
                        TOTAL ESPERADO EN CAJÓN:
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Fondo inicial + Ventas netas en efectivo
                      </span>
                    </div>
                    <span className="text-2xl font-black text-emerald-700 font-mono">
                      ${cashShift.expectedCashInDrawer.toFixed(2)}
                    </span>
                  </div>

                  {/* Counted Cash Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2">
                      Efectivo Físico Contado en Cajón (Arqueo):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-500 font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={countedCash}
                        onChange={(e) => setCountedCash(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl pl-8 pr-4 py-3 text-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Difference Status */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between shadow-2xs ${
                      difference === 0
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : difference > 0
                        ? 'bg-sky-50 border-sky-300 text-sky-800'
                        : 'bg-rose-50 border-rose-300 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {difference === 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3 mt-6">
                <button
                  onClick={handleCorteX}
                  className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Realizar Corte Parcial (X)</span>
                </button>

                <button
                  onClick={handleCierreZ}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Cierre Diario de Caja (Z)</span>
                </button>
              </div>
            </div>

            {/* Right: Cashier Info (Cols 5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  FICHA DEL OPERADOR DE CAJA
                </span>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{currentUser.name}</h4>
                    <span className="text-xs text-emerald-700 font-semibold">Cajero Principal Titular</span>
                    <span className="text-[10px] text-slate-500 block">Terminal #01 (All-in-One Touch)</span>
                  </div>
                </div>

                <div className="pt-3 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>• El <strong>Corte Parcial X</strong> permite el cambio de turno entre cajeros sin cerrar el folio fiscal.</p>
                  <p>• El <strong>Cierre Diario Z</strong> consolida la jornada y bloquea nuevas transacciones hasta la siguiente apertura de turno.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  AUDITORÍA DE CORTE
                </span>
                <p className="text-xs text-slate-600">
                  Cada corte queda grabado en la bitácora inmutable de auditoría para revisión de gerencia (Elena Sandoval).
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* TAB 2: FACTURAS HISTÓRICAS & TICKETS COBRADOS */
        <div className="mt-5 space-y-5">
          {/* KPI Mini-bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Total Facturas Emitidas:</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {historicalInvoices.length} Comprobantes
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Total Cobrado Acumulado:</span>
              <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
                ${totalInvoicesAmount.toFixed(2)}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Descuentos Otorgados:</span>
              <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
                ${totalDiscountsGranted.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por Nº de Factura (ej: FAC-2026), Ticket, Canal, Cajero o Menú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* Channel filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <span className="text-[10px] text-slate-400 px-1 font-mono uppercase">Canal:</span>
                {(['todos', 'mesa', 'llevar', 'delivery'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setSelectedChannelFilter(ch)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize transition cursor-pointer ${
                      selectedChannelFilter === ch
                        ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              {/* Payment filter */}
              <select
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="todos">Todos los Pagos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="vales">Vales</option>
                <option value="mixto">Pago Mixto</option>
              </select>
            </div>
          </div>

          {/* Historical Invoices Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-mono uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Documento / Folio</th>
                    <th className="py-3 px-4">Fecha & Hora</th>
                    <th className="py-3 px-4">Canal de Venta</th>
                    <th className="py-3 px-4">Menús Vendidos & Sub-Detalle</th>
                    <th className="py-3 px-4">Forma de Pago</th>
                    <th className="py-3 px-4">Descuento</th>
                    <th className="py-3 px-4 text-right">Total Facturado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No se encontraron facturas históricas</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Prueba ajustando los filtros de búsqueda o canal
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-emerald-50/40 transition group cursor-pointer"
                        onClick={() => handleViewInvoiceDetail(inv)}
                      >
                        {/* Document & Ticket */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-mono font-black text-slate-900 block group-hover:text-emerald-700">
                                {inv.header.documentNumber}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Ticket #{inv.header.ticketNumber} • {inv.header.cashierName.split(' ')[0]}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                          {inv.header.dateTime}
                        </td>

                        {/* Channel */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 text-slate-800 border border-slate-200 inline-block">
                            {inv.header.salesChannelLabel}
                          </span>
                        </td>

                        {/* Menus and Internal products counter */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="truncate font-semibold text-slate-900">
                            {inv.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>
                              {inv.items.reduce(
                                (acc, i) => acc + (i.internalProducts?.length || 1),
                                0
                              )}{' '}
                              componentes internos con preparación
                            </span>
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800">
                            {inv.header.paymentMethod}
                          </span>
                          {inv.header.changeGiven > 0 && (
                            <span className="text-[10px] text-slate-500 block">
                              Cambio: ${inv.header.changeGiven.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Discount */}
                        <td className="py-3.5 px-4">
                          {inv.header.discountApplied ? (
                            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] inline-block">
                              -{inv.header.discountPercentage}% (-${inv.header.discountAmount.toFixed(2)})
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Sin desc.</span>
                          )}
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono font-black text-emerald-700 text-sm block">
                            ${inv.header.totalAmount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Cobrado: ${inv.header.totalCharged.toFixed(2)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInvoiceDetail(inv);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-2xs"
                            title="Ver encabezado y sub-detalle de productos internos"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Detalle</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
