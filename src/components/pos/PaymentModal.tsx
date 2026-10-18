/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { PaymentMethod, PaymentEntry } from '../../types/restaurant';
import { HistoricalInvoiceCard } from '../cashier/HistoricalInvoiceCard';
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
  Printer,
  ArrowRight,
  Check,
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
    lastProcessedInvoice,
    selectedChannel,
  } = useRestaurant();

  const subtotal = activeCartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const tax = +(subtotal * 0.1).toFixed(2);
  const orderTotal = activeOrder ? activeOrder.total : +(subtotal + tax).toFixed(2);

  const [tenders, setTenders] = useState<PaymentEntry[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [changeAmount, setChangeAmount] = useState<number>(0);

  // Initialize tenders only once when the modal opens
  useEffect(() => {
    if (showPaymentModal) {
      const initialTotal = activeOrder ? activeOrder.total : +(subtotal + tax).toFixed(2);
      setTenders([{ method: 'efectivo', amount: initialTotal }]);
      setIsSuccess(false);
      setChangeAmount(0);
    }
  }, [showPaymentModal]);

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

  // Keyboard shortcut: Press Enter or Escape on success screen to immediately accept
  useEffect(() => {
    if (!isSuccess) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleAcceptToChannels();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSuccess]);

  // Navigate back to channels screen (Request 4)
  const handleAcceptToChannels = () => {
    setShowPaymentModal(false);
    setIsSuccess(false);
    setTenders([]);
    setChangeAmount(0);
    setCurrentScreen('channel_select');
    showToast('Cobro liquidado • Retornando a Pantalla de Canales');
  };

  // Navigate back to origin channel (e.g. Mesas)
  const handleAcceptToOrigin = () => {
    setShowPaymentModal(false);
    setIsSuccess(false);
    setTenders([]);
    setChangeAmount(0);
    if (selectedChannel === 'mesa') {
      setCurrentScreen('table_map');
      showToast('Cobro liquidado • Retornando al canal de Mesas (Salón)');
    } else {
      setCurrentScreen('channel_select');
      showToast('Cobro liquidado • Retornando a Pantalla de Canales');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (isSuccess) handleAcceptToChannels();
          else setShowPaymentModal(false);
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-fadeIn"
    >
      <div className="w-full max-w-3xl bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isSuccess
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-slate-100 text-slate-900 border-slate-200'
          }`}
        >
          {isSuccess && lastProcessedInvoice ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0 animate-bounce">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-white/25 px-2 py-0.5 rounded text-white inline-block">
                  COMPROBANTE OFICIAL EMITIDO
                </span>
                <h3 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                  ¡Cobro Realizado con Éxito!
                </h3>
                <p className="text-xs text-emerald-100 font-mono">
                  Factura Emitida: <strong className="text-white underline">{lastProcessedInvoice.header.documentNumber}</strong> (Ticket #{lastProcessedInvoice.header.ticketNumber})
                </p>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                CU-08: PROCESAMIENTO DE PAGOS & COBROS MIXTOS
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase">
                Liquidación de Cuenta {selectedTable ? `- Mesa ${selectedTable.number}` : ''}
              </h3>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isSuccess && (
              <button
                type="button"
                onClick={handleAcceptToChannels}
                className="px-3.5 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                title="Aceptar y volver a la pantalla de Canales"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aceptar</span>
              </button>
            )}

            <button
              onClick={isSuccess ? handleAcceptToChannels : () => setShowPaymentModal(false)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isSuccess
                  ? 'text-white/80 hover:text-white hover:bg-emerald-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={isSuccess ? 'Aceptar y volver a la pantalla de Canales' : 'Cerrar'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isSuccess && lastProcessedInvoice ? (
          /* Ventana Flotante Exclusiva de la Factura Emitida con Footer Fijo */
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/70">
              {/* Banner de Cambio si aplica */}
              {changeAmount > 0 && (
                <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase font-mono block text-emerald-900">
                        CAMBIO / VUELTO A ENTREGAR:
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium">
                        Entregar al cliente de inmediato
                      </span>
                    </div>
                  </div>
                  <span className="text-3xl font-black font-mono text-emerald-700">
                    ${changeAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Factura Emitida Completa (Encabezado, Detalle y Sub-detalle) */}
              <div>
                <HistoricalInvoiceCard invoice={lastProcessedInvoice} showPrintAction={true} />
              </div>
            </div>

            {/* Footer Fijo Siempre Visible al Fondo (No requiere hacer scroll para ver Aceptar) */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md z-10">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Imprimir Factura</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                {selectedChannel === 'mesa' && (
                  <button
                    type="button"
                    onClick={handleAcceptToOrigin}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <span>Volver a Mesas (Salón)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAcceptToChannels}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aceptar y Volver a Canales</span>
                </button>
              </div>
            </div>
          </>
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
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleFastCash(val)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl font-mono font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95 text-center"
                  >
                    +${val}
                  </button>
                ))}
                {[200, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleFastCash(val)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl font-mono font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95 text-center"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Split / Tendered Entries List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Desglose de Formas de Pago Ingresadas:
                </span>
                <span className="text-[11px] text-slate-500">
                  {tenders.length} método(s) registrado(s)
                </span>
              </div>

              <div className="space-y-2">
                {tenders.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-700 font-bold">
                        {entry.method === 'efectivo' && <Banknote className="w-4 h-4 text-emerald-600" />}
                        {entry.method === 'tarjeta' && <CreditCard className="w-4 h-4 text-sky-600" />}
                        {entry.method === 'vales' && <Ticket className="w-4 h-4 text-purple-600" />}
                        {entry.method === 'transferencia' && <QrCode className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 uppercase block">
                          {entry.method}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {entry.method === 'efectivo' ? 'Pago en caja' : 'Comprobante digital'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-base font-black font-mono text-slate-900 block">
                          ${entry.amount.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveTender(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Eliminar este abono"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-2xs"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleProcess}
                disabled={totalTendered < orderTotal}
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {totalTendered >= orderTotal
                    ? `Liquidar y Emitir Factura ($${totalTendered.toFixed(2)})`
                    : `Faltan $${remainingBalance.toFixed(2)} para cubrir`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
