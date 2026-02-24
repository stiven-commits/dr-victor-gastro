import { Users, LogOut, HeartPulse, ShieldAlert, Calendar, X } from 'lucide-react';
import logoBlue from '../../assets/logo-dr-victor-horizontal-300x66.png';

export default function Sidebar({ currentUser, activeTab, setActiveTab, handleLogout, mobileMenuOpen, setMobileMenuOpen }) {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (setMobileMenuOpen) setMobileMenuOpen(false); // Cierra el menú en móvil al elegir una opción
  };

  return (
    <>
      {/* Capa oscura (Overlay) solo para móvil */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Convertido en un cajón deslizante para móvil */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen z-50 w-64 bg-white shadow-2xl md:shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex flex-col items-start relative">
          {/* Botón cerrar (X) en móvil */}
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>

          <img src={logoBlue} alt="Logo Dr. Víctor" className="h-10 md:h-12 w-auto object-contain mb-3" />
          <p className="mt-1 text-xs md:text-sm font-semibold text-slate-500 truncate w-full">Hola, {currentUser.name}</p>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <button onClick={() => handleTabClick('leads')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'leads' ? 'bg-[#0056b3] text-white shadow-md' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]'}`}>
            <Users className="w-5 h-5" /> <span className="font-medium">Leads Generales</span>
          </button>
          <button onClick={() => handleTabClick('patients')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'patients' ? 'bg-[#0056b3] text-white shadow-md' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]'}`}>
            <HeartPulse className="w-5 h-5" /> <span className="font-medium">Pacientes Clínicos</span>
          </button>
          <button onClick={() => handleTabClick('agenda')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'agenda' ? 'bg-[#0056b3] text-white shadow-md' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]'}`}>
            <Calendar className="w-5 h-5" /> <span className="font-medium">Agenda</span>
          </button>
          {currentUser.role === 'superadmin' && (
            <button onClick={() => handleTabClick('audit')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'audit' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
              <ShieldAlert className="w-5 h-5" /> <span className="font-medium">Registro Actividad</span>
            </button>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
          <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 text-red-600 font-medium transition rounded-lg hover:bg-red-50">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}