/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRestaurant, ActiveScreen } from '../../context/RestaurantContext';
import {
  UtensilsCrossed,
  Receipt,
  BarChart3,
  LogOut,
} from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const {
    currentUser,
    currentScreen,
    setCurrentScreen,
    logout,
    orders,
  } = useRestaurant();

  const activeKitchenOrdersCount = orders.filter(
    (o) => o.status === 'en_cocina' || o.status === 'abierta'
  ).length;

  const navItems: { screen: ActiveScreen; label: string; icon: React.ReactNode; badge?: number }[] = [
    { screen: 'channel_select', label: 'Canales', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { screen: 'cashier', label: 'Caja & Turnos', icon: <Receipt className="w-4 h-4" /> },
    { screen: 'reports', label: 'Reportes & Auditoría', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  if (currentScreen === 'login') {
    return null;
  }

  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 shadow-xs sticky top-0 z-40 select-none">
      {/* Main Nav Bar */}
      <div className="px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
          {navItems.map((item) => {
            const isActive =
              currentScreen === item.screen ||
              (item.screen === 'channel_select' &&
                (currentScreen === 'table_map' || currentScreen === 'pos_order'));
            return (
              <button
                key={item.screen}
                onClick={() => setCurrentScreen(item.screen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Direct, Always-Accessible Logout Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 text-xs text-slate-600 font-medium">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-300"
            />
            <span className="font-bold text-slate-800">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400 capitalize">({currentUser.role})</span>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión actual y salir al Login"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};
