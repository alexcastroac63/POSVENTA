/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { HistoricalInvoiceCard } from './HistoricalInvoiceCard';
import { X, Receipt } from 'lucide-react';

export const HistoricalInvoiceModal: React.FC = () => {
  const {
    showInvoiceDetailModal,
    setShowInvoiceDetailModal,
    selectedInvoiceForDetail,
    setSelectedInvoiceForDetail,
  } = useRestaurant();

  if (!showInvoiceDetailModal || !selectedInvoiceForDetail) return null;

  const handleClose = () => {
    setShowInvoiceDetailModal(false);
    setSelectedInvoiceForDetail(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn font-sans">
      <div className="w-full max-w-3xl bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                CONSULTA DE FACTURA HISTÓRICA
              </span>
              <h2 className="text-lg font-black text-slate-900">
                {selectedInvoiceForDetail.header.documentNumber}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50">
          <HistoricalInvoiceCard invoice={selectedInvoiceForDetail} showPrintAction={true} />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            Cerrar Comprobante
          </button>
        </div>
      </div>
    </div>
  );
};
