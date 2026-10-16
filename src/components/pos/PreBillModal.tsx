/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, Printer, CheckCircle2, QrCode } from 'lucide-react';

export const PreBillModal: React.FC = () => {
  const {
    showPreBillModal,
    setShowPreBillModal,
    selectedTable,
    activeCartItems,
    selectedChannel,
    currentUser,
    branch,
    discountPercentage,
    setTables,
    showToast,
  } = useRestaurant();

  if (!showPreBillModal) return null;

  const subtotal = activeCartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const discountAmount = +(subtotal * (discountPercentage / 100)).toFixed(2);
  const taxable = subtotal - discountAmount;
  const taxAmount = +(taxable * 0.10).toFixed(2);
  const total = +(taxable + taxAmount).toFixed(2);

  const tip10 = +(total * 0.10).toFixed(2);
  const tip15 = +(total * 0.15).toFixed(2);
  const tip20 = +(total * 0.20).toFixed(2);

  const handleMarkPreBill = () => {
    if (selectedTable) {
      setTables((prev: any[]) =>
        prev.map((t: any) => (t.id === selectedTable.id ? { ...t, status: 'precuenta' } : t))
      );
      showToast(`Mesa ${selectedTable.number} marcada en Precuenta`);
    }
    setShowPreBillModal(false);
  };

  const handlePrint = () => {
    showToast('Enviando ticket a impresora térmica de barra...');
    setTimeout(() => {
      handleMarkPreBill();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
              CU-07: EMISIÓN DE PRECUENTAS
            </span>
            <h3 className="text-base font-black text-slate-900 uppercase">
              Ticket Previo para el Cliente
            </h3>
          </div>
          <button
            onClick={() => setShowPreBillModal(false)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Styling Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100/60">
          <div className="bg-[#fefee9] text-slate-900 p-5 rounded-lg shadow-sm font-mono text-xs border border-amber-200/80 mx-auto max-w-xs">
            {/* Restaurant Heading */}
            <div className="text-center pb-3 border-b-2 border-dashed border-slate-400">
              <div className="font-black text-sm uppercase tracking-wider">RESTAURANTE XYZ</div>
              <div className="text-[11px] text-slate-600">POS OMNICANAL & GASTRONOMÍA</div>
              <div className="text-[10px] text-slate-500 mt-1">{branch}</div>
              <div className="text-[10px] text-slate-500">RFC/CIF: RESTO-948214-B</div>
              <div className="text-[10px] text-slate-500">Tel: +34 912 345 678</div>
            </div>

            {/* Order Metadata */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>UBICACIÓN:</span>
                <span className="font-bold">
                  {selectedTable ? `${selectedTable.salonName} - MESA ${selectedTable.number}` : selectedChannel.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ATENDIDO POR:</span>
                <span className="font-bold">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Items Header */}
            <div className="py-1.5 border-b border-dashed border-slate-400 font-bold flex justify-between text-[11px]">
              <span>CANT. DESCRIPCIÓN</span>
              <span>IMPORTE</span>
            </div>

            {/* Items Listing */}
            <div className="py-2 space-y-1.5 border-b-2 border-dashed border-slate-400">
              {activeCartItems.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between font-bold">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                  {item.selectedModifiers.map((mod, i) => (
                    <div key={i} className="text-[10px] text-slate-600 pl-3 flex justify-between">
                      <span>+ {mod.optionName}</span>
                      {mod.priceDelta > 0 && <span>+${mod.priceDelta.toFixed(2)}</span>}
                    </div>
                  ))}
                  {item.notes && (
                    <div className="text-[10px] text-slate-500 pl-3 italic">
                      Nota: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 space-y-1 border-b-2 border-dashed border-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>DESCUENTO ({discountPercentage}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>IVA (10%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-400">
                <span>TOTAL CONSUMO:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Suggested Tips */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] text-center space-y-1">
              <span className="font-bold block text-slate-700">PROPINA SUGERIDA (OPCIONAL):</span>
              <div className="flex justify-between text-slate-600 px-2">
                <span>10%: ${tip10}</span>
                <span>15%: ${tip15}</span>
                <span>20%: ${tip20}</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-3 text-center space-y-1 text-[9px] text-slate-500">
              <div className="font-bold uppercase tracking-wider text-slate-700">
                *** PRECUENTA INFORMATIVA ***
              </div>
              <div>NO VÁLIDO COMO FACTURA FISCAL</div>
              <div>¡GRACIAS POR SU VISITA!</div>
              <div className="pt-1 flex justify-center">
                <QrCode className="w-10 h-10 text-slate-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowPreBillModal(false)}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkPreBill}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marcar Precuenta</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
