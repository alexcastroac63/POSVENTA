/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant, ActiveScreen, DeviceMode } from '../../context/RestaurantContext';
import { INITIAL_USERS } from '../../data/initialData';
import {
  UtensilsCrossed,
  LayoutGrid,
  ShoppingCart,
  ChefHat,
  Receipt,
  BarChart3,
  GitBranch,
  Smartphone,
  Monitor,
  Tv,
  LogOut,
  ChevronDown,
  Building2,
  Cpu,
  UserCheck,
} from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    branch,
    setBranch,
    terminalId,
    currentScreen,
    setCurrentScreen,
    deviceMode,
    setDeviceMode,
    logout,
    orders,
  } = useRestaurant();

  const [showUserMenu, setShowUserMenu] = useState(false);

  // Count active kitchen orders
  const activeKitchenOrdersCount = orders.filter(
    (o) => o.status === 'en_cocina' || o.status === 'abierta'
  ).length;

  const navItems: { screen: ActiveScreen; label: string; icon: React.ReactNode; badge?: number }[] = [
    { screen: 'channel_select', label: 'Canales', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { screen: 'table_map', label: 'Salón Mesas', icon: <LayoutGrid className="w-4 h-4" /> },
    { screen: 'pos_order', label: 'Comanda POS', icon: <ShoppingCart className="w-4 h-4" /> },
    {
      screen: 'kds',
      label: 'KDS Cocina',
      icon: <ChefHat className="w-4 h-4" />,
      badge: activeKitchenOrdersCount,
    },
    { screen: 'cashier', label: 'Caja & Turnos', icon: <Receipt className="w-4 h-4" /> },
    { screen: 'reports', label: 'Reportes & Auditoría', icon: <BarChart3 className="w-4 h-4" /> },
    { screen: 'sprint_devops', label: 'Sprint & DevOps', icon: <GitBranch className="w-4 h-4" /> },
  ];

  if (currentScreen === 'login') {
    return null; // Login has its own minimal frame
  }

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md sticky top-0 z-40 select-none">
      {/* Top Utility Strip */}
      <div className="px-3 py-1.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-emerald-400 font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SISTEMA POS RESTO-XYZ
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="bg-transparent border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Sucursal Central #01" className="bg-slate-900 text-white">Sucursal Central #01</option>
              <option value="Sucursal Norte Mall" className="bg-slate-900 text-white">Sucursal Norte Mall</option>
            </select>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>{terminalId}</span>
          </div>
        </div>

        {/* Device Viewport Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 rounded-lg p-1 border border-slate-700">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1 hidden lg:inline">Modo Dispositivo:</span>
          <button
            onClick={() => setDeviceMode('responsive')}
            title="Vista Adaptable"
            className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 font-medium transition ${
              deviceMode === 'responsive'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span className="hidden sm:inline">Fluido</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            title="Simular Tablet Sofia (Android 7-10')"
            className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 font-medium transition ${
              deviceMode === 'tablet'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Tablet (Sofia)</span>
          </button>
          <button
            onClick={() => setDeviceMode('all_in_one')}
            title="Terminal Táctil All-in-One (Cajero)"
            className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 font-medium transition ${
              deviceMode === 'all_in_one'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>All-in-One (Carlos)</span>
          </button>
          <button
            onClick={() => setDeviceMode('kds_monitor')}
            title="Monitor KDS Cocina (Rodrigo)"
            className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 font-medium transition ${
              deviceMode === 'kds_monitor'
                ? 'bg-amber-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Tv className="w-3 h-3" />
            <span>KDS (Rodrigo)</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => setCurrentScreen(item.screen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active User Pill & Fast Role Switcher */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 px-2.5 py-1.5 rounded-lg transition"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-emerald-400"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-none text-white">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-400 capitalize font-medium">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                Cambiar de Usuario (Personas)
              </div>
              <div className="py-1">
                {INITIAL_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setShowUserMenu(false);
                      if (user.role === 'chef') setCurrentScreen('kds');
                      else if (user.role === 'cajero') setCurrentScreen('cashier');
                      else if (user.role === 'gerente') setCurrentScreen('reports');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs hover:bg-slate-800 transition ${
                      currentUser.id === user.id ? 'bg-slate-800/80 font-bold text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="leading-tight text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.device}</div>
                    </div>
                    {currentUser.id === user.id && <UserCheck className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
