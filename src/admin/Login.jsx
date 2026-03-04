import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, KeyRound, Check } from 'lucide-react';
import logoBlue from '../assets/logo-dr-victor-horizontal-300x66.png';

const N8N_LOGIN_URL = 'https://victorbot.sosmarketing.agency/webhook/api-login';
const UPDATE_PASSWORD_URL = 'https://victorbot.sosmarketing.agency/webhook/api-user-update-password';

export default function Login() {
  const API_KEY = 'Bearer v2ew5w8mAq3';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isAdminAuth') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(N8N_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': API_KEY
        },
        body: JSON.stringify({ username, password })
      });

      const responseText = await response.text();
      console.log('Respuesta cruda Login n8n:', responseText);

      const responseData = responseText ? JSON.parse(responseText) : {};
      const data = Array.isArray(responseData) ? responseData[0] : responseData;

      if (data?.success && data?.user) {
        if (data.user.must_change_password) {
          setPendingUser(data.user);
          setIsNewUser(true);
          setPassword('');
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('isAdminAuth', 'true');
        navigate('/dashboard');
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(UPDATE_PASSWORD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': API_KEY
        },
        body: JSON.stringify({ username, newPassword })
      });

      const responseText = await response.text();
      const responseData = responseText ? JSON.parse(responseText) : {};
      const data = Array.isArray(responseData) ? responseData[0] : responseData;

      if (!response.ok || data?.success === false) {
        setError(data?.message || 'No se pudo actualizar la contraseña.');
        return;
      }

      const userToSave = pendingUser
        ? { ...pendingUser, must_change_password: false }
        : { username, must_change_password: false };

      localStorage.setItem('currentUser', JSON.stringify(userToSave));
      localStorage.setItem('isAdminAuth', 'true');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error actualizando contraseña:', err);
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
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            {isNewUser ? 'Crear Contraseña' : 'Acceso Administrativo'}
          </h1>
          <p className="text-slate-500">
            {isNewUser ? 'Es tu primer ingreso. Configura una clave segura.' : 'Sistema de Gestión de Pacientes'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        {!isNewUser ? (
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Si es su primera vez, deje la contraseña vacía.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0056b3] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nueva Contraseña</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar Contraseña</label>
              <div className="relative">
                <Check className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar y Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
