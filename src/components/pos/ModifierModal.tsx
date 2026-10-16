import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  MenuItem,
  ModifierGroup,
  ModifierOption,
  SelectedModifier,
  MenuInternalProduct,
  ProductModifierSubstitute,
} from '../../types/restaurant';
import {
  X,
  Check,
  ArrowLeftRight,
  MessageSquare,
  Flame,
  Zap,
  Package,
  Layers,
  ChefHat,
  Sparkles,
} from 'lucide-react';

interface ActiveComponentSelection {
  id: string; // group or internal product id
  name: string;
  type: 'internal_product' | 'modifier_group';
  order?: number;
  preparationType?: 'cocina_interna' | 'armado_menu';
  station?: string;
  selectedOption: {
    id: string;
    name: string;
    priceDelta: number;
    isDefault?: boolean;
    substituteProductId?: string;
  };
  options: {
    id: string;
    name: string;
    priceDelta: number;
    isDefault?: boolean;
    substituteProductId?: string;
  }[];
}

export const ModifierModal: React.FC = () => {
  const {
    modifierModalItem,
    setModifierModalItem,
    addItemToCart,
    selectedChannel,
    getEffectivePrice,
    products,
  } = useRestaurant();

  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  const [componentSelections, setComponentSelections] = useState<
    Record<string, ActiveComponentSelection['selectedOption']>
  >({});
  const [specialNotes, setSpecialNotes] = useState<string>('');

  useEffect(() => {
    if (!modifierModalItem) return;

    const initialSelections: Record<string, ActiveComponentSelection['selectedOption']> = {};
    let firstId: string | null = null;

    // 1. Initialize from ordered internal products if available
    if (modifierModalItem.internalProducts && modifierModalItem.internalProducts.length > 0) {
      const sorted = [...modifierModalItem.internalProducts].sort((a, b) => a.order - b.order);
      sorted.forEach((ip, idx) => {
        if (!firstId && idx === 0) firstId = ip.id;
        const defaultMod =
          ip.modifiers?.find((m) => m.isDefault) ||
          ip.modifiers?.[0] || {
            id: `base-${ip.id}`,
            name: `${ip.productName} (Base)`,
            priceDelta: 0.0,
            isDefault: true,
          };
        initialSelections[ip.id] = {
          id: defaultMod.id,
          name: defaultMod.name,
          priceDelta: defaultMod.priceDelta || 0,
          isDefault: defaultMod.isDefault,
          substituteProductId: defaultMod.substituteProductId,
        };
      });
    }

    // 2. Initialize from modifier groups if available
    if (modifierModalItem.modifierGroups && modifierModalItem.modifierGroups.length > 0) {
      modifierModalItem.modifierGroups.forEach((grp, idx) => {
        if (!firstId && idx === 0) firstId = grp.id;
        const defaultOpt = grp.options.find((o) => o.isDefault) || grp.options[0];
        if (defaultOpt) {
          initialSelections[grp.id] = {
            id: defaultOpt.id,
            name: defaultOpt.name,
            priceDelta: defaultOpt.priceDelta || 0,
            isDefault: defaultOpt.isDefault,
          };
        }
      });
    }

    setComponentSelections(initialSelections);
    setActiveComponentId(firstId);
    setSpecialNotes('');
  }, [modifierModalItem]);

  if (!modifierModalItem) return null;

  const basePrice = getEffectivePrice(modifierModalItem, selectedChannel);

  // Compute modifiers delta
  const modifiersDelta = Object.values(componentSelections).reduce(
    (acc, opt) => acc + (opt?.priceDelta || 0),
    0
  );
  const totalPrice = Math.max(0, +(basePrice + modifiersDelta).toFixed(2));

  // Build unified list of customizable components
  const componentsList: ActiveComponentSelection[] = [];

  // Add internal products in sorted order
  if (modifierModalItem.internalProducts && modifierModalItem.internalProducts.length > 0) {
    const sorted = [...modifierModalItem.internalProducts].sort((a, b) => a.order - b.order);
    sorted.forEach((ip) => {
      const catalogProduct = products.find((p) => p.id === ip.productId);
      const currentSelected =
        componentSelections[ip.id] ||
        ip.modifiers?.[0] || {
          id: `base-${ip.id}`,
          name: ip.productName,
          priceDelta: 0,
          isDefault: true,
        };

      const options =
        ip.modifiers && ip.modifiers.length > 0
          ? ip.modifiers.map((m) => ({
              id: m.id,
              name: m.name,
              priceDelta: m.priceDelta || 0,
              isDefault: m.isDefault,
              substituteProductId: m.substituteProductId,
            }))
          : [
              {
                id: `opt-base-${ip.id}`,
                name: `${ip.productName} (Porción Estándar)`,
                priceDelta: 0.0,
                isDefault: true,
              },
            ];

      componentsList.push({
        id: ip.id,
        name: ip.productName,
        type: 'internal_product',
        order: ip.order,
        preparationType: catalogProduct?.preparationType || 'cocina_interna',
        station: catalogProduct?.station || 'parrilla',
        selectedOption: currentSelected,
        options,
      });
    });
  }

  // Add legacy modifier groups if present
  if (modifierModalItem.modifierGroups && modifierModalItem.modifierGroups.length > 0) {
    modifierModalItem.modifierGroups.forEach((grp, idx) => {
      const currentSelected =
        componentSelections[grp.id] ||
        grp.options[0] || {
          id: `grp-opt-${grp.id}`,
          name: 'Opción Base',
          priceDelta: 0,
          isDefault: true,
        };

      componentsList.push({
        id: grp.id,
        name: grp.name,
        type: 'modifier_group',
        order: (modifierModalItem.internalProducts?.length || 0) + idx + 1,
        selectedOption: currentSelected,
        options: grp.options.map((o) => ({
          id: o.id,
          name: o.name,
          priceDelta: o.priceDelta || 0,
          isDefault: o.isDefault,
        })),
      });
    });
  }

  const activeComponent =
    componentsList.find((c) => c.id === activeComponentId) || componentsList[0];

  const handleSelectOption = (
    componentId: string,
    option: ActiveComponentSelection['selectedOption']
  ) => {
    setComponentSelections((prev) => ({
      ...prev,
      [componentId]: option,
    }));
  };

  const handleConfirm = () => {
    const selectedModsList: SelectedModifier[] = componentsList.map((comp) => {
      const selected = componentSelections[comp.id] || comp.selectedOption;
      const orderLabel = comp.order ? `Orden #${comp.order}: ` : '';
      return {
        groupId: comp.id,
        groupName: `${orderLabel}${comp.name}`,
        optionId: selected.id,
        optionName: selected.name,
        priceDelta: selected.priceDelta,
      };
    });

    addItemToCart(modifierModalItem, selectedModsList, specialNotes);
    setModifierModalItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn font-sans">
      <div className="w-full max-w-4xl bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                ESCALA: MENÚ → PRODUCTOS INTERNOS CON ORDEN & MODIFICADORES
              </span>
              {modifierModalItem.allowDiscounts === false && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
                  🛡️ Margen Protegido (Sin Descuentos)
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">
              {modifierModalItem.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>Categoría: <strong className="text-slate-800 uppercase">{modifierModalItem.category}</strong></span>
              <span>• Canal: <strong className="text-emerald-700 uppercase">{selectedChannel}</strong></span>
              <span>• Precio Base: <strong className="text-slate-800 font-mono">${basePrice.toFixed(2)}</strong></span>
            </div>
          </div>
          <button
            onClick={() => setModifierModalItem(null)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dual-Pane Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-0">
          {/* Left Pane: Ordered Internal Products & Groups */}
          <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-white overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  1. PRODUCTOS INTERNOS EN SECUENCIA DE ORDEN:
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {componentsList.length} Componentes
                </span>
              </div>

              <div className="space-y-3">
                {componentsList.map((comp) => {
                  const isSelected = activeComponent?.id === comp.id;
                  const currentOpt = componentSelections[comp.id] || comp.selectedOption;
                  const isCocinaInterna = comp.preparationType === 'cocina_interna';

                  return (
                    <div
                      key={comp.id}
                      onClick={() => setActiveComponentId(comp.id)}
                      className={`border-2 rounded-2xl p-3.5 flex items-start justify-between cursor-pointer transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/30'
                          : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {comp.order && (
                            <span className="text-[10px] font-mono font-black bg-slate-800 text-white px-2 py-0.5 rounded shadow-2xs">
                              ORDEN #{comp.order}
                            </span>
                          )}

                          {comp.type === 'internal_product' && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                                isCocinaInterna
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-sky-100 text-sky-900 border-sky-300'
                              }`}
                            >
                              {isCocinaInterna ? (
                                <>
                                  <Flame className="w-3 h-3 text-amber-600" />
                                  <span>Cocina Interna ({comp.station || 'parrilla'})</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3 h-3 text-sky-600" />
                                  <span>Solo Armado con Menú</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-black uppercase text-slate-900 block tracking-tight">
                          {comp.name}
                        </span>

                        <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-semibold text-slate-700">
                            {currentOpt?.name}
                          </span>
                          {currentOpt?.priceDelta > 0 && (
                            <span className="text-[11px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-mono">
                              +${currentOpt.priceDelta.toFixed(2)}
                            </span>
                          )}
                          {currentOpt?.priceDelta < 0 && (
                            <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded font-mono">
                              -${Math.abs(currentOpt.priceDelta).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`p-2 rounded-xl border flex items-center justify-center transition flex-shrink-0 mt-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-500 border-slate-300'
                        }`}
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Special Kitchen Notes */}
              <div className="mt-5 pt-4 border-t border-slate-200">
                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  INDICACIONES ESPECIALES PARA COCINA O ARMADO:
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Ej: 'Carne bien cocida en plancha', 'Sin sal agregada', 'Empaque térmico individual'..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Quick Pricing Breakdown */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between mt-3 text-xs shadow-2xs">
              <div>
                <span className="text-slate-500 font-medium block">
                  Precio Base (${basePrice.toFixed(2)}) + Ajustes Modificadores (${modifiersDelta >= 0 ? `+${modifiersDelta.toFixed(2)}` : modifiersDelta.toFixed(2)}):
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Tarifa configurada para canal {selectedChannel.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">TOTAL ITEM</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Pane: Modifiers / Substitutions for Active Component */}
          <div className="p-5 sm:p-6 bg-slate-50/70 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    2. MODIFICADORES & SUSTITUCIONES:
                  </span>
                  {activeComponent && (
                    <div className="flex items-center gap-2 mt-1">
                      {activeComponent.order && (
                        <span className="text-[10px] font-mono font-black bg-emerald-700 text-white px-2 py-0.2 rounded">
                          ORDEN #{activeComponent.order}
                        </span>
                      )}
                      <h4 className="text-sm font-black text-slate-900 uppercase">
                        {activeComponent.name}
                      </h4>
                    </div>
                  )}
                </div>

                {activeComponent && activeComponent.preparationType && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                      activeComponent.preparationType === 'cocina_interna'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-sky-100 text-sky-900 border-sky-300'
                    }`}
                  >
                    {activeComponent.preparationType === 'cocina_interna'
                      ? 'Cocina Interna'
                      : 'Solo Armado'}
                  </span>
                )}
              </div>

              {activeComponent ? (
                <div className="space-y-2.5">
                  {activeComponent.options.map((opt) => {
                    const isSelected =
                      (componentSelections[activeComponent.id]?.id ||
                        activeComponent.selectedOption?.id) === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(activeComponent.id, opt)}
                        className={`w-full border-2 rounded-2xl p-3.5 flex items-center justify-between text-left transition cursor-pointer active:scale-98 ${
                          isSelected
                            ? 'border-emerald-600 bg-white text-slate-900 shadow-sm ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold block leading-tight">
                              {opt.name}
                            </span>
                            {opt.isDefault && (
                              <span className="text-[10px] text-slate-500 uppercase font-mono">
                                (Receta Base / Predeterminada)
                              </span>
                            )}
                            {opt.substituteProductId && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Insumo catálogo: {opt.substituteProductId}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cost Status Badge */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {opt.priceDelta === 0 ? (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-xl">
                              Sin Costo ($0.00)
                            </span>
                          ) : opt.priceDelta > 0 ? (
                            <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-1 rounded-xl font-mono">
                              +${opt.priceDelta.toFixed(2)} (Con Costo)
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-xl font-mono">
                              -${Math.abs(opt.priceDelta).toFixed(2)} (Descuento)
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Seleccione un producto a la izquierda para ver y cambiar sus modificaciones.
                </div>
              )}
            </div>

            {/* Confirm Actions */}
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setModifierModalItem(null)}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-3 px-6 rounded-xl shadow-md transition text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>AGREGAR A LA COMANDA</span>
                <span className="font-mono bg-emerald-700 px-2.5 py-0.5 rounded text-xs text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

