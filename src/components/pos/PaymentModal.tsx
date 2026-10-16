/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { PaymentMethod, PaymentEntry } from '../../types/restaurant';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  Banknote,
  Ticket,
  QrCode,
  Zap,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    showPaymentModal,
    setShowPaymentModal,
    activeOrder,
    activeCartItems,
    selectedTable,
    selectedChannel,
    currentUser,
    processPayment,
    showToast,
    setCurrentScreen,
  } = useRestaurant();

  if (!showPaymentModal) return null;

  // Calculate order total
  const subtotal = activeCartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const tax = +(subtotal * 0.1).toFixed(2);
  const orderTotal = activeOrder ? activeOrder.total : +(subtotal + tax).toFixed(2);

  // Payment entries (Cobro mixto)
  const [tenders, setTenders] = useState<PaymentEntry[]>([
    { method: 'efectivo', amount: orderTotal },
  ]);

  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('efectivo');
  const [inputAmount, setInputAmount] = useState<string>(orderTotal.toFixed(2));
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [changeAmount, setChangeAmount] = useState<number>(0);

  const totalTendered = tenders.reduce((acc, t) => acc + t.amount, 0);
  const remainingBalance = Math.max(0, +(orderTotal - totalTendered).toFixed(2));
  const changeDue = Math.max(0, +(totalTendered - orderTotal).toFixed(2));

  // Auto-fill remaining balance logic as specified in PDF
  const handleAutoFillRemaining = (method: PaymentMethod) => {
    if (remainingBalance <= 0) {
      showToast('La cuenta ya está completamente cubierta');
      return;
    }
    const newEntry: PaymentEntry = {
      method,
      amount: remainingBalance,
    };
    setTenders((prev) => [...prev, newEntry]);
    showToast(`$${remainingBalance.toFixed(2)} asignado a ${method.toUpperCase()} automáticamente`);
  };

  const handleAddTender = (method: PaymentMethod, amt: number) => {
    if (amt <= 0) return;
    setTenders((prev) => [...prev, { method, amount: amt }]);
  };

  const handleRemoveTender = (index: number) => {
    setTenders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFastCash = (val: number) => {
    handleAddTender('efectivo', val);
  };

  const handleProcess = () => {
    if (totalTendered < orderTotal) {
      showToast('El importe total ingresado no cubre el monto a pagar');
      return;
    }

    const tx = processPayment(tenders);
    if (tx) {
      setChangeAmount(tx.changeGiven);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleFinish = () => {
    setShowPaymentModal(false);
    setIsSuccess(false);
    setCurrentScreen('table_map');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 border-b-2 border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              CU-08: PROCESAMIENTO DE PAGOS & COBROS MIXTOS
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase">
              Liquidación de Cuenta {selectedTable ? `- Mesa ${selectedTable.number}` : ''}
            </h3>
          </div>
          {!isSuccess && (
            <button
              onClick={() => setShowPaymentModal(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSuccess ? (
          /* Payment Success Screen */
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="w-20 h-20 rounded-full bg-emerald-950 border-4 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-xl animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                TRANSACCIÓN EXITOSA
              </span>
              <h2 className="text-2xl font-black text-white uppercase mt-1">
                Cuenta Liquidada con Éxito
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Procesado por cajero: <strong>{currentUser.name}</strong> | Folio #{activeOrder?.orderNumber || 104}
              </p>
            </div>

            {/* Change banner */}
            <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-5 w-full max-w-sm text-center">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                CAMBIO / VUELTO A ENTREGAR:
              </span>
              <span className="text-3xl font-black text-emerald-400 font-mono mt-1 block">
                ${changeAmount.toFixed(2)}
              </span>
            </div>

            <div className="pt-4 flex items-center gap-3 w-full max-w-sm">
              <button
                onClick={handleFinish}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
              >
                Aceptar & Volver a Mesas
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Amount Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">TOTAL A PAGAR</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">
                  ${orderTotal.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">ABONADO TOTAL</span>
                <span className="text-xl font-black text-sky-400 font-mono mt-0.5 block">
                  ${totalTendered.toFixed(2)}
                </span>
              </div>

              <div
                className={`border rounded-xl p-3.5 text-center ${
                  remainingBalance > 0
                    ? 'bg-amber-950/40 border-amber-500/40'
                    : 'bg-emerald-950/40 border-emerald-500/40'
                }`}
              >
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  {remainingBalance > 0 ? 'SALDO RESTANTE' : 'CAMBIO / VUELTO'}
                </span>
                <span
                  className={`text-xl font-black font-mono mt-0.5 block ${
                    remainingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  ${(remainingBalance > 0 ? remainingBalance : changeDue).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Auto-fill Remaining Balance Quick Action (As requested in requirements) */}
            {remainingBalance > 0 && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Auto-rellenar saldo restante (${remainingBalance.toFixed(2)}) con:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAutoFillRemaining('efectivo')}
                    className="px-2.5 py-1 bg-emerald-950 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs font-bold transition"
                  >
                    Efectivo
                  </button>
                  <button
                    onClick={() => handleAutoFillRemaining('tarjeta')}
                    className="px-2.5 py-1 bg-blue-950 border border-blue-500/40 hover:bg-blue-900 text-blue-300 rounded-lg text-xs font-bold transition"
                  >
                    Tarjeta
                  </button>
                  <button
                    onClick={() => handleAutoFillRemaining('vales')}
                    className="px-2.5 py-1 bg-purple-950 border border-purple-500/40 hover:bg-purple-900 text-purple-300 rounded-lg text-xs font-bold transition"
                  >
                    Vales
                  </button>
                </div>
              </div>
            )}

            {/* Fast Cash Denominations Buttons */}
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Billetes Rápidos (Efectivo):
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleFastCash(val)}
                    className="py-2.5 bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 font-black rounded-xl text-sm font-mono transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tenders Breakdown List */}
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Desglose de Formas de Pago Aplicadas:
              </span>
              <div className="space-y-2">
                {tenders.map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                        {entry.method === 'efectivo' && <Banknote className="w-4 h-4 text-emerald-400" />}
                        {entry.method === 'tarjeta' && <CreditCard className="w-4 h-4 text-sky-400" />}
                        {entry.method === 'vales' && <Ticket className="w-4 h-4 text-purple-400" />}
                        {entry.method === 'transferencia' && <QrCode className="w-4 h-4 text-amber-400" />}
                      </div>
                      <span className="text-xs font-bold uppercase text-white tracking-wide">
                        {entry.method}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black font-mono text-emerald-400">
                        ${entry.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveTender(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auditor Info Strip */}
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transacción auditada bajo usuario cajero: <strong>{currentUser.name}</strong></span>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isSuccess && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>

            <button
              onClick={handleProcess}
              disabled={totalTendered < orderTotal}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 disabled:opacity-50 text-white font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRMAR & REGISTRAR COBRO (${totalTendered.toFixed(2)})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
