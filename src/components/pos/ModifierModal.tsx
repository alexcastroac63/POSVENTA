/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ModifierGroup, ModifierOption, SelectedModifier } from '../../types/restaurant';
import {
  X,
  Check,
  ChevronRight,
  ArrowLeftRight,
  Plus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const ModifierModal: React.FC = () => {
  const {
    modifierModalItem,
    setModifierModalItem,
    addItemToCart,
    selectedChannel,
    getEffectivePrice,
  } = useRestaurant();

  if (!modifierModalItem) return null;

  const basePrice = getEffectivePrice(modifierModalItem, selectedChannel);

  // Track active selections per group
  const [selections, setSelections] = useState<Record<string, ModifierOption>>({});
  // Drawer state: which group is currently being expanded for replacement (Screen 5)
  const [activeExpandedGroupId, setActiveExpandedGroupId] = useState<string | null>(null);
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Initialize with default options
  useEffect(() => {
    if (modifierModalItem.modifierGroups) {
      const initial: Record<string, ModifierOption> = {};
      modifierModalItem.modifierGroups.forEach((grp) => {
        const defaultOpt = grp.options.find((o) => o.isDefault) || grp.options[0];
        if (defaultOpt) {
          initial[grp.id] = defaultOpt;
        }
      });
      setSelections(initial);
      // Auto open first group to match wireframe Screen 4 -> Screen 5 transition
      if (modifierModalItem.modifierGroups.length > 0) {
        setActiveExpandedGroupId(modifierModalItem.modifierGroups[0].id);
      }
    }
  }, [modifierModalItem]);

  // Calculate total price with modifier differentials
  const modifiersDelta = Object.values(selections).reduce(
    (acc, opt) => acc + (opt.priceDelta || 0),
    0
  );
  const totalPrice = +(basePrice + modifiersDelta).toFixed(2);

  const handleSelectOption = (group: ModifierGroup, option: ModifierOption) => {
    setSelections((prev) => ({
      ...prev,
      [group.id]: option,
    }));
  };

  const handleConfirm = () => {
    const selectedModsList: SelectedModifier[] = Object.entries(selections).map(
      ([groupId, option]) => {
        const group = modifierModalItem.modifierGroups?.find((g) => g.id === groupId);
        return {
          groupId,
          groupName: group?.name || 'OPCIÓN',
          optionId: option.id,
          optionName: option.name,
          priceDelta: option.priceDelta,
        };
      }
    );

    addItemToCart(modifierModalItem, selectedModsList, specialNotes);
    setModifierModalItem(null);
  };

  const activeGroup = modifierModalItem.modifierGroups?.find(
    (g) => g.id === activeExpandedGroupId
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn font-sans">
      {/* Wireframe Modal Box (Faithful to Screen 4 & 5 in Blank diagram (7).svg) */}
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Wireframe Modal Header */}
        <div className="bg-slate-800 px-6 py-4 border-b-2 border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              PERSONALIZACIÓN & MODIFICADORES
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {modifierModalItem.name}
            </h2>
          </div>
          <button
            onClick={() => setModifierModalItem(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Dual-Pane Body matching Screen 4 and Screen 5 side-by-side */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-slate-800">
          {/* Left Pane (Screen 4 in wireframe): Groups list (CARNE, PAPAS, BEBIDA, NOTAS) */}
          <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
                1. GRUPOS DE COMPONENTES INTEGRADOS:
              </span>

              <div className="space-y-3">
                {modifierModalItem.modifierGroups?.map((group) => {
                  const currentOpt = selections[group.id];
                  const isExpanded = activeExpandedGroupId === group.id;

                  return (
                    <div
                      key={group.id}
                      onClick={() => setActiveExpandedGroupId(group.id)}
                      className={`border-2 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition ${
                        isExpanded
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-slate-700 bg-slate-800/80 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black uppercase text-emerald-400 block tracking-wider">
                          {group.name}
                        </span>
                        <span className="text-sm font-semibold text-white mt-0.5 block truncate max-w-[220px]">
                          {currentOpt ? currentOpt.name : 'Seleccionar...'}
                        </span>
                        {currentOpt && currentOpt.priceDelta > 0 && (
                          <span className="text-[11px] text-amber-400 font-bold">
                            +€{currentOpt.priceDelta.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Double arrow icon matching wireframe `<=>` */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg border flex items-center justify-center transition ${
                            isExpanded
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-slate-700 text-slate-300 border-slate-600'
                          }`}
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Freeform Notes Box (Screen 4 wireframe) */}
              <div className="mt-5">
                <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  NOTAS / OBSERVACIONES DE COCINA:
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Ej: 'Sin cebolla', 'Salsa tártara aparte', 'Carne bien tostada'..."
                  rows={2}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between mt-3 text-xs">
              <span className="text-slate-400">Precio Base + Modificadores:</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                € {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Right Pane (Screen 5 in wireframe): Substitution Drawer for Selected Group */}
          <div className="p-5 sm:p-6 bg-slate-950/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  2. OPCIONES DE CAMBIO / SUSTITUCIÓN:
                </span>
                {activeGroup && (
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                    {activeGroup.name}
                  </span>
                )}
              </div>

              {activeGroup ? (
                <div className="space-y-2.5">
                  {activeGroup.options.map((opt) => {
                    const isSelected = selections[activeGroup.id]?.id === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(activeGroup, opt)}
                        className={`w-full border-2 rounded-xl p-3 flex items-center justify-between text-left transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-md'
                            : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                                : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-semibold block leading-tight">
                              {opt.name}
                            </span>
                            {opt.isDefault && (
                              <span className="text-[10px] text-slate-400 uppercase font-mono">
                                (Predeterminado)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price Delta Badge (Exact match to wireframe: € 0.00, € 0.10, etc.) */}
                        <div
                          className={`font-mono text-xs font-bold px-2 py-1 rounded-lg border ${
                            opt.priceDelta === 0
                              ? 'text-slate-400 border-slate-700 bg-slate-800/80'
                              : 'text-amber-400 border-amber-500/40 bg-amber-950/60'
                          }`}
                        >
                          {opt.priceDelta > 0 ? `+€ ${opt.priceDelta.toFixed(2)}` : '€ 0.00'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  Seleccione un grupo a la izquierda para ver las opciones de sustitución disponibles.
                </div>
              )}
            </div>

            {/* Wireframe Button: AGREGAR */}
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setModifierModalItem(null)}
                className="px-4 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black py-3 px-6 rounded-xl shadow-lg shadow-emerald-950/50 transition text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>AGREGAR A LA COMANDA</span>
                <span className="font-mono bg-emerald-800 px-2 py-0.5 rounded text-xs">
                  € {totalPrice.toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
