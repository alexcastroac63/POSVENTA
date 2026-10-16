/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { DiscountPolicy } from '../../types/restaurant';
import {
  Percent,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  Tag,
  DollarSign,
} from 'lucide-react';

export const AdminDiscountsView: React.FC = () => {
  const { discountPolicies, saveDiscountPolicy, deleteDiscountPolicy, showToast } = useRestaurant();

  const [editingPolicy, setEditingPolicy] = useState<DiscountPolicy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage');
  const [formValue, setFormValue] = useState<number>(10);
  const [formRequiresAuth, setFormRequiresAuth] = useState(false);
  const [formRespectNonDisc, setFormRespectNonDisc] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);

  const handleOpenCreate = () => {
    setEditingPolicy(null);
    setFormName('');
    setFormType('percentage');
    setFormValue(15);
    setFormRequiresAuth(false);
    setFormRespectNonDisc(true);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (policy: DiscountPolicy) => {
    setEditingPolicy(policy);
    setFormName(policy.name);
    setFormType(policy.type);
    setFormValue(policy.value);
    setFormRequiresAuth(policy.requiresAuthorization);
    setFormRespectNonDisc(policy.respectNonDiscountableMenus);
    setFormIsActive(policy.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Por favor ingresa un nombre para la regla de descuento');
      return;
    }

    const item: DiscountPolicy = {
      id: editingPolicy ? editingPolicy.id : `disc-${Date.now()}`,
      name: formName.trim(),
      type: formType,
      value: Number(formValue),
      requiresAuthorization: formRequiresAuth,
      allowedRoles: formRequiresAuth ? ['gerente', 'admin'] : ['gerente', 'cajero', 'mesero'],
      isActive: formIsActive,
      respectNonDiscountableMenus: formRespectNonDisc,
    };

    saveDiscountPolicy(item);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Percent className="w-6 h-6 text-emerald-600" />
            Políticas de Descuentos & Cupones de Fidelidad
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configura reglas de bonificación, requisitos de autorización de PIN gerencial y protección de platillos no descontables.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nueva Regla de Descuento</span>
        </button>
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {discountPolicies.map((disc) => (
          <div
            key={disc.id}
            className={`bg-white border-2 rounded-2xl p-4.5 shadow-2xs transition flex flex-col justify-between ${
              disc.isActive ? 'border-slate-200 hover:border-emerald-500' : 'border-slate-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-black text-base shadow-2xs">
                    {disc.type === 'percentage' ? `${disc.value}%` : `$${disc.value}`}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {disc.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      Tipo: {disc.type === 'percentage' ? 'Porcentual' : 'Monto Fijo'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    disc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {disc.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Badges */}
              <div className="mt-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  {disc.requiresAuthorization ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-xl">
                      <Lock className="w-3.5 h-3.5 text-amber-700" /> Requiere PIN de Supervisor
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Aplicación Libre por Mozo/Caja
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {disc.respectNonDiscountableMenus ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Respeta Protección de Menús Sin Descuento
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-xl">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Sobrescribe Protección de Margen
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(disc)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => deleteDiscountPolicy(disc.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="Eliminar regla"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Percent className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {editingPolicy ? 'Editar Regla de Descuento' : 'Nueva Regla de Descuento'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Promoción</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  placeholder="Ej: Descuento Personal 25%"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Descuento</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="percentage">Porcentual (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor ({formType === 'percentage' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    step={formType === 'percentage' ? 1 : 0.5}
                    min={1}
                    max={formType === 'percentage' ? 100 : 500}
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="authCheck"
                    checked={formRequiresAuth}
                    onChange={(e) => setFormRequiresAuth(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="authCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Requiere PIN de Supervisor / Gerente
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="respectCheck"
                    checked={formRespectNonDisc}
                    onChange={(e) => setFormRespectNonDisc(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="respectCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Respetar Platillos/Menús sin Descuento Permitido
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Regla de Descuento Habilitada en POS
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
                  Guardar Regla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
