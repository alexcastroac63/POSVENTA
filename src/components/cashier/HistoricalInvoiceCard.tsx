/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HistoricalInvoice } from '../../types/restaurant';
import {
  Receipt,
  Printer,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  UtensilsCrossed,
  CreditCard,
  Banknote,
  Tag,
  ChefHat,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface HistoricalInvoiceCardProps {
  invoice: HistoricalInvoice;
  showPrintAction?: boolean;
  compact?: boolean;
}

export const HistoricalInvoiceCard: React.FC<HistoricalInvoiceCardProps> = ({
  invoice,
  showPrintAction = true,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(invoice.header.documentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const { header, items } = invoice;

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-md overflow-hidden text-slate-800 font-sans print:border-none print:shadow-none text-left">
      {/* Invoice Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 border-b border-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                COMPROBANTE FISCAL HISTÓRICO
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                TICKET #{header.ticketNumber}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-400" />
              <span>{header.documentNumber}</span>
            </h3>
            <p className="text-xs text-slate-300">
              RESTO-XYZ • Sucursal Central #01 • NIT/RUC 901.834.112-9
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-slate-200 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Copiar número de factura"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            {showPrintAction && (
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                title="Imprimir ticket / factura"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            )}
          </div>
        </div>

        {/* Header Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-700/80 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Fecha & Hora:
            </span>
            <span className="font-bold text-slate-200 mt-0.5 block">{header.dateTime}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold flex items-center gap-1">
              <UtensilsCrossed className="w-3 h-3 text-slate-400" /> Canal de Venta:
            </span>
            <span className="font-bold text-emerald-300 mt-0.5 block capitalize">{header.salesChannelLabel}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" /> Cajero / Operador:
            </span>
            <span className="font-bold text-slate-200 mt-0.5 block">{header.cashierName}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-slate-400" /> Forma de Pago:
            </span>
            <span className="font-bold text-sky-300 mt-0.5 block">{header.paymentMethod}</span>
          </div>
        </div>

        {/* Additional Header Row: Descuento & Monto Cobrado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/50 text-xs">
          {/* Descuento Status */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <Tag className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Descuento Aplicado:
              </span>
              <span className="font-semibold text-slate-200 text-xs">
                {header.discountApplied ? (
                  <span className="text-amber-300 font-bold">
                    Sí, {header.discountPercentage}% (-${header.discountAmount.toFixed(2)})
                    {header.discountAuthorizedBy && ` • Aut: ${header.discountAuthorizedBy}`}
                  </span>
                ) : (
                  <span className="text-slate-400">Sin descuento aplicado ($0.00)</span>
                )}
              </span>
            </div>
          </div>

          {/* Monto Cobrado vs Monto Total */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Monto Cobrado / Abonado:
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                ${header.totalCharged.toFixed(2)}
              </span>
            </div>
            {header.changeGiven > 0 && (
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Cambio Entregado:
                </span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  ${header.changeGiven.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Section: Menú Enviado & Sub-detalle de Productos Internos */}
      <div className="p-4 sm:p-6 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Detalle de Productos Vendidos & Sub-Detalle Interno
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {items.reduce((acc, i) => acc + i.quantity, 0)} artículos en total
          </span>
        </div>

        {/* Invoice Items List */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const isExpanded = expandedItems[item.id] !== false; // expanded by default
            return (
              <div
                key={item.id || index}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:border-slate-300 transition"
              >
                {/* Menu Item Main Row (Menú Enviado) */}
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/80">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center flex-shrink-0 border border-emerald-300">
                      {item.quantity}x
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-900 uppercase">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          {item.sku}
                        </span>
                        {item.allowDiscounts === false && (
                          <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
                            🛡️ Sin Descuento
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-amber-700 italic mt-0.5">
                          Nota: "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Expand button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">
                        ${item.unitPrice.toFixed(2)} c/u
                      </span>
                      <span className="text-sm font-black font-mono text-slate-900 block">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {item.internalProducts && item.internalProducts.length > 0 && (
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        title="Ver / Ocultar sub-detalle de productos internos"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Detalle de los Productos Internos de Cada Menú */}
                {isExpanded && item.internalProducts && item.internalProducts.length > 0 && (
                  <div className="px-4 py-3 bg-white border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Sub-Detalle de Productos Internos del Menú:
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.internalProducts.length} componente(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {item.internalProducts.map((ip, pIdx) => {
                        const isCocina = ip.preparationType === 'cocina_interna';
                        return (
                          <div
                            key={pIdx}
                            className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {/* Order Number Badge */}
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                {ip.order || pIdx + 1}
                              </span>

                              <div>
                                <span className="font-bold text-slate-800">
                                  {ip.productName}
                                </span>
                                {ip.selectedOptionName && ip.selectedOptionName !== ip.productName && (
                                  <span className="text-slate-600 font-medium ml-1.5">
                                    → <strong className="text-emerald-700">{ip.selectedOptionName}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Preparation Type Badge */}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                  isCocina
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-sky-100 text-sky-900 border border-sky-300'
                                }`}
                              >
                                {isCocina ? (
                                  <>
                                    <ChefHat className="w-3 h-3 text-amber-700" />
                                    <span>Cocina Interna</span>
                                  </>
                                ) : (
                                  <>
                                    <span>🥪 Armado con Menú</span>
                                  </>
                                )}
                              </span>

                              {/* Price delta or without cost */}
                              {typeof ip.priceDelta === 'number' && ip.priceDelta > 0 ? (
                                <span className="font-mono text-emerald-700 font-bold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  +${ip.priceDelta.toFixed(2)} (Con costo)
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  (Sin costo adicional)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Totals Summary Footer Card */}
        <div className="mt-5 p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
          <div className="space-y-1.5 text-xs text-slate-600 border-b border-slate-200 pb-3">
            <div className="flex justify-between items-center">
              <span>Subtotal Neto:</span>
              <span className="font-mono font-bold text-slate-900">${header.subtotal.toFixed(2)}</span>
            </div>

            {header.discountApplied && (
              <div className="flex justify-between items-center text-amber-700 font-bold">
                <span>Descuento Otorgado ({header.discountPercentage}%):</span>
                <span className="font-mono">-${header.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span>Impuesto al Consumo / IVA (10%):</span>
              <span className="font-mono font-bold text-slate-900">${header.taxAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-3 flex justify-between items-center text-slate-900">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider block text-slate-500">
                TOTAL FACTURADO:
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Estado: Factura Histórica Liquidada
              </span>
            </div>
            <span className="text-2xl font-black font-mono text-emerald-700">
              ${header.totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              <span>Monto Abonado: </span>
              <strong className="font-mono text-slate-900">${header.totalCharged.toFixed(2)}</strong>
              <span className="text-slate-400 mx-1">•</span>
              <span>Medio: </span>
              <strong className="text-slate-800">{header.paymentMethod}</strong>
            </div>

            {header.changeGiven > 0 && (
              <div className="font-bold text-emerald-700">
                Cambio Entregado: <span className="font-mono">${header.changeGiven.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
