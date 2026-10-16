/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { User, UserRole } from '../../types/restaurant';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  Shield,
  Smartphone,
  Check,
  X,
  Search,
} from 'lucide-react';

export const AdminUsersView: React.FC = () => {
  const { users, saveUser, deleteUser, profiles, showToast } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('mesero');
  const [formPin, setFormPin] = useState('1234');
  const [formDevice, setFormDevice] = useState('Tablet Android');
  const [formAvatar, setFormAvatar] = useState(
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80'
  );

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.device?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormName('');
    setFormRole('mesero');
    setFormPin('1234');
    setFormDevice('Tablet POS');
    setFormAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormRole(user.role);
    setFormPin(user.pin);
    setFormDevice(user.device);
    setFormAvatar(user.avatar);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Por favor ingresa un nombre para el usuario');
      return;
    }

    const item: User = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      name: formName.trim(),
      role: formRole,
      pin: formPin.trim(),
      device: formDevice.trim(),
      avatar: formAvatar.trim(),
    };

    saveUser(item);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            Directorio de Usuarios & Personal de Turno
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestiona empleados, credenciales de PIN de acceso rápido, dispositivos asignados y roles vinculados.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar usuario por nombre o rol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredUsers.map((u) => {
          const profile = profiles.find((p) => p.roleKey === u.role);

          return (
            <div
              key={u.id}
              className="bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-2xl p-4 shadow-2xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{u.name}</h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase block w-fit mt-0.5">
                      {profile?.name || u.role}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" /> PIN de Acceso:
                    </span>
                    <span className="font-mono font-bold text-slate-900 tracking-wider">
                      {u.pin}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" /> Dispositivo:
                    </span>
                    <span className="text-[11px] font-medium text-slate-700 truncate max-w-[140px]">
                      {u.device || 'Terminal Web'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                  title="Editar usuario"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  disabled={users.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-30"
                  title="Eliminar usuario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {editingUser ? 'Editar Empleado / Usuario' : 'Nuevo Empleado / Usuario'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  placeholder="Ej: Laura Gómez"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Perfil / Rol</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 capitalize cursor-pointer"
                  >
                    <option value="gerente">Gerente</option>
                    <option value="cajero">Cajero</option>
                    <option value="mesero">Mesero / Mozo</option>
                    <option value="chef">Chef / Cocina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Rápido (4 dígitos)</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 tracking-widest text-center"
                    placeholder="1234"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dispositivo de Turno</label>
                <input
                  type="text"
                  value={formDevice}
                  onChange={(e) => setFormDevice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  placeholder="Tablet Samsung 10 pulgadas / Monitor KDS"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL de Avatar / Foto</label>
                <input
                  type="url"
                  value={formAvatar}
                  onChange={(e) => setFormAvatar(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
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
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
