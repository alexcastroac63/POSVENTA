/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  MenuItem,
  MenuInternalProduct,
  ProductModifierSubstitute,
  ChannelPriceMode,
  ChannelPriceSetting,
} from '../../types/restaurant';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Layers,
  Flame,
  Zap,
  Percent,
  Search,
  Filter,
  X,
  Check,
  Sliders,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const AdminMenusView: React.FC = () => {
  const {
    menuItems,
    saveMenuItem,
    deleteMenuItem,
    products,
    salesChannels,
    showToast,
  } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [discountFilter, setDiscountFilter] = useState<'all' | 'yes' | 'no'>('all');

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('hamburguesas');
  const [formBasePrice, setFormBasePrice] = useState<number>(20.0);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formAllowDiscounts, setFormAllowDiscounts] = useState<boolean>(true);
  const [formStation, setFormStation] = useState<MenuItem['station']>('parrilla');

  // Channel Pricing config map
  const [formChannelPricing, setFormChannelPricing] = useState<Record<string, ChannelPriceSetting>>({});

  // Internal Products list with order
  const [formInternalProducts, setFormInternalProducts] = useState<MenuInternalProduct[]>([]);

  // Sub-modal for adding/editing internal product
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<string>(
    products[0]?.id || ''
  );

  const categories = Array.from(new Set(menuItems.map((m) => m.category)));

  const filteredMenus = menuItems.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCatFilter === 'all' || m.category === selectedCatFilter;
    const matchesDisc =
      discountFilter === 'all' ||
      (discountFilter === 'yes' && m.allowDiscounts !== false) ||
      (discountFilter === 'no' && m.allowDiscounts === false);
    return matchesSearch && matchesCat && matchesDisc;
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormName('');
    setFormSku(`MENU-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategory('hamburguesas');
    setFormBasePrice(18.0);
    setFormDescription('');
    setFormImage('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80');
    setFormAllowDiscounts(true);
    setFormStation('parrilla');

    // Default channel pricing
    const initialPricing: Record<string, ChannelPriceSetting> = {};
    salesChannels.forEach((ch) => {
      initialPricing[ch.id] = {
        channelId: ch.id,
        enabled: true,
        mode: ch.defaultPriceMode || 'base',
        delta: ch.defaultDelta || 0,
        customPrice: 18.0,
      };
    });
    setFormChannelPricing(initialPricing);

    // Initial internal products
    setFormInternalProducts([
      {
        id: `ip-${Date.now()}-1`,
        order: 1,
        productId: products[0]?.id || 'prd-vacuno',
        productName: products[0]?.name || 'Carne Principal',
        isRequired: true,
        defaultQuantity: 1,
        modifiers: [
          { id: `mod-1`, name: 'Opción Estándar (ORIGEN)', priceDelta: 0.0, isDefault: true },
          { id: `mod-2`, name: 'Opción Premium Especial (+€1.50)', priceDelta: 1.5 },
        ],
      },
    ]);

    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: MenuItem) => {
    setEditingItem(m);
    setFormName(m.name);
    setFormSku(m.sku);
    setFormCategory(m.category);
    setFormBasePrice(m.basePrice);
    setFormDescription(m.description);
    setFormImage(m.image);
    setFormAllowDiscounts(m.allowDiscounts !== false);
    setFormStation(m.station || 'parrilla');

    // Populate channel pricing
    const pricing: Record<string, ChannelPriceSetting> = {};
    salesChannels.forEach((ch) => {
      if (m.channelPricing && m.channelPricing[ch.id]) {
        pricing[ch.id] = { ...m.channelPricing[ch.id] };
      } else {
        const legacyPrice = m.channelPrices?.[ch.id];
        pricing[ch.id] = {
          channelId: ch.id,
          enabled: true,
          mode: legacyPrice !== undefined ? (legacyPrice === m.basePrice ? 'base' : 'custom') : 'base',
          delta: 0,
          customPrice: legacyPrice ?? m.basePrice,
        };
      }
    });
    setFormChannelPricing(pricing);

    // Populate internal products
    if (m.internalProducts && m.internalProducts.length > 0) {
      setFormInternalProducts([...m.internalProducts]);
    } else if (m.modifierGroups && m.modifierGroups.length > 0) {
      // Map legacy modifier groups to ordered internal products
      const mapped: MenuInternalProduct[] = m.modifierGroups.map((grp, index) => ({
        id: `ip-mapped-${grp.id}`,
        order: index + 1,
        productId: products[0]?.id || 'prd-vacuno',
        productName: grp.name,
        isRequired: grp.required,
        defaultQuantity: 1,
        modifiers: grp.options.map((opt) => ({
          id: opt.id,
          name: opt.name,
          priceDelta: opt.priceDelta,
          isDefault: opt.isDefault,
        })),
      }));
      setFormInternalProducts(mapped);
    } else {
      setFormInternalProducts([]);
    }

    setIsModalOpen(true);
  };

  const handleChannelPriceModeChange = (channelId: string, mode: ChannelPriceMode) => {
    setFormChannelPricing((prev) => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        mode,
      },
    }));
  };

  const handleChannelDeltaChange = (channelId: string, delta: number) => {
    setFormChannelPricing((prev) => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        delta,
      },
    }));
  };

  const handleChannelCustomPriceChange = (channelId: string, customPrice: number) => {
    setFormChannelPricing((prev) => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        customPrice,
      },
    }));
  };

  const handleChannelEnabledToggle = (channelId: string) => {
    setFormChannelPricing((prev) => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        enabled: !prev[channelId]?.enabled,
      },
    }));
  };

  // Internal products order management
  const handleAddInternalProduct = () => {
    const catalogItem = products.find((p) => p.id === selectedCatalogProduct) || products[0];
    if (!catalogItem) return;

    const newOrderNumber = formInternalProducts.length + 1;
    const newIp: MenuInternalProduct = {
      id: `ip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order: newOrderNumber,
      productId: catalogItem.id,
      productName: catalogItem.name,
      isRequired: true,
      defaultQuantity: 1,
      modifiers: [
        {
          id: `mod-${Date.now()}-1`,
          name: `${catalogItem.name} (Porción Base)`,
          priceDelta: 0.0,
          isDefault: true,
        },
      ],
    };

    setFormInternalProducts((prev) => [...prev, newIp]);
    showToast(`Producto interno #${newOrderNumber} agregado al menú`);
  };

  const handleMoveInternalProduct = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formInternalProducts.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...formInternalProducts];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-index order numbers
    updated.forEach((ip, idx) => {
      ip.order = idx + 1;
    });

    setFormInternalProducts(updated);
  };

  const handleDeleteInternalProduct = (id: string) => {
    const filtered = formInternalProducts.filter((ip) => ip.id !== id);
    filtered.forEach((ip, idx) => {
      ip.order = idx + 1;
    });
    setFormInternalProducts(filtered);
  };

  const handleAddModifierToIp = (ipId: string) => {
    setFormInternalProducts((prev) =>
      prev.map((ip) => {
        if (ip.id === ipId) {
          const newMod: ProductModifierSubstitute = {
            id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: `Sustitución por otro producto (+€0.50)`,
            priceDelta: 0.5,
            isDefault: false,
          };
          return {
            ...ip,
            modifiers: [...ip.modifiers, newMod],
          };
        }
        return ip;
      })
    );
  };

  const handleUpdateModifier = (
    ipId: string,
    modId: string,
    field: keyof ProductModifierSubstitute,
    val: any
  ) => {
    setFormInternalProducts((prev) =>
      prev.map((ip) => {
        if (ip.id === ipId) {
          return {
            ...ip,
            modifiers: ip.modifiers.map((m) => (m.id === modId ? { ...m, [field]: val } : m)),
          };
        }
        return ip;
      })
    );
  };

  const handleDeleteModifier = (ipId: string, modId: string) => {
    setFormInternalProducts((prev) =>
      prev.map((ip) => {
        if (ip.id === ipId) {
          return {
            ...ip,
            modifiers: ip.modifiers.filter((m) => m.id !== modId),
          };
        }
        return ip;
      })
    );
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Por favor ingresa un nombre para el menú');
      return;
    }

    // Build channel prices object for backwards compatibility
    const channelPricesMap: Record<string, number> = {};
    salesChannels.forEach((ch) => {
      const cfg = formChannelPricing[ch.id];
      if (cfg) {
        if (cfg.mode === 'custom') {
          channelPricesMap[ch.id] = cfg.customPrice;
        } else if (cfg.mode === 'delta') {
          channelPricesMap[ch.id] = Math.max(0, +(formBasePrice + cfg.delta).toFixed(2));
        } else {
          channelPricesMap[ch.id] = formBasePrice;
        }
      } else {
        channelPricesMap[ch.id] = formBasePrice;
      }
    });

    // Rebuild legacy modifierGroups for backwards compatibility
    const legacyModifierGroups = formInternalProducts.map((ip) => ({
      id: `grp-${ip.id}`,
      name: `${ip.order}. ${ip.productName.toUpperCase()}`,
      required: ip.isRequired,
      minSelections: 1,
      maxSelections: 1,
      options: ip.modifiers.map((m) => ({
        id: m.id,
        name: m.name,
        priceDelta: m.priceDelta,
        isDefault: m.isDefault,
      })),
    }));

    const menuItem: MenuItem = {
      id: editingItem ? editingItem.id : `prod-${Date.now()}`,
      sku: formSku.trim() || `MENU-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      category: formCategory,
      basePrice: +Number(formBasePrice).toFixed(2),
      allowDiscounts: formAllowDiscounts,
      channelPrices: channelPricesMap as any,
      channelPricing: formChannelPricing,
      image: formImage.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
      description: formDescription,
      isAvailableOnMesa: formChannelPricing['mesa']?.enabled !== false,
      isAvailableOnLlevar: formChannelPricing['llevar']?.enabled !== false,
      isAvailableOnDelivery: formChannelPricing['delivery']?.enabled !== false,
      station: formStation,
      internalProducts: formInternalProducts,
      modifierGroups: legacyModifierGroups,
      isActive: true,
    };

    saveMenuItem(menuItem);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
            Configuración de Menús & Combos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Estructura de datos: el <strong>menú lleva productos internos ordenados</strong>, precios y diferencias por canal, y reglas de descuento.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Crear Menú</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar menú por nombre, categoría o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Discount Policy Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setDiscountFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                discountFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setDiscountFilter('yes')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                discountFilter === 'yes'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-800 hover:bg-emerald-100/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Con Descuentos
            </button>
            <button
              onClick={() => setDiscountFilter('no')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                discountFilter === 'no'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-800 hover:bg-rose-100/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Sin Descuentos (Protegido)
            </button>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="all">Todas las Categorías ({menuItems.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMenus.map((menu) => {
          const allowsDisc = menu.allowDiscounts !== false;
          const internalCount = menu.internalProducts?.length || menu.modifierGroups?.length || 0;

          return (
            <div
              key={menu.id}
              className="bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-2xl p-4 shadow-2xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {menu.sku}
                      </span>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                        {menu.category}
                      </span>
                      {allowsDisc ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-1.5 py-0.5 rounded-full ml-auto">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" /> Aplica Descuentos
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded-full ml-auto">
                          <ShieldAlert className="w-3 h-3 text-rose-700" /> Sin Descuento (Protegido)
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm text-slate-900 mt-1 leading-snug truncate">
                      {menu.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {menu.description}
                    </p>
                  </div>
                </div>

                {/* Channel Prices Matrix */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Precios por Canal de Venta:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    {salesChannels.map((ch) => {
                      const cfg = menu.channelPricing?.[ch.id];
                      let displayPrice = menu.basePrice;
                      let modeTag = 'Base';

                      if (cfg) {
                        if (cfg.enabled === false) {
                          return (
                            <div
                              key={ch.id}
                              className="p-1.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400 text-center text-[10px]"
                            >
                              <span className="font-bold block truncate">{ch.name}</span>
                              <span className="font-semibold text-rose-600">No disp.</span>
                            </div>
                          );
                        }
                        if (cfg.mode === 'custom') {
                          displayPrice = cfg.customPrice;
                          modeTag = 'Fijo';
                        } else if (cfg.mode === 'delta') {
                          displayPrice = Math.max(0, +(menu.basePrice + cfg.delta).toFixed(2));
                          modeTag = cfg.delta >= 0 ? `+${cfg.delta}` : `${cfg.delta}`;
                        }
                      } else if (menu.channelPrices?.[ch.id] !== undefined) {
                        displayPrice = menu.channelPrices[ch.id];
                        modeTag = displayPrice === menu.basePrice ? 'Base' : 'Dif';
                      }

                      return (
                        <div
                          key={ch.id}
                          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center"
                        >
                          <span className="text-[10px] font-bold text-slate-600 block truncate">
                            {ch.name.split(' ')[0]}
                          </span>
                          <span className="font-mono font-black text-xs text-slate-900">
                            ${displayPrice.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-emerald-700 font-bold block">
                            ({modeTag})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ordered Internal Products Preview */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      Productos Internos ({internalCount}):
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Con orden & sustituciones</span>
                  </div>

                  <div className="space-y-1">
                    {menu.internalProducts && menu.internalProducts.length > 0 ? (
                      menu.internalProducts.slice(0, 3).map((ip) => (
                        <div
                          key={ip.id}
                          className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                              {ip.order}
                            </span>
                            <span className="font-bold text-slate-800 truncate">
                              {ip.productName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {ip.modifiers.length} sustituciones
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Sin productos internos vinculados.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Precio Base</span>
                  <div className="text-base font-black text-slate-900 font-mono">
                    ${menu.basePrice.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(menu)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Configurar</span>
                  </button>
                  <button
                    onClick={() => deleteMenuItem(menu.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Eliminar menú"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base">
                    {editingItem ? 'Configuración de Menú' : 'Creación de Menú Nuevo'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Define categoría, precios omnicanal, reglas de descuento y productos internos ordenados.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveMenu} className="p-6 space-y-5 overflow-y-auto">
              {/* 1. General Info */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider block">
                  1. Ficha del Menú & Categoría
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Menú</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                      placeholder="Ej: Menú Burger Master XYZ"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SKU / Código</label>
                    <input
                      type="text"
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Categoría (Obligatoria)
                    </label>
                    <input
                      type="text"
                      required
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                      placeholder="hamburguesas, carnes..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Precio Base ($)</label>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      required
                      value={formBasePrice}
                      onChange={(e) => setFormBasePrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estación Principal</label>
                    <select
                      value={formStation}
                      onChange={(e) => setFormStation(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="parrilla">Parrilla</option>
                      <option value="freidora">Freidora</option>
                      <option value="barra">Barra</option>
                      <option value="pase">Pase</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    placeholder="Descripción comercial de los componentes del menú..."
                  />
                </div>
              </div>

              {/* 2. Channel Pricing: CRITICAL REQUIREMENT */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-800 tracking-wider block">
                    2. Configuración de Precios por Canales de Venta
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Precio base: <strong>${formBasePrice.toFixed(2)}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Puede configurarse una <strong>diferencia negativa o positiva</strong> por canal con base en el precio base, o un <strong>precio fijo distinto</strong> por canal.
                </p>

                <div className="space-y-2">
                  {salesChannels.map((ch) => {
                    const cfg = formChannelPricing[ch.id] || {
                      channelId: ch.id,
                      enabled: true,
                      mode: 'base',
                      delta: 0,
                      customPrice: formBasePrice,
                    };

                    let computedPrice = formBasePrice;
                    if (cfg.mode === 'custom') computedPrice = cfg.customPrice || 0;
                    else if (cfg.mode === 'delta') computedPrice = Math.max(0, +(formBasePrice + (cfg.delta || 0)).toFixed(2));

                    return (
                      <div
                        key={ch.id}
                        className={`p-3 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          cfg.enabled
                            ? 'bg-white border-slate-300 shadow-2xs'
                            : 'bg-slate-100/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={cfg.enabled}
                            onChange={() => handleChannelEnabledToggle(ch.id)}
                            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              Canal: {ch.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {cfg.enabled ? 'Habilitado en este canal' : 'No disponible para la venta'}
                            </span>
                          </div>
                        </div>

                        {cfg.enabled && (
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Mode select */}
                            <select
                              value={cfg.mode}
                              onChange={(e) =>
                                handleChannelPriceModeChange(ch.id, e.target.value as ChannelPriceMode)
                              }
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700"
                            >
                              <option value="base">Precio Base ($0)</option>
                              <option value="delta">Diferencia (+/-)</option>
                              <option value="custom">Precio Fijo Canal</option>
                            </select>

                            {/* Delta input */}
                            {cfg.mode === 'delta' && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-500">Dif:</span>
                                <input
                                  type="number"
                                  step="0.10"
                                  value={cfg.delta}
                                  onChange={(e) =>
                                    handleChannelDeltaChange(ch.id, Number(e.target.value))
                                  }
                                  className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                                  placeholder="+2.00 o -1.00"
                                />
                              </div>
                            )}

                            {/* Custom Price input */}
                            {cfg.mode === 'custom' && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-500">Fijo:</span>
                                <input
                                  type="number"
                                  step="0.10"
                                  min="0"
                                  value={cfg.customPrice}
                                  onChange={(e) =>
                                    handleChannelCustomPriceChange(ch.id, Number(e.target.value))
                                  }
                                  className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                                />
                              </div>
                            )}

                            {/* Resulting price tag */}
                            <div className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-black font-mono">
                              ${computedPrice.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Discount Eligibility: CRITICAL REQUIREMENT */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2">
                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider block">
                  3. Política de Descuentos en el POS
                </span>
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    {formAllowDiscounts ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    )}
                    <div>
                      <div className="text-xs font-black text-slate-800">
                        {formAllowDiscounts
                          ? 'Menú Habilitado para Descuentos'
                          : 'Menú Protegido (NO Permite Descuentos en POS)'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formAllowDiscounts
                          ? 'Aplica cupones del personal, descuentos de gerencia o cortesías.'
                          : 'El POS excluirá este menú de cualquier descuento para proteger márgenes comerciales.'}
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={formAllowDiscounts}
                    onChange={(e) => setFormAllowDiscounts(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* 4. Ordered Internal Products & Substitutions: CRITICAL REQUIREMENT */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-800 tracking-wider block">
                    4. Productos Internos con Orden & Modificadores de Sustitución
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Escala: Menú lleva productos
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Los productos internos tienen un <strong>orden de montaje</strong> y <strong>modificadores de sustitución por otros productos con costo o sin costo</strong>.
                </p>

                {/* Add Product from Catalog Bar */}
                <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl">
                  <select
                    value={selectedCatalogProduct}
                    onChange={(e) => setSelectedCatalogProduct(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.preparationType === 'cocina_interna' ? '🔥 Cocina' : '⚡ Armado'}) - Costo: ${p.cost}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddInternalProduct}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar al Menú
                  </button>
                </div>

                {/* Internal Products List */}
                <div className="space-y-3">
                  {formInternalProducts.map((ip, index) => {
                    return (
                      <div
                        key={ip.id}
                        className="p-3.5 bg-white border-2 border-slate-200 rounded-xl space-y-2.5 shadow-2xs"
                      >
                        {/* Title and Order buttons */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                              {ip.order}
                            </span>
                            <span className="font-black text-xs text-slate-900">
                              Orden #{ip.order}: {ip.productName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveInternalProduct(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                              title="Subir orden"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveInternalProduct(index, 'down')}
                              disabled={index === formInternalProducts.length - 1}
                              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                              title="Bajar orden"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInternalProduct(ip.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 cursor-pointer ml-1"
                              title="Quitar producto interno"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Substitution Modifiers (con costo o sin costo) */}
                        <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                            <span>Modificadores de sustitución (con o sin costo):</span>
                            <button
                              type="button"
                              onClick={() => handleAddModifierToIp(ip.id)}
                              className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Añadir Modificador
                            </button>
                          </div>

                          {ip.modifiers.map((mod) => (
                            <div
                              key={mod.id}
                              className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200"
                            >
                              <input
                                type="text"
                                value={mod.name}
                                onChange={(e) =>
                                  handleUpdateModifier(ip.id, mod.id, 'name', e.target.value)
                                }
                                className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                                placeholder="Nombre de sustitución"
                              />

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] font-bold text-slate-500">+$:</span>
                                <input
                                  type="number"
                                  step="0.10"
                                  value={mod.priceDelta}
                                  onChange={(e) =>
                                    handleUpdateModifier(
                                      ip.id,
                                      mod.id,
                                      'priceDelta',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-16 bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-mono font-bold"
                                  placeholder="0.00"
                                />
                                <span className="text-[10px] font-bold text-slate-400">
                                  {mod.priceDelta === 0 ? '(Sin costo)' : '(Con costo)'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteModifier(ip.id, mod.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Eliminar modificador"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition"
                >
                  Guardar Configuración de Menú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
