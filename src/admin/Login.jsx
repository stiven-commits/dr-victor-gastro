import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import logoBlue from '../assets/logo-dr-victor-horizontal-300x66.png';

const N8N_LOGIN_URL = 'https://victorbot.sosmarketing.agency/webhook/api-login';

export default function Login() {
  const API_KEY = 'Bearer v2ew5w8mAq3';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.getItem('isAdminAuth') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(N8N_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify({ username, password })
      });
      const responseText = await response.text();
      console.log("🔍 Respuesta cruda Login n8n:", responseText);

      const responseData = JSON.parse(responseText);

      // Extraer el usuario sin importar cómo n8n haya anidado la respuesta
      let user = null;
      if (Array.isArray(responseData) && responseData.length > 0) {
      user = responseData[0]; // Si viene como arreglo: [{...}]
      } else if (responseData && typeof responseData === 'object' && responseData.username) {
      user = responseData; // Si viene como objeto directo: {...}
      } else if (responseData?.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
      user = responseData.data[0]; // Si viene anidado: { data: [{...}] }
      }

      // Validar que realmente tenemos un usuario
      if (user && user.username) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAdminAuth', 'true');
      navigate('/dashboard');
      } else {
      setError('Usuario o contraseña incorrectos.');
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={loading}
            className="w-full bg-[#0056b3] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
