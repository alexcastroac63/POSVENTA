/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { INITIAL_USERS } from '../../data/initialData';
import { ShoppingCart, Lock, User as UserIcon, Store, MonitorCheck, ShieldCheck } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, branch } = useRestaurant();
  const [username, setUsername] = useState('sofia');
  const [password, setPassword] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = INITIAL_USERS.find(
      (u) =>
        u.name.toLowerCase().includes(username.toLowerCase()) ||
        u.role.toLowerCase() === username.toLowerCase() ||
        u.id.includes(username.toLowerCase())
    );

    if (matched) {
      login(matched);
    } else {
      login(INITIAL_USERS[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Clean Executive Top Bar */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              RESTO-XYZ POS OMNICANAL
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">Terminal POS Punto de Venta</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{branch} • En Línea</span>
        </div>
      </header>

      {/* Main Login Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-md flex flex-col items-center">
          {/* Round Green Cart Icon (Wireframe Logo) */}
          <div className="w-20 h-20 rounded-full bg-emerald-600 border-4 border-emerald-100 flex items-center justify-center shadow-md mb-5">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-slate-500 mb-6 text-center">
            Sistema de Administración Omnicanal de Restaurantes
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-emerald-600" /> Usuario:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition shadow-2xs"
                placeholder="Ej: sofia o cajero"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Clave:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition tracking-widest shadow-2xs"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && <p className="text-rose-600 text-xs text-center font-medium">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition text-sm uppercase tracking-wider cursor-pointer"
            >
              Ingresar al Sistema
            </button>
          </form>

          {/* Quick Persona Access */}
          <div className="w-full mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Acceso Rápido por Ficha de Personal:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {INITIAL_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => login(user)}
                  className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-left transition cursor-pointer group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 group-hover:border-emerald-500"
                  />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-800 truncate">{user.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold capitalize">{user.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Bottom Footer */}
      <footer className="px-6 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>Sucursal Central #01</span>
        </div>
        <div className="flex items-center gap-2">
          <MonitorCheck className="w-4 h-4 text-sky-600" />
          <span>Terminal Touch POS</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Sincronización en Tiempo Real Activa</span>
        </div>
      </footer>
    </div>
  );
};
