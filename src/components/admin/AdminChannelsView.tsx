/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { SalesChannelConfig, ChannelPriceMode } from '../../types/restaurant';
import {
  GitFork,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Radio,
  Tag,
  DollarSign,
  Layers,
} from 'lucide-react';

export const AdminChannelsView: React.FC = () => {
  const { salesChannels, saveSalesChannel, toggleChannelActive, showToast } = useRestaurant();

  const [editingChannel, setEditingChannel] = useState<SalesChannelConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriceMode, setFormPriceMode] = useState<ChannelPriceMode>('base');
  const [formDefaultDelta, setFormDefaultDelta] = useState<number>(0);
  const [formColor, setFormColor] = useState('emerald');

  const handleOpenCreate = () => {
    setEditingChannel(null);
    setFormId(`chan-${Date.now()}`);
    setFormName('');
    setFormCode('EXPRESS');
    setFormDescription('');
    setFormPriceMode('base');
    setFormDefaultDelta(0);
    setFormColor('emerald');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (channel: SalesChannelConfig) => {
    setEditingChannel(channel);
    setFormId(channel.id);
    setFormName(channel.name);
    setFormCode(channel.code);
    setFormDescription(channel.description);
    setFormPriceMode(channel.defaultPriceMode);
    setFormDefaultDelta(channel.defaultDelta);
    setFormColor(channel.color || 'emerald');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Por favor ingresa un nombre para el canal');
      return;
    }

    const item: SalesChannelConfig = {
      id: editingChannel ? editingChannel.id : formId.toLowerCase().replace(/\s+/g, '-'),
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      description: formDescription,
      isActive: editingChannel ? editingChannel.isActive : true,
      defaultPriceMode: formPriceMode,
      defaultDelta: Number(formDefaultDelta),
      color: formColor,
    };

    saveSalesChannel(item);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-emerald-600" />
            Canales de Venta & Reglas de Tarificación
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configura los canales omnicanal (Salón, Para Llevar, Delivery, Barra) y sus políticas de sobrecargo o descuento automático.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo Canal</span>
        </button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {salesChannels.map((ch) => (
          <div
            key={ch.id}
            className={`bg-white border-2 rounded-2xl p-4.5 shadow-2xs transition flex flex-col justify-between ${
              ch.isActive ? 'border-slate-200 hover:border-emerald-500' : 'border-slate-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs ${
                      ch.color === 'blue'
                        ? 'bg-blue-600'
                        : ch.color === 'amber'
                        ? 'bg-amber-600'
                        : ch.color === 'purple'
                        ? 'bg-purple-600'
                        : 'bg-emerald-600'
                    }`}
                  >
                    {ch.code.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {ch.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      ID: {ch.id} • CÓD: {ch.code}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleChannelActive(ch.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                    ch.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {ch.isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-500" /> Inactivo
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-3">{ch.description}</p>

              {/* Pricing rule chips */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Regla por defecto:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold">
                  {ch.defaultPriceMode === 'base'
                    ? 'Precio Base ($0 delta)'
                    : ch.defaultPriceMode === 'delta'
                    ? `Diferencia ${ch.defaultDelta >= 0 ? `+$${ch.defaultDelta}` : `-$${Math.abs(ch.defaultDelta)}`}`
                    : 'Precio Fijo Personalizado'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(ch)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Canal</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit / Create Channel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GitFork className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {editingChannel ? 'Editar Canal de Venta' : 'Nuevo Canal de Venta'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Canal</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  placeholder="Ej: Room Service o Terraza Express"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código / Slug</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color Distintivo</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="emerald">Verde Esmeralda</option>
                    <option value="blue">Azul Océano</option>
                    <option value="amber">Ámbar / Naranja</option>
                    <option value="purple">Púrpura</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Regla de Precio por Defecto</label>
                <select
                  value={formPriceMode}
                  onChange={(e) => setFormPriceMode(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="base">Precio Base (Sin alteración)</option>
                  <option value="delta">Diferencia Positiva o Negativa (+/-)</option>
                </select>
              </div>

              {formPriceMode === 'delta' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diferencia por Defecto ($)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={formDefaultDelta}
                    onChange={(e) => setFormDefaultDelta(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    placeholder="Ej: +3.00 para delivery o -1.00 para takeaway"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción del Canal</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  placeholder="Detalles sobre empaque, despacho o zona de servicio..."
                />
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
                  Guardar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
