import { Users, LogOut, HeartPulse, ShieldAlert } from 'lucide-react';
import logoBlue from '../../assets/logo-dr-victor-horizontal-300x66.png';

export default function Sidebar({ currentUser, activeTab, setActiveTab, handleLogout }) {
  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-100 flex flex-col items-start">
        <img src={logoBlue} alt="Logo Dr. Víctor" className="h-12 w-auto object-contain mb-3" />
        <p className="mt-1 text-sm font-semibold text-slate-500">Hola, {currentUser.name}</p>
      </div>
      <nav className="p-4 space-y-2 flex-1">
        <button onClick={() => setActiveTab('leads')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'leads' ? 'bg-[#0056b3] text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]'}`}>
          <Users className="w-5 h-5" /> Leads Generales
        </button>
        <button onClick={() => setActiveTab('patients')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'patients' ? 'bg-[#0056b3] text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]'}`}>
          <HeartPulse className="w-5 h-5" /> Pacientes Clínicos
        </button>
        {currentUser.role === 'superadmin' && (
          <button onClick={() => setActiveTab('audit')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'audit' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
            <ShieldAlert className="w-5 h-5" /> Registro Actividad
          </button>
        )}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 text-red-500 transition rounded-lg hover:bg-red-50">
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}