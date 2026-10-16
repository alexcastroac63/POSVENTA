/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { AdminMenusView } from './AdminMenusView';
import { AdminProductsView } from './AdminProductsView';
import { AdminChannelsView } from './AdminChannelsView';
import { AdminUsersView } from './AdminUsersView';
import { AdminProfilesView } from './AdminProfilesView';
import { AdminDiscountsView } from './AdminDiscountsView';
import {
  UtensilsCrossed,
  Package,
  GitFork,
  Users,
  ShieldCheck,
  Percent,
  LogOut,
  ArrowRight,
  Store,
  Layers,
  ChevronRight,
  MonitorCheck,
  Database,
  ExternalLink,
} from 'lucide-react';

type AdminTab = 'menus' | 'products' | 'channels' | 'users' | 'profiles' | 'discounts';

export const AdminConfigLayout: React.FC = () => {
  const {
    setCurrentScreen,
    currentUser,
    branch,
    menuItems,
    products,
    salesChannels,
    users,
    showToast,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<AdminTab>('menus');

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'menus',
      label: 'Menús & Combos',
      icon: <UtensilsCrossed className="w-4 h-4" />,
      badge: menuItems.length,
    },
    {
      id: 'products',
      label: 'Productos & Cocina',
      icon: <Package className="w-4 h-4" />,
      badge: products.length,
    },
    {
      id: 'channels',
      label: 'Canales de Venta',
      icon: <GitFork className="w-4 h-4" />,
      badge: salesChannels.length,
    },
    {
      id: 'users',
      label: 'Usuarios & Personal',
      icon: <Users className="w-4 h-4" />,
      badge: users.length,
    },
    {
      id: 'profiles',
      label: 'Perfiles & Accesos (RBAC)',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'discounts',
      label: 'Descuentos & Cupones',
      icon: <Percent className="w-4 h-4" />,
    },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'menus':
        return <AdminMenusView />;
      case 'products':
        return <AdminProductsView />;
      case 'channels':
        return <AdminChannelsView />;
      case 'users':
        return <AdminUsersView />;
      case 'profiles':
        return <AdminProfilesView />;
      case 'discounts':
        return <AdminDiscountsView />;
      default:
        return <AdminMenusView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Top Standalone Backoffice Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800 shadow-md sticky top-0 z-40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Brand & Portal Identification */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  SITIO INDEPENDIENTE DE CONFIGURACIÓN
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
                  • Fuera del POS
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                RESTO-XYZ • PORTAL DE ADMINISTRACIÓN MAESTRO
              </h1>
            </div>
          </div>

          {/* User profile & Navigation Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-emerald-500"
              />
              <span className="text-slate-200 hidden sm:inline">{currentUser.name}</span>
              <span className="text-emerald-400 font-mono text-[10px] uppercase">
                ({currentUser.role})
              </span>
            </div>

            <button
              onClick={() => {
                setCurrentScreen('channel_select');
                showToast('Ingresando al Terminal POS');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              title="Abrir terminal de punto de venta"
            >
              <span>Abrir Terminal POS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setCurrentScreen('login');
                showToast('Sesión de administración finalizada');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Regresar al Login</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && (
                  <span
                    className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white text-emerald-900' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Backoffice Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>{branch} • Módulo de Configuración Central</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Escala de Datos: Menú → Productos Internos con Orden → Modificadores</span>
          <span className="font-semibold text-emerald-700">• Sincronizado en Vivo con POS</span>
        </div>
      </footer>
    </div>
  );
};
