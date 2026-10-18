/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Table, TableStatus } from '../../types/restaurant';
import {
  Users,
  Clock,
  Timer,
  Hourglass,
  AlertTriangle,
  ArrowRight,
  Merge,
  UserCheck,
  Receipt,
  CheckCircle2,
  Sparkles,
  CalendarClock,
  ChevronDown,
  Phone,
  Bookmark,
  Calendar,
  X,
  Filter,
  ArrowLeft,
  AlertCircle,
  Utensils,
  Check,
} from 'lucide-react';

type NormalizedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved';

export const TableManagementScreen: React.FC = () => {
  const {
    tables,
    setTables,
    orders,
    openTableOrder,
    joinTables,
    currentUser,
    setShowPreBillModal,
    setSelectedTable,
    setActiveCartItems,
    setDiscountPercentage,
    setDiscountAuthorizedBy,
    showToast,
    addAuditLog,
    setCurrentScreen,
  } = useRestaurant();

  const [activeSalon, setActiveSalon] = useState<string>('Salón 1');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | NormalizedStatus>('all');
  const [mergingSourceTable, setMergingSourceTable] = useState<Table | null>(null);
  const [mergeConfirmTarget, setMergeConfirmTarget] = useState<Table | null>(null);
  const [openStatusMenuTableId, setOpenStatusMenuTableId] = useState<string | null>(null);

  // Reservation dialog state
  const [reservationModalTable, setReservationModalTable] = useState<Table | null>(null);
  const [resCustomerName, setResCustomerName] = useState('');
  const [resTime, setResTime] = useState('14:30');
  const [resPartySize, setResPartySize] = useState(4);
  const [resPhone, setResPhone] = useState('');

  // Live auto-refresh for table timer indicators (every 30 seconds)
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Normalize status helper
  const getNormalizedStatus = (table: Table): NormalizedStatus => {
    if (table.status === 'libre' || table.status === 'Available') return 'Available';
    if (table.status === 'limpieza' || table.status === 'Cleaning') return 'Cleaning';
    if (table.status === 'reservada' || table.status === 'Reserved') return 'Reserved';
    return 'Occupied'; // 'ocupada', 'precuenta', 'Occupied'
  };

  // Table Timer Indicator helper with color-coded alert thresholds
  const getTableTimerInfo = (table: Table) => {
    const norm = getNormalizedStatus(table);
    if (norm !== 'Occupied') return null;

    let elapsedMinutes = 0;
    if (table.openedAt) {
      const parts = table.openedAt.split(':');
      if (parts.length >= 2) {
        const openedH = parseInt(parts[0], 10);
        const openedM = parseInt(parts[1], 10);
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const openMinutes = openedH * 60 + openedM;
        let diff = nowMinutes - openMinutes;
        if (diff < 0) diff += 24 * 60;
        elapsedMinutes = diff;
      }
    }

    if (isNaN(elapsedMinutes) || elapsedMinutes <= 0) {
      elapsedMinutes = ((table.number * 17) % 70) + 14;
    }

    const isPreBill = table.status === 'precuenta';
    let formatted = '';
    if (elapsedMinutes >= 60) {
      const h = Math.floor(elapsedMinutes / 60);
      const m = elapsedMinutes % 60;
      formatted = `${h}h ${m}m`;
    } else {
      formatted = `${elapsedMinutes} min`;
    }

    if (isPreBill) {
      return {
        elapsedMinutes,
        formatted,
        label: 'En Precuenta',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
        dotClass: 'bg-purple-600 animate-pulse',
        barColor: 'bg-purple-600',
        alertLevel: 'prebill' as const,
      };
    }

    if (elapsedMinutes > 60) {
      return {
        elapsedMinutes,
        formatted,
        label: 'Tiempo Excedido',
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-400 font-black animate-pulse',
        dotClass: 'bg-rose-600 animate-ping',
        barColor: 'bg-rose-500',
        alertLevel: 'danger' as const,
      };
    }

    if (elapsedMinutes >= 35) {
      return {
        elapsedMinutes,
        formatted,
        label: 'Tiempo Estándar',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        dotClass: 'bg-amber-500',
        barColor: 'bg-amber-500',
        alertLevel: 'warning' as const,
      };
    }

    return {
      elapsedMinutes,
      formatted,
      label: 'Servicio Activo',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
      dotClass: 'bg-emerald-500',
      barColor: 'bg-emerald-500',
      alertLevel: 'normal' as const,
    };
  };

  // Status configuration with color-coded badges
  const getStatusBadgeConfig = (table: Table) => {
    const norm = getNormalizedStatus(table);
    const isPreBill = table.status === 'precuenta';

    switch (norm) {
      case 'Available':
        return {
          key: 'Available' as NormalizedStatus,
          label: 'Available',
          badgeClass:
            'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs',
          dotClass: 'bg-emerald-500 shadow-xs shadow-emerald-400',
          cardBorder: 'bg-white border-slate-200 hover:border-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'Occupied':
        return {
          key: 'Occupied' as NormalizedStatus,
          label: isPreBill ? 'Occupied (Pre-Bill)' : 'Occupied',
          badgeClass: isPreBill
            ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100 shadow-2xs'
            : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-2xs',
          dotClass: isPreBill ? 'bg-purple-500 animate-pulse' : 'bg-amber-500 animate-pulse',
          cardBorder: isPreBill
            ? 'bg-purple-50/20 border-purple-300 hover:border-purple-500'
            : 'bg-amber-50/20 border-amber-300 hover:border-amber-500',
          icon: isPreBill ? (
            <Receipt className="w-3.5 h-3.5 text-purple-600" />
          ) : (
            <Users className="w-3.5 h-3.5 text-amber-600" />
          ),
        };
      case 'Cleaning':
        return {
          key: 'Cleaning' as NormalizedStatus,
          label: 'Cleaning',
          badgeClass:
            'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100 shadow-2xs',
          dotClass: 'bg-sky-500 shadow-xs shadow-sky-400',
          cardBorder: 'bg-sky-50/20 border-sky-300 hover:border-sky-500',
          icon: <Sparkles className="w-3.5 h-3.5 text-sky-600" />,
        };
      case 'Reserved':
        return {
          key: 'Reserved' as NormalizedStatus,
          label: 'Reserved',
          badgeClass:
            'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 shadow-2xs',
          dotClass: 'bg-rose-500 shadow-xs shadow-rose-400',
          cardBorder: 'bg-rose-50/20 border-rose-300 hover:border-rose-500',
          icon: <CalendarClock className="w-3.5 h-3.5 text-rose-600" />,
        };
    }
  };

  // Filtered tables
  const filteredTables = tables.filter((t) => {
    const matchesSalon = t.salonName === activeSalon;
    if (!matchesSalon) return false;
    if (selectedStatusFilter === 'all') return true;
    return getNormalizedStatus(t) === selectedStatusFilter;
  });

  // Salon-wide status counts
  const currentSalonTables = tables.filter((t) => t.salonName === activeSalon);
  const countAvailable = currentSalonTables.filter((t) => getNormalizedStatus(t) === 'Available').length;
  const countOccupied = currentSalonTables.filter((t) => getNormalizedStatus(t) === 'Occupied').length;
  const countCleaning = currentSalonTables.filter((t) => getNormalizedStatus(t) === 'Cleaning').length;
  const countReserved = currentSalonTables.filter((t) => getNormalizedStatus(t) === 'Reserved').length;

  // Table timer metrics for active tables
  const occupiedTables = currentSalonTables.filter((t) => getNormalizedStatus(t) === 'Occupied');
  const countFresh = occupiedTables.filter((t) => (getTableTimerInfo(t)?.elapsedMinutes || 0) < 35).length;
  const countMid = occupiedTables.filter((t) => {
    const mins = getTableTimerInfo(t)?.elapsedMinutes || 0;
    return mins >= 35 && mins <= 60;
  }).length;
  const countProlonged = occupiedTables.filter((t) => (getTableTimerInfo(t)?.elapsedMinutes || 0) > 60).length;

  const getTableOrder = (table: Table | null) => {
    if (!table) return null;
    return orders.find(
      (o) =>
        (o.tableId === table.id || (table.currentOrderId && o.id === table.currentOrderId)) &&
        ['abierta', 'en_cocina', 'lista_para_servir', 'en_precuenta'].includes(o.status)
    );
  };

  const handleTableClick = (table: Table) => {
    if (mergingSourceTable) {
      if (mergingSourceTable.id === table.id) {
        setMergingSourceTable(null);
        showToast('Fusión de mesas cancelada');
        return;
      }
      // Mostrar modal de confirmación antes de unir
      setMergeConfirmTarget(table);
      return;
    }

    const norm = getNormalizedStatus(table);
    if (norm === 'Occupied') {
      openTableOrder(table);
    } else if (norm === 'Available') {
      openTableOrder(table);
    } else if (norm === 'Reserved') {
      // Prompt user or seat party
      openTableOrder(table);
    } else if (norm === 'Cleaning') {
      showToast(`Mesa ${table.number} en Limpieza. Presione 'Marcar Disponible' al finalizar`);
    }
  };

  const handleStartMerge = (e: React.MouseEvent, table: Table) => {
    e.stopPropagation();
    if (mergingSourceTable) {
      if (mergingSourceTable.id === table.id) {
        setMergingSourceTable(null);
        showToast('Fusión de mesas cancelada');
        return;
      }
      setMergeConfirmTarget(table);
      return;
    }
    setMergingSourceTable(table);
    showToast(`Seleccione la segunda mesa para unir con Mesa ${table.number}`);
  };

  const handleOpenPreBill = (e: React.MouseEvent, table: Table) => {
    e.stopPropagation();
    setSelectedTable(table);
    const existingOrder = getTableOrder(table);
    if (existingOrder) {
      setActiveCartItems([...existingOrder.items]);
      setDiscountPercentage(existingOrder.discountPercentage || 0);
      setDiscountAuthorizedBy(existingOrder.discountAuthorizedBy || null);
    }
    setShowPreBillModal(true);
  };

  // Update status directly
  const handleChangeStatus = (tableId: string, newStatus: TableStatus, customReservation?: Table['reservationInfo']) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          const updated: Table = {
            ...t,
            status: newStatus,
          };
          if (newStatus === 'libre' || newStatus === 'Available') {
            updated.totalAmount = undefined;
            updated.currentOrderId = undefined;
            updated.openedAt = undefined;
            updated.reservationInfo = undefined;
          } else if (newStatus === 'reservada' || newStatus === 'Reserved') {
            updated.reservationInfo = customReservation || {
              customerName: 'Cliente Reservado',
              time: '15:00',
              partySize: t.seats,
            };
          } else if (newStatus === 'limpieza' || newStatus === 'Cleaning') {
            updated.totalAmount = undefined;
            updated.currentOrderId = undefined;
            updated.openedAt = undefined;
            updated.reservationInfo = undefined;
          }
          return updated;
        }
        return t;
      })
    );

    setOpenStatusMenuTableId(null);
    const targetTable = tables.find((t) => t.id === tableId);
    const statusLabel =
      newStatus === 'libre' || newStatus === 'Available'
        ? 'Available'
        : newStatus === 'ocupada' || newStatus === 'Occupied'
        ? 'Occupied'
        : newStatus === 'limpieza' || newStatus === 'Cleaning'
        ? 'Cleaning'
        : 'Reserved';

    showToast(`Mesa ${targetTable?.number || ''} actualizada a '${statusLabel}'`);
    addAuditLog('CAMBIAR_ESTADO_MESA', `Mesa ${targetTable?.number} cambió a estado ${statusLabel}`);
  };

  // Open reservation modal
  const handleOpenReservationModal = (e: React.MouseEvent, table: Table) => {
    e.stopPropagation();
    setReservationModalTable(table);
    setResCustomerName('');
    setResTime('15:00');
    setResPartySize(table.seats);
    setResPhone('');
    setOpenStatusMenuTableId(null);
  };

  const handleSaveReservation = () => {
    if (!reservationModalTable) return;
    handleChangeStatus(reservationModalTable.id, 'reservada', {
      customerName: resCustomerName.trim() || `Reserva Mesa ${reservationModalTable.number}`,
      time: resTime,
      partySize: resPartySize || reservationModalTable.seats,
      phone: resPhone.trim() || undefined,
    });
    setReservationModalTable(null);
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col p-3 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('channel_select')}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer active:scale-95"
            title="Volver a selección de canales"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Canales</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                Gestión de Salón y Mesas
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoreo en tiempo real con indicadores visuales por estado y cambio rápido.
            </p>
          </div>
        </div>

        {/* Visual Status Indicator Filter & Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
              selectedStatusFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Todos ({currentSalonTables.length})</span>
          </button>

          {/* Color-coded Badges: Available */}
          <button
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Available' ? 'all' : 'Available')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
              selectedStatusFilter === 'Available'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedStatusFilter === 'Available' ? 'bg-white' : 'bg-emerald-500'}`} />
            <span>Available ({countAvailable})</span>
          </button>

          {/* Color-coded Badges: Occupied */}
          <button
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Occupied' ? 'all' : 'Occupied')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
              selectedStatusFilter === 'Occupied'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedStatusFilter === 'Occupied' ? 'bg-white animate-none' : 'bg-amber-500 animate-pulse'}`} />
            <span>Occupied ({countOccupied})</span>
          </button>

          {/* Color-coded Badges: Cleaning */}
          <button
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Cleaning' ? 'all' : 'Cleaning')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
              selectedStatusFilter === 'Cleaning'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedStatusFilter === 'Cleaning' ? 'bg-white' : 'bg-sky-500'}`} />
            <span>Cleaning ({countCleaning})</span>
          </button>

          {/* Color-coded Badges: Reserved */}
          <button
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Reserved' ? 'all' : 'Reserved')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
              selectedStatusFilter === 'Reserved'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedStatusFilter === 'Reserved' ? 'bg-white' : 'bg-rose-500'}`} />
            <span>Reserved ({countReserved})</span>
          </button>

          {/* Table Timer Indicator Legend & Summary */}
          {countOccupied > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
              <Timer className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline font-mono uppercase text-[11px] text-slate-500">Tiempos:</span>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono"
                title="Mesas con menos de 35 minutos de servicio"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> &lt;35m ({countFresh})
              </span>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-amber-50 text-amber-900 border border-amber-300 font-mono"
                title="Mesas entre 35 y 60 minutos de servicio"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 35-60m ({countMid})
              </span>
              {countProlonged > 0 && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-rose-50 text-rose-900 border border-rose-300 font-mono font-black animate-pulse"
                  title="Mesas con más de 60 minutos (atención requerida)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> &gt;60m ({countProlonged})
                </span>
              )}
            </div>
          )}
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
            onClick={() => {
              setActiveSalon(salon);
              setOpenStatusMenuTableId(null);
            }}
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
          const normStatus = getNormalizedStatus(table);
          const badgeConfig = getStatusBadgeConfig(table);
          const isMenuOpen = openStatusMenuTableId === table.id;
          const timerInfo = getTableTimerInfo(table);

          let cardBorderClass = badgeConfig.cardBorder;
          if (isSourceForMerge) {
            cardBorderClass = 'bg-amber-100 border-2 border-amber-500 ring-2 ring-amber-400/40 animate-pulse';
          } else if (mergingSourceTable) {
            cardBorderClass = 'bg-white border-2 border-dashed border-amber-400 hover:border-amber-600 hover:bg-amber-50/40 hover:scale-[1.01] ring-2 ring-amber-400/30 transition-all';
          }

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`border-2 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition active:scale-98 relative group shadow-2xs hover:shadow-md ${cardBorderClass}`}
            >
              {mergingSourceTable && !isSourceForMerge && (
                <div className="mb-2.5 px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 shadow-xs">
                  <Merge className="w-3 h-3" />
                  <span>Click para unir aquí</span>
                </div>
              )}

              {/* Top row: Number, Seats, and Status Indicator Badge */}
              <div className="flex items-center justify-between mb-3 relative">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center font-black text-lg text-slate-800 shadow-2xs">
                    {table.number}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">MESA {table.number}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Users className="w-3 h-3 text-slate-400" /> {table.seats} plazas
                    </span>
                  </div>
                </div>

                {/* Status Indicator Badge with Quick Status Menu trigger */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setOpenStatusMenuTableId(isMenuOpen ? null : table.id)}
                    title="Click para cambiar estado"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition cursor-pointer select-none ${badgeConfig.badgeClass}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${badgeConfig.dotClass}`} />
                    <span>{badgeConfig.label}</span>
                    <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                  </button>

                  {/* Status Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-30 animate-fadeIn">
                      <div className="px-3 py-1 text-[10px] font-mono uppercase font-bold text-slate-400 border-b border-slate-100 mb-1">
                        Cambiar Estado
                      </div>
                      <button
                        onClick={() => handleChangeStatus(table.id, 'libre')}
                        className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 ${
                          normStatus === 'Available' ? 'text-emerald-700 bg-emerald-50/60 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Available (Libre)</span>
                      </button>
                      <button
                        onClick={() => handleChangeStatus(table.id, 'ocupada')}
                        className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 ${
                          normStatus === 'Occupied' ? 'text-amber-700 bg-amber-50/60 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Occupied (Ocupada)</span>
                      </button>
                      <button
                        onClick={() => handleChangeStatus(table.id, 'limpieza')}
                        className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 ${
                          normStatus === 'Cleaning' ? 'text-sky-700 bg-sky-50/60 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        <span>Cleaning (Limpieza)</span>
                      </button>
                      <button
                        onClick={(e) => handleOpenReservationModal(e, table)}
                        className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 ${
                          normStatus === 'Reserved' ? 'text-rose-700 bg-rose-50/60 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Reserved (Reservada)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Body info based on status */}
              <div className="space-y-1.5 my-2">
                {normStatus === 'Occupied' && (
                  <>
                    {/* Visual Table Timer Indicator Badge */}
                    {timerInfo && (
                      <div
                        className={`py-1.5 px-2.5 rounded-xl border flex items-center justify-between text-xs transition shadow-2xs mb-2 ${timerInfo.badgeClass}`}
                        title={`Mesa ocupada hace ${timerInfo.formatted}. Estado: ${timerInfo.label}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${timerInfo.dotClass}`} />
                          <Timer className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-mono font-black text-xs">{timerInfo.formatted}</span>
                          <span className="text-[10px] opacity-85 hidden sm:inline">• {timerInfo.label}</span>
                        </div>
                        {/* Seated duration gauge bar (relative to 90 min max benchmark) */}
                        <div className="w-12 bg-black/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${timerInfo.barColor} transition-all duration-500`}
                            style={{
                              width: `${Math.min(100, Math.max(10, (timerInfo.elapsedMinutes / 90) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" /> Hora Apertura:
                      </span>
                      <span className="font-mono font-semibold text-slate-800">{table.openedAt || '12:35'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
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
                )}

                {normStatus === 'Reserved' && (
                  <div className="py-2 px-3 bg-rose-50/50 border border-rose-200/70 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-900 font-bold">
                      <Bookmark className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      <span className="truncate">{table.reservationInfo?.customerName || 'Reserva Registrada'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-rose-500" /> {table.reservationInfo?.time || '15:00'}
                      </span>
                      <span className="font-semibold text-rose-800">
                        {table.reservationInfo?.partySize || table.seats} pers.
                      </span>
                    </div>
                    {table.reservationInfo?.phone && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{table.reservationInfo.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {normStatus === 'Cleaning' && (
                  <div className="py-4 text-center text-xs text-sky-800 bg-sky-50/50 rounded-xl border border-sky-100 flex flex-col items-center gap-1">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span className="font-semibold">Mesa en proceso de limpieza</span>
                    <span className="text-[10px] text-slate-500">Desinfectando y preparando servicio</span>
                  </div>
                )}

                {normStatus === 'Available' && (
                  <div className="py-4 text-center text-xs text-slate-500 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    Mesa disponible para recibir comensales
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                {normStatus === 'Occupied' && (
                  <>
                    <button
                      onClick={(e) => handleStartMerge(e, table)}
                      title="Unir con otra mesa"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 hover:text-amber-800 transition text-[11px] flex items-center gap-1 cursor-pointer font-medium active:scale-95"
                    >
                      <Merge className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Unir</span>
                    </button>
                    <button
                      onClick={(e) => handleOpenPreBill(e, table)}
                      title="Emitir precuenta"
                      className="p-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-800 transition text-[11px] flex items-center gap-1 font-bold cursor-pointer active:scale-95"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Precuenta</span>
                    </button>
                    <button
                      onClick={() => openTableOrder(table)}
                      className="ml-auto px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer active:scale-95"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}

                {normStatus === 'Cleaning' && (
                  <button
                    onClick={() => handleChangeStatus(table.id, 'libre')}
                    className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Marcar Disponible (Available)</span>
                  </button>
                )}

                {normStatus === 'Reserved' && (
                  <div className="w-full flex items-center gap-2">
                    <button
                      onClick={() => handleChangeStatus(table.id, 'libre')}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer active:scale-95"
                    >
                      Liberar
                    </button>
                    <button
                      onClick={() => {
                        handleChangeStatus(table.id, 'ocupada');
                        openTableOrder(table);
                      }}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>Sentar Comensales</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {normStatus === 'Available' && (
                  <div className="w-full flex items-center gap-2">
                    <button
                      onClick={(e) => handleOpenReservationModal(e, table)}
                      title="Reservar esta mesa"
                      className="py-1.5 px-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <CalendarClock className="w-3 h-3 text-rose-500" />
                      <span>Reservar</span>
                    </button>
                    <button
                      onClick={() => openTableOrder(table)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>Ocupar Mesa {table.number}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reservation Dialog Modal */}
      {reservationModalTable && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Reservar Mesa {reservationModalTable.number}
                </h3>
              </div>
              <button
                onClick={() => setReservationModalTable(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Cliente / Reserva</label>
                <input
                  type="text"
                  placeholder="Ej. Familia Rodríguez o Cena Corporativa"
                  value={resCustomerName}
                  onChange={(e) => setResCustomerName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora de Reserva</label>
                  <input
                    type="time"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Comensales</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={resPartySize}
                    onChange={(e) => setResPartySize(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teléfono de Contacto (Opcional)</label>
                <input
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={resPhone}
                  onChange={(e) => setResPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setReservationModalTable(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveReservation}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Tables Confirmation Modal */}
      {mergingSourceTable && mergeConfirmTarget && (() => {
        const sourceOrder = getTableOrder(mergingSourceTable);
        const targetOrder = getTableOrder(mergeConfirmTarget);
        const sourceItems = sourceOrder?.items || [];
        const targetItems = targetOrder?.items || [];
        const sourceTotal = mergingSourceTable.totalAmount || sourceOrder?.total || 0;
        const targetTotal = mergeConfirmTarget.totalAmount || targetOrder?.total || 0;
        const combinedTotal = +(sourceTotal + targetTotal).toFixed(2);
        const combinedSeats = mergingSourceTable.seats + mergeConfirmTarget.seats;
        const combinedItemsCount = sourceItems.length + targetItems.length;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                    <Merge className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base tracking-wide">
                      Confirmar Unión de Mesas
                    </h3>
                    <p className="text-[11px] text-amber-100 font-medium">
                      Consolidación de comandas y traspaso de consumos internos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMergeConfirmTarget(null)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
                {/* Visual Flow: Source -> Target */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch relative">
                  {/* Source Table Card */}
                  <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {mergingSourceTable.number}
                          </span>
                          <div>
                            <span className="font-black text-xs text-amber-950 block">
                              MESA ORIGEN: Mesa {mergingSourceTable.number}
                            </span>
                            <span className="text-[10px] text-amber-800 font-medium">
                              {mergingSourceTable.salonName} • {mergingSourceTable.seats} plazas
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                          Se liberará
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="mt-2.5">
                        <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Utensils className="w-3.5 h-3.5 text-amber-600" />
                            Menú Interno ({sourceItems.length} ítems):
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          {sourceItems.length > 0 ? (
                            sourceItems.map((item) => (
                              <div
                                key={item.id}
                                className="p-2 bg-white border border-amber-200/90 rounded-xl text-xs flex items-center justify-between gap-2 shadow-2xs"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                    <span className="font-mono text-amber-800 bg-amber-100 px-1 rounded text-[11px]">
                                      {item.quantity}x
                                    </span>
                                    <span className="truncate text-xs">{item.name}</span>
                                  </div>
                                  {item.assignedGuestName && (
                                    <span className="text-[10px] text-slate-500 block truncate">
                                      Comensal: {item.assignedGuestName}
                                    </span>
                                  )}
                                  {item.notes && (
                                    <span className="text-[10px] text-amber-700 italic block truncate">
                                      Nota: {item.notes}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-slate-800 text-xs shrink-0">
                                  ${item.subtotal.toFixed(2)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-white/70 border border-dashed border-amber-200 rounded-xl text-center text-xs text-amber-800 italic">
                              Sin productos cargados
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-between">
                      <span className="text-xs text-amber-900 font-semibold">Subtotal Origen:</span>
                      <span className="font-mono font-black text-amber-950 text-sm">
                        ${sourceTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Target Table Card */}
                  <div className="p-3.5 bg-emerald-50/70 border-2 border-emerald-400 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {mergeConfirmTarget.number}
                          </span>
                          <div>
                            <span className="font-black text-xs text-emerald-950 block">
                              MESA DESTINO: Mesa {mergeConfirmTarget.number}
                            </span>
                            <span className="text-[10px] text-emerald-800 font-medium">
                              {mergeConfirmTarget.salonName} • {mergeConfirmTarget.seats} plazas
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Mesa Activa Final
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="mt-2.5">
                        <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                            Menú Actual ({targetItems.length} ítems):
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          {targetItems.length > 0 ? (
                            targetItems.map((item) => (
                              <div
                                key={item.id}
                                className="p-2 bg-white border border-emerald-200/90 rounded-xl text-xs flex items-center justify-between gap-2 shadow-2xs"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                    <span className="font-mono text-emerald-800 bg-emerald-100 px-1 rounded text-[11px]">
                                      {item.quantity}x
                                    </span>
                                    <span className="truncate text-xs">{item.name}</span>
                                  </div>
                                  {item.assignedGuestName && (
                                    <span className="text-[10px] text-slate-500 block truncate">
                                      Comensal: {item.assignedGuestName}
                                    </span>
                                  )}
                                  {item.notes && (
                                    <span className="text-[10px] text-emerald-700 italic block truncate">
                                      Nota: {item.notes}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-slate-800 text-xs shrink-0">
                                  ${item.subtotal.toFixed(2)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-white/70 border border-dashed border-emerald-200 rounded-xl text-center text-xs text-emerald-800 italic">
                              Mesa libre (recibirá los productos de Mesa {mergingSourceTable.number})
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-emerald-200 flex items-center justify-between">
                      <span className="text-xs text-emerald-900 font-semibold">Subtotal Destino:</span>
                      <span className="font-mono font-black text-emerald-950 text-sm">
                        ${targetTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consolidated Result Preview Box */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Resultado de la Fusión
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Mesa consolidada: <strong className="text-white">Mesa {mergeConfirmTarget.number}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block font-medium">Plazas Totales</span>
                      <span className="text-sm font-black text-white font-mono">
                        {combinedSeats} plazas
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block font-medium">Menús Consolidados</span>
                      <span className="text-sm font-black text-amber-300 font-mono">
                        {combinedItemsCount} productos
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block font-medium">Total Unificado</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        ${combinedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Al confirmar, todos los platillos y notas de la <strong>Mesa {mergingSourceTable.number}</strong> se integrarán en la orden de la <strong>Mesa {mergeConfirmTarget.number}</strong>. La Mesa {mergingSourceTable.number} quedará disponible para nuevos comensales.
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setMergeConfirmTarget(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer active:scale-95 shadow-2xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    joinTables(mergingSourceTable.id, mergeConfirmTarget.id);
                    setMergeConfirmTarget(null);
                    setMergingSourceTable(null);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar y Unir Mesas</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
