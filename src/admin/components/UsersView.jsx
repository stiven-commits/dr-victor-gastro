import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Key, Check, X, Shield, Eye, Lock } from 'lucide-react';

const API_KEY = 'Bearer v2ew5w8mAq3';
// NOTA: Debes crear estos webhooks en n8n
const GET_USERS_URL = 'https://victorbot.sosmarketing.agency/webhook/api-users-list';
const SAVE_USER_URL = 'https://victorbot.sosmarketing.agency/webhook/api-user-save';
const DELETE_USER_URL = 'https://victorbot.sosmarketing.agency/webhook/api-user-delete';

const MODULES = [
  { id: 'leads', label: 'Gestión de Leads' },
  { id: 'patients', label: 'Pacientes' },
  { id: 'agenda', label: 'Agenda Médica' },
  { id: 'finances', label: 'Finanzas' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'informes', label: 'Informes Médicos' }
];

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Estado del formulario
  const [form, setForm] = useState({
    username: '',
    role: 'user',
    permissions: {}, // { leads: 'edit', inventory: 'view', ... }
    resetPassword: false // Para forzar cambio de clave
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GET_USERS_URL}?t=${Date.now()}`, { 
        headers: { 'Authorization': API_KEY } 
      });
      
      const text = await res.text();
      
      if (!text) {
        setUsers([]);
        return;
      }
      
      const data = JSON.parse(text);
      
      // Lógica robusta para extraer los datos sin importar cómo los envuelva n8n
      let userList = [];
      if (Array.isArray(data)) {
        userList = Array.isArray(data[0]) ? data[0] : data;
      } else if (data && typeof data === 'object') {
        userList = data.data || data.rows || (data.id ? [data] : []);
      }
      
      // Imprimir en consola para verificar qué llegó exactamente
      console.log("Usuarios detectados por React:", userList);
      
      setUsers(userList);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      // Parsear permisos si vienen como string JSON o ya objeto
      let perms = user.permissions;
      if (typeof perms === 'string') {
        try { perms = JSON.parse(perms); } catch { perms = {}; }
      }
      setForm({ username: user.username, role: user.role || 'user', permissions: perms || {}, resetPassword: false });
    } else {
      setEditingUser(null);
      // Por defecto permisos vacíos
      setForm({ username: '', role: 'user', permissions: {}, resetPassword: true });
    }
    setIsModalOpen(true);
  };

  const handlePermissionChange = (moduleId, level) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: level // 'none', 'view', 'edit'
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        id: editingUser ? editingUser.id : undefined,
        // Si es nuevo, mandamos flag para que el backend sepa que debe entrar sin clave
        is_new: !editingUser
      };

      await fetch(SAVE_USER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify(payload)
      });
      
      setIsModalOpen(false);
      fetchUsers();
      alert(editingUser ? 'Usuario actualizado' : 'Usuario creado. Podrá ingresar sin clave la primera vez.');
    } catch (error) {
      console.error(error);
      alert('Error al guardar usuario');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('¿Eliminar usuario?')) return;
    try {
      await fetch(DELETE_USER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify({ id })
      });
      fetchUsers();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Gestión de Usuarios</h2>
          <p className="text-slate-500">Administra accesos y permisos del sistema</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition">
          <UserPlus size={20} /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Estado Clave</th>
              <th className="px-6 py-4">Permisos</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="5" className="p-10 text-center">Cargando...</td></tr> : users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  {user.username}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.must_change_password ? 
                    <span className="text-amber-600 font-bold text-xs flex items-center gap-1"><Key size={14}/> Pendiente cambio</span> : 
                    <span className="text-green-600 font-bold text-xs flex items-center gap-1"><Check size={14}/> Activa</span>
                  }
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                  {user.role === 'admin' ? 'Acceso Total' : 'Personalizado'}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleOpenModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de Usuario</label>
                  <input required type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="ej. doctor1" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Rol</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="user">Usuario Estándar</option>
                    <option value="admin">Administrador (Acceso Total)</option>
                  </select>
                </div>
              </div>

              {editingUser && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
                  <input type="checkbox" id="resetPass" checked={form.resetPassword} onChange={e => setForm({...form, resetPassword: e.target.checked})} className="w-5 h-5 text-amber-600 rounded" />
                  <label htmlFor="resetPass" className="text-sm font-bold text-amber-800 cursor-pointer">Forzar cambio de contraseña en próximo inicio</label>
                </div>
              )}

              {form.role !== 'admin' && (
                <div className="border-t pt-4">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Shield size={18} /> Permisos por Módulo</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {MODULES.map(mod => {
                      const currentPerm = form.permissions[mod.id] || 'none';
                      return (
                        <div key={mod.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-medium text-slate-700">{mod.label}</span>
                          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                            <button type="button" onClick={() => handlePermissionChange(mod.id, 'none')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${currentPerm === 'none' ? 'bg-slate-200 text-slate-600' : 'text-slate-400 hover:text-slate-600'}`}>Bloqueado</button>
                            <button type="button" onClick={() => handlePermissionChange(mod.id, 'view')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${currentPerm === 'view' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}><Eye size={14} className="inline mr-1"/> Ver</button>
                            <button type="button" onClick={() => handlePermissionChange(mod.id, 'edit')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${currentPerm === 'edit' ? 'bg-green-100 text-green-600' : 'text-slate-400 hover:text-green-600'}`}><Edit size={14} className="inline mr-1"/> Editar</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-[#0056b3] text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}