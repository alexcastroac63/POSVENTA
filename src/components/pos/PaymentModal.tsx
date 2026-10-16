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
  ShieldCheck,
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    showPaymentModal,
    setShowPaymentModal,
    activeOrder,
    activeCartItems,
    selectedTable,
    currentUser,
    processPayment,
    showToast,
    setCurrentScreen,
  } = useRestaurant();

  const subtotal = activeCartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const tax = +(subtotal * 0.1).toFixed(2);
  const orderTotal = activeOrder ? activeOrder.total : +(subtotal + tax).toFixed(2);

  const [tenders, setTenders] = useState<PaymentEntry[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [changeAmount, setChangeAmount] = useState<number>(0);

  useEffect(() => {
    if (showPaymentModal) {
      setTenders([{ method: 'efectivo', amount: orderTotal }]);
      setIsSuccess(false);
      setChangeAmount(0);
    }
  }, [showPaymentModal, orderTotal]);

  if (!showPaymentModal) return null;

  const totalTendered = tenders.reduce((acc, t) => acc + t.amount, 0);
  const remainingBalance = Math.max(0, +(orderTotal - totalTendered).toFixed(2));
  const changeDue = Math.max(0, +(totalTendered - orderTotal).toFixed(2));

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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">
              CU-08: PROCESAMIENTO DE PAGOS & COBROS MIXTOS
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase">
              Liquidación de Cuenta {selectedTable ? `- Mesa ${selectedTable.number}` : ''}
            </h3>
          </div>
          {!isSuccess && (
            <button
              onClick={() => setShowPaymentModal(false)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSuccess ? (
          /* Payment Success Screen */
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center text-emerald-700 shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest block">
                TRANSACCIÓN EXITOSA
              </span>
              <h2 className="text-2xl font-black text-slate-900 uppercase mt-1">
                Cuenta Liquidada con Éxito
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Procesado por cajero: <strong>{currentUser.name}</strong> | Folio #{activeOrder?.orderNumber || 104}
              </p>
            </div>

            {/* Change banner */}
            <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 w-full max-w-sm text-center shadow-sm">
              <span className="text-xs font-mono uppercase text-slate-500 font-bold block">
                CAMBIO / VUELTO A ENTREGAR:
              </span>
              <span className="text-3xl font-black text-emerald-700 font-mono mt-1 block">
                ${changeAmount.toFixed(2)}
              </span>
            </div>

            <div className="pt-4 flex items-center gap-3 w-full max-w-sm">
              <button
                onClick={handleFinish}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                Aceptar & Volver a Mesas
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
            {/* Amount Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">TOTAL A PAGAR</span>
                <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
                  ${orderTotal.toFixed(2)}
                </span>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-center shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-sky-700 block font-bold">ABONADO TOTAL</span>
                <span className="text-xl font-black text-sky-800 font-mono mt-0.5 block">
                  ${totalTendered.toFixed(2)}
                </span>
              </div>

              <div
                className={`border rounded-xl p-3.5 text-center shadow-2xs ${
                  remainingBalance > 0
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <span className="text-[10px] font-mono uppercase block font-bold text-slate-600">
                  {remainingBalance > 0 ? 'SALDO RESTANTE' : 'CAMBIO / VUELTO'}
                </span>
                <span
                  className={`text-xl font-black font-mono mt-0.5 block ${
                    remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  ${(remainingBalance > 0 ? remainingBalance : changeDue).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Auto-fill Remaining Balance Quick Action */}
            {remainingBalance > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Auto-rellenar saldo restante (${remainingBalance.toFixed(2)}) con:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAutoFillRemaining('efectivo')}
                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    Efectivo
                  </button>
                  <button
                    onClick={() => handleAutoFillRemaining('tarjeta')}
                    className="px-2.5 py-1 bg-sky-50 border border-sky-300 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    Tarjeta
                  </button>
                  <button
                    onClick={() => handleAutoFillRemaining('vales')}
                    className="px-2.5 py-1 bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    Vales
                  </button>
                </div>
              </div>
            )}

            {/* Fast Cash Denominations Buttons */}
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Billetes Rápidos (Efectivo):
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleFastCash(val)}
                    className="py-2.5 bg-white hover:bg-emerald-50 hover:border-emerald-500 border border-slate-300 text-slate-800 font-black rounded-xl text-sm font-mono transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tenders Breakdown List */}
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Desglose de Formas de Pago Aplicadas:
              </span>
              <div className="space-y-2">
                {tenders.map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                        {entry.method === 'efectivo' && <Banknote className="w-4 h-4 text-emerald-600" />}
                        {entry.method === 'tarjeta' && <CreditCard className="w-4 h-4 text-sky-600" />}
                        {entry.method === 'vales' && <Ticket className="w-4 h-4 text-purple-600" />}
                        {entry.method === 'transferencia' && <QrCode className="w-4 h-4 text-amber-600" />}
                      </div>
                      <span className="text-xs font-bold uppercase text-slate-800 tracking-wide">
                        {entry.method}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black font-mono text-emerald-700">
                        ${entry.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveTender(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auditor Info Strip */}
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transacción auditada bajo usuario cajero: <strong>{currentUser.name}</strong></span>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isSuccess && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleProcess}
              disabled={totalTendered < orderTotal}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition flex items-center gap-2 shadow-md cursor-pointer"
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
