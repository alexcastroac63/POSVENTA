/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem } from '../../types/restaurant';
import { ModifierModal } from './ModifierModal';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Receipt,
  Users,
  CreditCard,
  Percent,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  SlidersHorizontal,
} from 'lucide-react';

export const PosOrderingScreen: React.FC = () => {
  const {
    menuItems,
    activeCartItems,
    updateCartItemQty,
    removeCartItem,
    sendOrderToKitchen,
    selectedChannel,
    deliveryPlatform,
    selectedTable,
    setCurrentScreen,
    getEffectivePrice,
    setModifierModalItem,
    setShowSplitModal,
    setShowPreBillModal,
    setShowPaymentModal,
    setShowDiscountAuthModal,
    discountPercentage,
    cartNotes,
    setCartNotes,
  } = useRestaurant();

  const [activeCategory, setActiveCategory] = useState<
    'todos' | 'principal' | 'hamburguesas' | 'cenas' | 'promos' | 'bebidas' | 'postres'
  >('principal');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'principal', label: 'PRINCIPAL' },
    { id: 'hamburguesas', label: 'HAMBURGUESAS' },
    { id: 'cenas', label: 'CENAS' },
    { id: 'promos', label: 'PROMOS' },
    { id: 'bebidas', label: 'BEBIDAS' },
    { id: 'postres', label: 'POSTRES' },
  ];

  const filteredProducts = menuItems.filter((item) => {
    if (selectedChannel === 'mesa' && !item.isAvailableOnMesa) return false;
    if (selectedChannel === 'llevar' && !item.isAvailableOnLlevar) return false;
    if (selectedChannel === 'delivery' && !item.isAvailableOnDelivery) return false;

    if (activeCategory !== 'todos' && item.category !== activeCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleProductClick = (item: MenuItem) => {
    setModifierModalItem(item);
  };

  const subtotal = activeCartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const discountAmount = +(subtotal * (discountPercentage / 100)).toFixed(2);
  const taxable = subtotal - discountAmount;
  const taxAmount = +(taxable * 0.10).toFixed(2);
  const total = +(taxable + taxAmount).toFixed(2);

  return (
    <div className="flex-1 bg-slate-100 flex flex-col p-2 sm:p-4 font-sans select-none overflow-hidden">
      {/* Wireframe Browser Header Bar (Executive Light) */}
      <div className="w-full bg-white border border-slate-300 rounded-xl mb-3 p-2.5 flex items-center justify-between gap-3 text-slate-700 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen(selectedChannel === 'mesa' ? 'table_map' : 'channel_select')}
            className="p-1 hover:text-slate-900 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Regresar</span>
          </button>
          <button className="p-1 hover:text-slate-900 transition"><ArrowRight className="w-4 h-4" /></button>
          <button className="p-1 hover:text-slate-900 transition"><RotateCw className="w-4 h-4" /></button>
          <button onClick={() => setCurrentScreen('channel_select')} className="p-1 hover:text-slate-900 transition">
            <Home className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 max-w-sm bg-slate-50 border border-slate-300 rounded-md px-3 py-1 text-xs text-center text-slate-600 font-mono truncate shadow-2xs">
          https://pos.restoxyz.internal/order?channel={selectedChannel}
          {selectedTable ? `&table=${selectedTable.number}` : ''}
        </div>

        {/* Active context badge */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {selectedChannel === 'mesa' ? (
            <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-2xs">
              {selectedTable ? `${selectedTable.salonName} - MESA ${selectedTable.number}` : 'MESA SELECCIONADA'}
            </span>
          ) : selectedChannel === 'delivery' ? (
            <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 shadow-2xs">
              DELIVERY: {deliveryPlatform} (Tarifa +18%)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-sky-50 border border-sky-300 text-sky-800 shadow-2xs">
              PARA LLEVAR (Mostrador)
            </span>
          )}
        </div>
      </div>

      {/* Main Dual-Column Ordering Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Section (Cols 8): Categories & Product Grid */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-slate-300 rounded-2xl overflow-hidden p-3 sm:p-4 shadow-sm">
          {/* Top Controls: Wireframe Categories Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            {/* Categories Buttons matching Screen 3 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black tracking-wider transition uppercase active:scale-95 whitespace-nowrap cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o SKU..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Product Grid: 12 Products matching wireframe */}
          <div className="flex-1 overflow-y-auto mt-3 pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const effectivePrice = getEffectivePrice(product, selectedChannel);
                const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="bg-white border-2 border-slate-200 hover:border-emerald-600 rounded-2xl overflow-hidden p-3 flex flex-col justify-between cursor-pointer transition group hover:shadow-md active:scale-98 relative"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-xs text-[10px] font-mono text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                        {product.sku}
                      </div>
                      {hasModifiers && (
                        <div className="absolute top-1.5 right-1.5 bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-300 shadow-2xs flex items-center gap-1">
                          <SlidersHorizontal className="w-2.5 h-2.5 text-emerald-600" /> Combos
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="flex-1 mb-2">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Add Trigger */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div className="text-sm font-black text-emerald-700 font-mono">
                        ${effectivePrice.toFixed(2)}
                      </div>
                      <span className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition border border-emerald-200">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Section (Cols 4): Order Comanda Ticket */}
        <div className="lg:col-span-4 flex flex-col bg-white border border-slate-300 rounded-2xl overflow-hidden p-3 sm:p-4 shadow-sm">
          {/* Wireframe Ticket Header: MESA 3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between mb-3 shadow-2xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                COMANDA ACTIVA
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                {selectedTable ? `MESA ${selectedTable.number}` : selectedChannel.toUpperCase()}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block font-bold">
                {activeCartItems.length} ítems
              </span>
              {discountPercentage > 0 && (
                <span className="text-[10px] text-amber-700 font-bold">
                  -{discountPercentage}% Desc
                </span>
              )}
            </div>
          </div>

          {/* Items List (Strict replica of wireframe: PRODUCTO 1 | X1 | $ 20) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
            {activeCartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Receipt className="w-12 h-12 mb-2 stroke-1 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Comanda vacía</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Toque los productos de la izquierda para agregarlos al pedido.
                </p>
              </div>
            ) : (
              activeCartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs"
                >
                  {/* Top line matching wireframe: PRODUCTO 1 | X1 | $ 20 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        {item.name}
                      </span>
                      {item.assignedGuestName && (
                        <span className="text-[10px] text-sky-700 font-medium">
                          👤 {item.assignedGuestName}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-500">
                      x{item.quantity}
                    </div>
                    <div className="text-xs font-mono font-black text-emerald-700">
                      ${item.subtotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Modifiers Pill Details */}
                  {item.selectedModifiers.length > 0 && (
                    <div className="text-[10px] text-slate-600 bg-white p-1.5 rounded-lg border border-slate-200 space-y-0.5">
                      {item.selectedModifiers.map((mod, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-700">
                          <span>• {mod.groupName}: <strong>{mod.optionName}</strong></span>
                          {mod.priceDelta > 0 && (
                            <span className="text-amber-700 font-mono font-bold">+${mod.priceDelta.toFixed(2)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Note */}
                  {item.notes && (
                    <div className="text-[10px] text-amber-800 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Nota: "{item.notes}"
                    </div>
                  )}

                  {/* Controls Row: - / + / trash */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Unit: ${item.unitPrice.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateCartItemQty(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQty(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="w-6 h-6 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center ml-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Freeform Notes Input */}
          <div className="mb-2">
            <input
              type="text"
              value={cartNotes}
              onChange={(e) => setCartNotes(e.target.value)}
              placeholder="Notas generales de la comanda..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 shadow-2xs"
            />
          </div>

          {/* Wireframe Subtotal & Total Box (Matching SUB TOTAL: $ 20.00) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 mb-3 shadow-2xs">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="uppercase font-mono font-bold">SUB TOTAL:</span>
              <span className="font-mono text-slate-800 font-bold">${subtotal.toFixed(2)}</span>
            </div>

            {discountPercentage > 0 && (
              <div className="flex justify-between text-xs text-amber-800 font-bold">
                <span>DESCUENTO ({discountPercentage}%):</span>
                <span className="font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-slate-600">
              <span>IVA (10%):</span>
              <span className="font-mono">${taxAmount.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900 uppercase tracking-wider">TOTAL A PAGAR:</span>
              <span className="text-xl font-black text-emerald-700 font-mono">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="space-y-2">
            {/* Primary Action: Enviar a Cocina (KDS) */}
            <button
              onClick={sendOrderToKitchen}
              disabled={activeCartItems.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-black py-3 px-3 rounded-xl shadow-md text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ChefHat className="w-4 h-4" />
              <span>ENVIAR A COCINA (KDS)</span>
            </button>

            {/* Secondary Actions Row */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setShowPreBillModal(true)}
                disabled={activeCartItems.length === 0}
                className="py-2 px-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="text-[10px]">PRECUENTA</span>
              </button>

              <button
                onClick={() => setShowSplitModal(true)}
                disabled={activeCartItems.length === 0}
                className="py-2 px-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px]">DIVIDIR</span>
              </button>

              <button
                onClick={() => setShowDiscountAuthModal(true)}
                className="py-2 px-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer shadow-2xs"
              >
                <Percent className="w-3.5 h-3.5" />
                <span className="text-[10px]">DESCUENTO</span>
              </button>
            </div>

            {/* Cobrar Button */}
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={activeCartItems.length === 0}
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-98 disabled:opacity-50 text-white font-black py-2.5 px-3 rounded-xl shadow-md text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>COBRAR / PAGAR (${total.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      <ModifierModal />
    </div>
  );
};
