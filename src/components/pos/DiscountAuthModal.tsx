/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, ShieldAlert, Check, Lock } from 'lucide-react';

export const DiscountAuthModal: React.FC = () => {
  const {
    showDiscountAuthModal,
    setShowDiscountAuthModal,
    applyDiscount,
    showToast,
  } = useRestaurant();

  const [percentage, setPercentage] = useState<number>(10);
  const [supervisorPin, setSupervisorPin] = useState<string>('9999');
  const [reason, setReason] = useState<string>('Cortesía de Fidelidad de Cliente');

  if (!showDiscountAuthModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supervisorPin === '9999' || supervisorPin === '4321') {
      applyDiscount(percentage, 'Elena Sandoval (Gerente)');
      setShowDiscountAuthModal(false);
    } else {
      showToast('PIN de supervisor incorrecto. Autorización denegada.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-100 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">
                CU-10: CONTROL Y AUTORIZACIÓN
              </span>
              <h3 className="text-base font-black text-slate-900 uppercase">
                Aplicar Descuento a la Comanda
              </h3>
            </div>
          </div>
          <button
            onClick={() => setShowDiscountAuthModal(false)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 bg-white">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2">
              Porcentaje de Descuento:
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[5, 10, 15, 20].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPercentage(p)}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    percentage === p
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-600 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Motivo del Descuento / Ajuste:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 shadow-2xs cursor-pointer"
            >
              <option value="Cortesía de Fidelidad de Cliente">Cortesía de Fidelidad de Cliente</option>
              <option value="Compensación por Demora en Cocina">Compensación por Demora en Cocina</option>
              <option value="Descuento Colaborador / Personal">Descuento Colaborador / Personal</option>
              <option value="Promoción de Apertura / Evento">Promoción de Apertura / Evento</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              PIN de Autorización de Supervisor (Elena: 9999):
            </label>
            <input
              type="password"
              value={supervisorPin}
              onChange={(e) => setSupervisorPin(e.target.value)}
              placeholder="Ingrese PIN..."
              className="w-full bg-slate-50 border-2 border-amber-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono tracking-widest focus:bg-white focus:outline-none focus:border-amber-600 shadow-2xs"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Se registrará en la bitácora inmutable de auditoría gerencial.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowDiscountAuthModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Autorizar Descuento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
