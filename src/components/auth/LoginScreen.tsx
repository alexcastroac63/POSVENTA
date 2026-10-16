/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { INITIAL_USERS } from '../../data/initialData';
import { ShoppingCart, ArrowLeft, ArrowRight, RotateCw, Home, Lock, User as UserIcon } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useRestaurant();
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
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 font-sans">
      {/* Wireframe Window Shell (Executive Light Theme) */}
      <div className="w-full max-w-4xl bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Browser Title Bar */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 text-slate-600">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:text-slate-900 transition"><ArrowLeft className="w-4 h-4" /></button>
            <button className="p-1 hover:text-slate-900 transition"><ArrowRight className="w-4 h-4" /></button>
            <button className="p-1 hover:text-slate-900 transition"><RotateCw className="w-4 h-4" /></button>
            <button className="p-1 hover:text-slate-900 transition"><Home className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 max-w-md bg-white border border-slate-300 rounded-md px-3 py-1 text-xs text-center text-slate-600 font-mono shadow-2xs">
            https://pos.restoxyz.internal/login
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Terminal All-in-One #01
          </div>
        </div>

        {/* Inner Canvas */}
        <div className="p-6 md:p-12 flex flex-col items-center justify-center min-h-[520px] bg-slate-50/60">
          {/* Central Login Box matching the wireframe */}
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-md flex flex-col items-center">
            {/* Round Green Cart Icon (Direct representation of Blank diagram (7).svg) */}
            <div className="w-20 h-20 rounded-full bg-emerald-600 border-4 border-emerald-100 flex items-center justify-center shadow-md mb-6">
              <ShoppingCart className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-xl font-black text-slate-800 tracking-wide uppercase mb-1">
              Sistema POS Resto-XYZ
            </h1>
            <p className="text-xs text-slate-500 mb-6 text-center">
              Administración Omnicanal Sincronizada (Tablets & All-in-One)
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition shadow-2xs"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition tracking-widest shadow-2xs"
                  placeholder="••••••••"
                />
              </div>

              {errorMsg && <p className="text-rose-600 text-xs text-center font-medium">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-700/20 transition text-sm uppercase tracking-wider cursor-pointer"
              >
                Ingresar al Sistema
              </button>
            </form>

            {/* Quick Persona Access (Per spec requirements) */}
            <div className="w-full mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
                Acceso Rápido por Ficha Caso Persona:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {INITIAL_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => login(user)}
                    className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-500 rounded-lg text-left transition group"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300 group-hover:border-emerald-500"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 truncate">{user.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-emerald-700 font-medium capitalize">{user.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info matching wireframe */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <span>SUCURSAL: Central Principal #01</span>
          <span>EQUIPO: Terminal Touch POS</span>
          <span className="text-emerald-700 font-semibold">ESTADO: En línea (Sincronización Tiempo Real)</span>
        </div>
      </div>
    </div>
  );
};
