import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import logoBlue from '../assets/logo-dr-victor-horizontal-300x66.png'; // Asegúrate de que la ruta sea correcta

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Clave temporal de acceso. ¡Cámbiala por la que desees!
    if (password === 'VictorGastro2026') {
      localStorage.setItem('isAdminAuth', 'true');
      navigate('/dashboard');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex justify-center">
          <img src={logoBlue} alt="Dr. Victor Logo" className="h-12 w-auto" />
        </div>
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-800">Acceso al CRM</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Contraseña de Administrador</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-[#0056b3] focus:outline-none focus:ring-1 focus:ring-[#0056b3]"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#0056b3] py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Ingresar al Panel
          </button>
        </form>
      </div>
    </div>
  );
}