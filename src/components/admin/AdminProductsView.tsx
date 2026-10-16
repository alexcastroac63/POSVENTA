/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ProductItem, ProductPreparationType } from '../../types/restaurant';
import {
  Package,
  Plus,
  Flame,
  Zap,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ChefHat,
  Tag,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export const AdminProductsView: React.FC = () => {
  const { products, saveProduct, deleteProduct, showToast } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [prepFilter, setPrepFilter] = useState<'all' | ProductPreparationType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Proteínas & Carnes');
  const [formCost, setFormCost] = useState(3.5);
  const [formPrepType, setFormPrepType] = useState<ProductPreparationType>('cocina_interna');
  const [formStation, setFormStation] = useState<ProductItem['station']>('parrilla');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrep = prepFilter === 'all' || p.preparationType === prepFilter;
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesPrep && matchesCat;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategory('Proteínas & Carnes');
    setFormCost(3.0);
    setFormPrepType('cocina_interna');
    setFormStation('parrilla');
    setFormDescription('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormCategory(p.category);
    setFormCost(p.cost);
    setFormPrepType(p.preparationType);
    setFormStation(p.station);
    setFormDescription(p.description);
    setFormIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Por favor ingresa un nombre para el producto');
      return;
    }

    const item: ProductItem = {
      id: editingProduct ? editingProduct.id : `prd-${Date.now()}`,
      sku: formSku.trim() || `PRD-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      category: formCategory,
      cost: +Number(formCost).toFixed(2),
      preparationType: formPrepType,
      station: formStation,
      description: formDescription,
      isActive: formIsActive,
    };

    saveProduct(item);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-600" />
            Catálogo Maestro de Productos e Insumos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Define la jerarquía de insumos, costos base y tipo de proceso (cocina interna KDS vs armado con el menú).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Productos</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{products.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">En base de datos</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" /> Cocina Interna (KDS)
            </div>
            <div className="text-2xl font-black text-amber-950 mt-1">
              {products.filter((p) => p.preparationType === 'cocina_interna').length}
            </div>
            <div className="text-[11px] text-amber-700 font-medium">Van a comanda de cocción</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-200/70 flex items-center justify-center text-amber-800">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-sky-600" /> Armado con Menú
            </div>
            <div className="text-2xl font-black text-sky-950 mt-1">
              {products.filter((p) => p.preparationType === 'armado_menu').length}
            </div>
            <div className="text-[11px] text-sky-700 font-medium">Ensamblado / barra / empaque</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-200/70 flex items-center justify-center text-sky-800">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Prep Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setPrepFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                prepFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setPrepFilter('cocina_interna')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                prepFilter === 'cocina_interna'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-amber-800 hover:bg-amber-100/60'
              }`}
            >
              <Flame className="w-3 h-3" /> Cocina Interna
            </button>
            <button
              onClick={() => setPrepFilter('armado_menu')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                prepFilter === 'armado_menu'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-sky-800 hover:bg-sky-100/60'
              }`}
            >
              <Zap className="w-3 h-3" /> Solo Armado
            </button>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="all">Todas las categorías ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredProducts.map((p) => {
          const isCocina = p.preparationType === 'cocina_interna';

          return (
            <div
              key={p.id}
              className="bg-white border-2 border-slate-200 hover:border-emerald-500/70 rounded-2xl p-4 shadow-2xs transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.sku}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {p.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1 leading-snug group-hover:text-emerald-700 transition">
                      {p.name}
                    </h3>
                  </div>

                  {/* Status Toggle Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {p.description || 'Sin descripción configurada.'}
                </p>

                {/* Configuration Badges */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  {/* Preparation Badge */}
                  {isCocina ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      Proceso Cocina Interna
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-100 text-sky-900 border border-sky-300 text-[11px] font-bold">
                      <Zap className="w-3.5 h-3.5 text-sky-600" />
                      Solo Armado con Menú
                    </span>
                  )}

                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-xl capitalize">
                    Estación: {p.station}
                  </span>
                </div>
              </div>

              {/* Bottom Actions and Cost */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Costo Insumo</span>
                  <span className="text-sm font-black text-slate-800 font-mono">
                    ${p.cost.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                    title="Editar producto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {editingProduct ? 'Editar Producto / Insumo' : 'Nuevo Producto / Insumo'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU / Código</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    placeholder="INS-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    placeholder="Proteínas, Guarniciones..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  placeholder="Ej: Medallón Angus Smash 180g"
                />
              </div>

              {/* Proceso de Preparación: CRITICAL REQUIREMENT */}
              <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-emerald-600" />
                  Configuración de Proceso de Preparación:
                </label>
                <p className="text-[11px] text-slate-500">
                  Determina si el producto ingresa al comandero de cocción o si solo se arma en la estación rápida con el menú.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormPrepType('cocina_interna')}
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex items-start gap-2.5 ${
                      formPrepType === 'cocina_interna'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Flame
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        formPrepType === 'cocina_interna' ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-black">Proceso de Cocina Interna</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Va al KDS (Parrilla/Fuego/Cocción) con tiempos y semáforo.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormPrepType('armado_menu')}
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex items-start gap-2.5 ${
                      formPrepType === 'armado_menu'
                        ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Zap
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        formPrepType === 'armado_menu' ? 'text-sky-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-black">Solo Preparación de Armado</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Ensamblado directo con el menú (empaque, barra, fría).
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Costo Base ($)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estación de Cocina</label>
                  <select
                    value={formStation}
                    onChange={(e) => setFormStation(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="parrilla">Parrilla / Plancha</option>
                    <option value="freidora">Freidora</option>
                    <option value="barra">Barra / Bebidas</option>
                    <option value="ensamblado">Ensamblado / Armado</option>
                    <option value="pase">Pase de Entrega</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción / Ficha Técnica</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  placeholder="Detalles sobre porcionado, origen y especificaciones del producto..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Producto Activo para Integración en Menús
                </label>
              </div>

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
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
