import { Users, LogOut, HeartPulse, ShieldAlert, DollarSign, FileText, X, Package, ShieldCheck } from 'lucide-react';
import logo from '../../assets/logo-dr-victor-horizontal-300x66.png'; // Asegúrate de que este logo (versión clara) se vea bien en fondo oscuro, si no usa el blanco.

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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Oscuro */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen z-50 w-64 bg-slate-900 text-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-6 border-b border-slate-800 flex flex-col items-center relative">
          {/* Botón cerrar (X) en móvil */}
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white md:hidden hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>

          {/* Logo con filtro para que se vea blanco si es necesario, o usa tu logo blanco importado */}
          <img src={logo} alt="Logo Dr. Víctor" className="h-10 md:h-12 w-auto object-contain mb-3 brightness-0 invert" />
          
          <div className="text-center w-full">
            <p className="text-sm font-bold text-slate-200 truncate">{currentUser.name || 'Usuario'}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{currentUser.role === 'admin' ? 'Administrador' : 'Colaborador'}</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <button onClick={() => handleTabClick('leads')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeTab === 'leads' ? 'bg-[#0056b3] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Users size={20} /> <span>Leads Generales</span>
          </button>
          
          <button onClick={() => handleTabClick('patients')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeTab === 'patients' ? 'bg-[#0056b3] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <HeartPulse size={20} /> <span>Pacientes Clínicos</span>
          </button>
          
          <button onClick={() => handleTabClick('finances')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeTab === 'finances' ? 'bg-[#0056b3] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <DollarSign size={20} /> <span>Finanzas / Pagos</span>
          </button>
          
          <button onClick={() => handleTabClick('informes')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeTab === 'informes' ? 'bg-[#0056b3] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <FileText size={20} /> <span>Informes Médicos</span>
          </button>
          
          <button onClick={() => handleTabClick('inventory')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeTab === 'inventory' ? 'bg-[#0056b3] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Package size={20} /> <span>Inventario Balones</span>
          </button>

          {/* SECCIÓN SOLO ADMIN */}
          {currentUser.role === 'admin' && (
            <>
              <div className="my-2 border-t border-slate-800 mx-2"></div>
              
              {/* Botón de Auditoría */}
              <button onClick={() => handleTabClick('audit')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeTab === 'audit' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
                <ShieldAlert size={20} /> <span>Auditoría</span>
              </button>

              {/* Botón de Gestión de Usuarios (RESTAURADO) */}
              <button onClick={() => handleTabClick('users')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeTab === 'users' ? 'bg-purple-700 text-white shadow-lg' : 'text-purple-400 hover:bg-slate-800 hover:text-white'}`}>
                <ShieldCheck size={20} /> <span>Usuarios</span>
              </button>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 mt-auto">
          <button onClick={handleLogout} className="flex items-center justify-center w-full gap-3 px-4 py-3 text-red-400 font-bold transition rounded-xl hover:bg-red-900/20 hover:text-red-300">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}