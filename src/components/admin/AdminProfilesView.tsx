/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { RoleProfile, RolePermissions } from '../../types/restaurant';
import {
  ShieldCheck,
  Shield,
  KeyRound,
  Lock,
  Unlock,
  Check,
  X,
  Info,
} from 'lucide-react';

export const AdminProfilesView: React.FC = () => {
  const { profiles, toggleProfilePermission, showToast } = useRestaurant();

  const permissionLabels: { key: keyof RolePermissions; label: string; desc: string }[] = [
    {
      key: 'accessPos',
      label: 'Acceso Terminal POS',
      desc: 'Permite tomar pedidos y operar la pantalla de venta omnicanal.',
    },
    {
      key: 'accessKds',
      label: 'Acceso KDS Cocina',
      desc: 'Permite visualizar y cambiar estados de comandas de cocción.',
    },
    {
      key: 'accessCashier',
      label: 'Acceso Caja & Arqueos',
      desc: 'Permite procesar cobros, cortes parciales X y cierres de turno Z.',
    },
    {
      key: 'accessReports',
      label: 'Acceso Auditoría & Reportes',
      desc: 'Permite consultar logs de seguridad, ventas y márgenes.',
    },
    {
      key: 'accessConfig',
      label: 'Acceso Configuración Backoffice',
      desc: 'Permite modificar el maestro de productos, menús, canales y accesos.',
    },
    {
      key: 'canApplyDiscounts',
      label: 'Autorizar / Aplicar Descuentos',
      desc: 'Habilita la aplicación directa de porcentajes o cupones de rebaja.',
    },
    {
      key: 'canVoidItems',
      label: 'Anular Platillos / Comandas',
      desc: 'Habilita la eliminación de órdenes ya transmitidas a cocina.',
    },
    {
      key: 'canOpenCashDrawer',
      label: 'Apertura Manual de Gaveta',
      desc: 'Habilita el comando de expulsión de gaveta física de dinero.',
    },
    {
      key: 'canSplitBills',
      label: 'Dividir Cuentas por Comensal',
      desc: 'Habilita el desglose de subcuentas individuales y cobro separado.',
    },
    {
      key: 'canJoinTables',
      label: 'Unir / Fusionar Mesas',
      desc: 'Habilita la fusión de mesas físicas y combinación de comandas.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Perfiles de Rol & Matriz de Accesos (RBAC)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Control de privilegios granular: define qué operaciones puede ejecutar cada rol dentro del POS y el Backoffice.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong>Políticas de Seguridad en Tiempo Real:</strong> Cualquier cambio en los switches de esta matriz tiene efecto inmediato en los permisos de los usuarios autenticados en el POS.
        </div>
      </div>

      {/* RBAC Matrix Table */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <th className="p-4 font-black w-2/5">Operación / Permiso del Sistema</th>
              {profiles.map((p) => (
                <th key={p.id} className="p-4 font-black text-center border-l border-slate-800">
                  <div className="text-xs">{p.name}</div>
                  <div className="text-[10px] text-emerald-400 font-mono font-normal capitalize">
                    {p.roleKey}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
            {permissionLabels.map((perm, idx) => (
              <tr
                key={perm.key}
                className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'}
              >
                <td className="p-4">
                  <div className="font-bold text-slate-900">{perm.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{perm.desc}</div>
                </td>

                {profiles.map((p) => {
                  const isEnabled = !!p.permissions[perm.key];
                  const isAdmin = p.roleKey === 'admin';

                  return (
                    <td key={p.id} className="p-4 text-center border-l border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => {
                          if (isAdmin && perm.key === 'accessConfig') {
                            showToast('El rol Administrador debe conservar acceso a configuración.');
                            return;
                          }
                          toggleProfilePermission(p.id, perm.key);
                        }}
                        className={`inline-flex items-center justify-center p-2 rounded-xl transition cursor-pointer active:scale-90 ${
                          isEnabled
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 ring-1 ring-emerald-300'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={`${isEnabled ? 'Desactivar' : 'Activar'} para ${p.name}`}
                      >
                        {isEnabled ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4 stroke-[2]" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
