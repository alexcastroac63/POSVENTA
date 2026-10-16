/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { SplitSubBill, OrderItem } from '../../types/restaurant';
import { X, Users, UserPlus, Divide, Check, CreditCard, Trash2, ArrowRight } from 'lucide-react';

interface GuestBill {
  id: string;
  name: string;
  itemIds: string[];
}

export const SplitBillModal: React.FC = () => {
  const {
    showSplitModal,
    setShowSplitModal,
    activeCartItems,
    selectedTable,
    splitBillByGuests,
    showToast,
    setShowPaymentModal,
  } = useRestaurant();

  if (!showSplitModal) return null;

  const totalBillAmount = activeCartItems.reduce((acc, i) => acc + i.subtotal, 0) * 1.1; // with 10% tax

  // Initial guest splits
  const [guests, setGuests] = useState<GuestBill[]>([
    { id: 'g-1', name: 'Comensal 1 (Pedro)', itemIds: activeCartItems.slice(0, Math.ceil(activeCartItems.length / 2)).map((i) => i.id) },
    { id: 'g-2', name: 'Comensal 2 (Laura)', itemIds: activeCartItems.slice(Math.ceil(activeCartItems.length / 2)).map((i) => i.id) },
  ]);

  const [activeGuestId, setActiveGuestId] = useState<string>('g-1');
  const [newGuestName, setNewGuestName] = useState('');
  const [equalPartsCount, setEqualPartsCount] = useState<number>(2);

  const handleAddGuest = () => {
    if (!newGuestName.trim()) return;
    const newGuest: GuestBill = {
      id: `g-${Date.now()}`,
      name: newGuestName.trim(),
      itemIds: [],
    };
    setGuests((prev) => [...prev, newGuest]);
    setNewGuestName('');
    setActiveGuestId(newGuest.id);
  };

  const handleAssignItem = (itemId: string, targetGuestId: string) => {
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id === targetGuestId) {
          return {
            ...g,
            itemIds: g.itemIds.includes(itemId) ? g.itemIds : [...g.itemIds, itemId],
          };
        } else {
          return {
            ...g,
            itemIds: g.itemIds.filter((id) => id !== itemId),
          };
        }
      })
    );
  };

  const handleEqualSplit = (numParts: number) => {
    setEqualPartsCount(numParts);
    const newGuests: GuestBill[] = [];
    for (let i = 1; i <= numParts; i++) {
      newGuests.push({
        id: `g-eq-${i}`,
        name: `Parte ${i} de ${numParts}`,
        itemIds: [], // virtual equal division
      });
    }
    setGuests(newGuests);
    showToast(`Cuenta dividida en ${numParts} partes iguales de $${(totalBillAmount / numParts).toFixed(2)}`);
  };

  const handleSaveAndConfirm = () => {
    const finalSplits: SplitSubBill[] = guests.map((g) => {
      // Calculate allocated items subtotal
      const itemsSubtotal = activeCartItems
        .filter((item) => g.itemIds.includes(item.id))
        .reduce((sum, item) => sum + item.subtotal, 0);

      const subtotal = itemsSubtotal > 0 ? itemsSubtotal : totalBillAmount / guests.length / 1.1;
      const tax = +(subtotal * 0.1).toFixed(2);
      const total = +(subtotal + tax).toFixed(2);

      return {
        id: g.id,
        guestName: g.name,
        itemIds: g.itemIds,
        subtotal,
        tax,
        total,
        paid: false,
      };
    });

    splitBillByGuests(finalSplits);
    setShowSplitModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 border-b-2 border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider block">
              CU-06: GESTIÓN Y DIVISIÓN DE CUENTAS
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase">
              División de Comanda {selectedTable ? `(Mesa ${selectedTable.number})` : ''}
            </h3>
          </div>
          <button
            onClick={() => setShowSplitModal(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase">Dividir en partes iguales:</span>
            {[2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => handleEqualSplit(n)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-sky-600 hover:text-white border border-slate-700 rounded-lg text-slate-300 font-bold transition"
              >
                1/{n} partes
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              placeholder="Nombre del comensal..."
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleAddGuest}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
        </div>

        {/* Dual Column Layout: Left items list, Right guest sub-bills */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x-2 divide-slate-800 p-4 sm:p-6 gap-4">
          {/* Left: Items to allocate (Cols 5) */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              ÍTEMS DE LA COMANDA (Asignar a comensal):
            </span>

            <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
              {activeCartItems.map((item) => {
                const assignedGuest = guests.find((g) => g.itemIds.includes(item.id));

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ${item.unitPrice.toFixed(2)} x {item.quantity} = ${item.subtotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Guest Selector Dropdown */}
                    <select
                      value={assignedGuest?.id || ''}
                      onChange={(e) => handleAssignItem(item.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-sky-400 font-medium focus:outline-none focus:border-sky-500 max-w-[140px]"
                    >
                      <option value="">(Sin Asignar)</option>
                      {guests.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Guest Sub-Bills (Cols 7) */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              SUB-CUENTAS INDIVIDUALES ({guests.length} Comensales):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[360px] pr-1">
              {guests.map((guest) => {
                const guestItems = activeCartItems.filter((i) => guest.itemIds.includes(i.id));
                const itemsSub = guestItems.reduce((acc, i) => acc + i.subtotal, 0);
                const isEq = guestItems.length === 0 && guests.every((g) => g.itemIds.length === 0);
                const calcTotal = isEq ? totalBillAmount / guests.length : itemsSub * 1.1;

                return (
                  <div
                    key={guest.id}
                    className="bg-slate-950 border-2 border-slate-800 hover:border-sky-500 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {guest.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {guestItems.length} ítems
                        </span>
                      </div>

                      <div className="py-2 space-y-1 text-[11px] min-h-[60px]">
                        {guestItems.map((gi) => (
                          <div key={gi.id} className="flex justify-between text-slate-300">
                            <span className="truncate max-w-[120px]">{gi.name}</span>
                            <span className="font-mono text-slate-400">${gi.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                        {isEq && (
                          <div className="text-[11px] text-slate-400 italic">
                            División alícuota equitativa
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Total a pagar:</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        ${calcTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Total General: <strong className="text-white font-mono">${totalBillAmount.toFixed(2)}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSplitModal(false)}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndConfirm}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-sky-950/40"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar División de Cuentas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
