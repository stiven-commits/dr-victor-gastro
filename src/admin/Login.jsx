import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import logoBlue from '../assets/logo-dr-victor-horizontal-300x66.png';

// Nuestra base de datos local temporal (Próximamente migrará a PostgreSQL)
const USERS = {
  'drvictor': { password: 'DRvictor2026', role: 'superadmin', name: 'Dr. Víctor' },
  'yowbram': { password: 'User2026*', role: 'user', name: 'Yowbram' },
  'dalber': { password: 'User2026*', role: 'user', name: 'Dalber' },
  'guillermo': { password: 'User2026*', role: 'user', name: 'Guillermo' },
  'kimberly': { password: 'User2026*', role: 'user', name: 'Kimberly' }
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Buscamos si el usuario existe y la clave coincide
    const user = USERS[username.toLowerCase().trim()];
    
    if (user && user.password === password) {
      // Guardamos la identidad de la persona que acaba de entrar
      localStorage.setItem('currentUser', JSON.stringify({ 
        username: username.toLowerCase().trim(), 
        role: user.role, 
        name: user.name 
      }));
      // Mantenemos la llave general para que no lo saque el sistema
      localStorage.setItem('isAdminAuth', 'true'); 
      navigate('/dashboard');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={logoBlue} alt="Logo Dr. Víctor" className="h-20 w-auto object-contain mb-4" />
          <p className="text-slate-500">Acceso exclusivo para personal</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] focus:border-transparent outline-none transition"
                placeholder="Ej. drvictor"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#0056b3] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}