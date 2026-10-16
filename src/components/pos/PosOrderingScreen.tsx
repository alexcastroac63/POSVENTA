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
  MessageSquare,
  AlertCircle,
  Tag,
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
    discountAuthorizedBy,
    cartNotes,
    setCartNotes,
  } = useRestaurant();

  const [activeCategory, setActiveCategory] = useState<
    'todos' | 'principal' | 'hamburguesas' | 'cenas' | 'promos' | 'bebidas' | 'postres'
  >('principal');
  const [searchQuery, setSearchQuery] = useState('');

  // Wireframe categories matching Screen 3: PRINCIPAL, HAMBURGUESAS, CENAS, PROMOS
  const categories = [
    { id: 'principal', label: 'PRINCIPAL' },
    { id: 'hamburguesas', label: 'HAMBURGUESAS' },
    { id: 'cenas', label: 'CENAS' },
    { id: 'promos', label: 'PROMOS' },
    { id: 'bebidas', label: 'BEBIDAS' },
    { id: 'postres', label: 'POSTRES' },
  ];

  // Filter products by category, channel availability, and search
  const filteredProducts = menuItems.filter((item) => {
    // Check channel availability
    if (selectedChannel === 'mesa' && !item.isAvailableOnMesa) return false;
    if (selectedChannel === 'llevar' && !item.isAvailableOnLlevar) return false;
    if (selectedChannel === 'delivery' && !item.isAvailableOnDelivery) return false;

    // Check category
    if (activeCategory !== 'todos' && item.category !== activeCategory) return false;

    // Check search query
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
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setModifierModalItem(item);
    } else {
      // Direct add
      const { addItemToCart } = useRestaurant();
      // We can invoke it or set modifierModalItem
      setModifierModalItem(item); // opens clean modal with notes and price verification
    }
  };

  // Calculations for active comanda
  const subtotal = activeCartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const discountAmount = +(subtotal * (discountPercentage / 100)).toFixed(2);
  const taxable = subtotal - discountAmount;
  const taxAmount = +(taxable * 0.10).toFixed(2);
  const total = +(taxable + taxAmount).toFixed(2);

  return (
    <div className="flex-1 bg-slate-900 flex flex-col p-2 sm:p-4 font-sans select-none overflow-hidden">
      {/* Wireframe Browser Header Bar (As in Blank diagram (7).svg) */}
      <div className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl mb-3 p-2 flex items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen(selectedChannel === 'mesa' ? 'table_map' : 'channel_select')}
            className="p-1 hover:text-white transition flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Regresar</span>
          </button>
          <button className="p-1 hover:text-white transition"><ArrowRight className="w-4 h-4" /></button>
          <button className="p-1 hover:text-white transition"><RotateCw className="w-4 h-4" /></button>
          <button onClick={() => setCurrentScreen('channel_select')} className="p-1 hover:text-white transition">
            <Home className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 max-w-sm bg-slate-900 border border-slate-700 rounded-md px-3 py-1 text-xs text-center text-slate-400 font-mono truncate">
          https://pos.restoxyz.internal/order?channel={selectedChannel}
          {selectedTable ? `&table=${selectedTable.number}` : ''}
        </div>

        {/* Active context badge */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {selectedChannel === 'mesa' ? (
            <span className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300">
              {selectedTable ? `${selectedTable.salonName} - MESA ${selectedTable.number}` : 'MESA SELECCIONADA'}
            </span>
          ) : selectedChannel === 'delivery' ? (
            <span className="px-3 py-1 rounded-lg bg-amber-950 border border-amber-500/50 text-amber-300">
              DELIVERY: {deliveryPlatform} (Tarifa +18%)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-sky-950 border border-sky-500/50 text-sky-300">
              PARA LLEVAR (Mostrador)
            </span>
          )}
        </div>
      </div>

      {/* Main Dual-Column Ordering Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Section (Cols 7 or 8): Categories & Product Grid */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 border-2 border-slate-700 rounded-2xl overflow-hidden p-3 sm:p-4">
          {/* Top Controls: Wireframe Categories Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            {/* Categories Buttons matching Screen 3 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-black tracking-wider transition uppercase active:scale-95 whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
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
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
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
                    className="bg-slate-900 border-2 border-slate-800 hover:border-emerald-500 rounded-2xl overflow-hidden p-3 flex flex-col justify-between cursor-pointer transition group hover:shadow-xl active:scale-98 relative"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-800">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        {product.sku}
                      </div>
                      {hasModifiers && (
                        <div className="absolute top-1.5 right-1.5 bg-emerald-950/90 text-emerald-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                          <SlidersHorizontal className="w-2.5 h-2.5" /> Combos
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="flex-1 mb-2">
                      <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-400 transition leading-snug line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Add Trigger */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between mt-auto">
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        ${effectivePrice.toFixed(2)}
                      </div>
                      <span className="w-7 h-7 rounded-lg bg-emerald-600/30 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white flex items-center justify-center transition">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Section (Cols 4 or 5): Wireframe Order Comanda Ticket */}
        <div className="lg:col-span-4 flex flex-col bg-slate-950 border-2 border-slate-700 rounded-2xl overflow-hidden p-3 sm:p-4">
          {/* Wireframe Ticket Header: MESA 3 */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-3 flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                COMANDA ACTIVA
              </span>
              <h3 className="text-base sm:text-lg font-black text-white uppercase">
                {selectedTable ? `MESA ${selectedTable.number}` : selectedChannel.toUpperCase()}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 block font-bold">
                {activeCartItems.length} ítems
              </span>
              {discountPercentage > 0 && (
                <span className="text-[10px] text-amber-400 font-bold">
                  -{discountPercentage}% Desc
                </span>
              )}
            </div>
          </div>

          {/* Items List (Strict replica of wireframe: PRODUCTO 1 | X1 | $ 20) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
            {activeCartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Receipt className="w-12 h-12 mb-2 stroke-1 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Comanda vacía</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Toque los productos de la izquierda para agregarlos al pedido.
                </p>
              </div>
            ) : (
              activeCartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5"
                >
                  {/* Top line matching wireframe: PRODUCTO 1 | X1 | $ 20 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                      <span className="text-xs font-bold text-white block truncate">
                        {item.name}
                      </span>
                      {item.assignedGuestName && (
                        <span className="text-[10px] text-sky-400 font-medium">
                          👤 {item.assignedGuestName}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-400">
                      x{item.quantity}
                    </div>
                    <div className="text-xs font-mono font-black text-emerald-400">
                      ${item.subtotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Modifiers Pill Details */}
                  {item.selectedModifiers.length > 0 && (
                    <div className="text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded-lg border border-slate-800 space-y-0.5">
                      {item.selectedModifiers.map((mod, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-300">
                          <span>• {mod.groupName}: <strong>{mod.optionName}</strong></span>
                          {mod.priceDelta > 0 && (
                            <span className="text-amber-400 font-mono">+${mod.priceDelta.toFixed(2)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Note */}
                  {item.notes && (
                    <div className="text-[10px] text-amber-300 italic bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                      Nota: "{item.notes}"
                    </div>
                  )}

                  {/* Controls Row: - / + / trash */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Unit: ${item.unitPrice.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateCartItemQty(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQty(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="w-6 h-6 rounded-md bg-rose-950/60 hover:bg-rose-900 text-rose-400 flex items-center justify-center ml-1 transition"
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
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Wireframe Subtotal & Total Box (Matching SUB TOTAL: $ 20.00) */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-3 space-y-1.5 mb-3">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="uppercase font-mono font-bold">SUB TOTAL:</span>
              <span className="font-mono text-white font-bold">${subtotal.toFixed(2)}</span>
            </div>

            {discountPercentage > 0 && (
              <div className="flex justify-between text-xs text-amber-400">
                <span>DESCUENTO ({discountPercentage}%):</span>
                <span className="font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-slate-400">
              <span>IVA (10%):</span>
              <span className="font-mono">${taxAmount.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
              <span className="text-sm font-black text-white uppercase tracking-wider">TOTAL A PAGAR:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="space-y-2">
            {/* Primary Action: Enviar a Cocina (KDS) */}
            <button
              onClick={sendOrderToKitchen}
              disabled={activeCartItems.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 disabled:opacity-50 text-white font-black py-3 px-3 rounded-xl shadow-lg shadow-emerald-950/40 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <ChefHat className="w-4 h-4" />
              <span>ENVIAR A COCINA (KDS)</span>
            </button>

            {/* Secondary Actions Row */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setShowPreBillModal(true)}
                disabled={activeCartItems.length === 0}
                className="py-2 px-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="text-[10px]">PRECUENTA</span>
              </button>

              <button
                onClick={() => setShowSplitModal(true)}
                disabled={activeCartItems.length === 0}
                className="py-2 px-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px]">DIVIDIR</span>
              </button>

              <button
                onClick={() => setShowDiscountAuthModal(true)}
                className="py-2 px-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1"
              >
                <Percent className="w-3.5 h-3.5" />
                <span className="text-[10px]">DESCUENTO</span>
              </button>
            </div>

            {/* Cobrar Button */}
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={activeCartItems.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-50 text-white font-black py-2.5 px-3 rounded-xl shadow-lg text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>COBRAR / PAGAR (${total.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Modifier Modal */}
      <ModifierModal />
    </div>
  );
};
