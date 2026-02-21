import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Activity, Database, Loader2, Search, Filter } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Nuevos estados para la búsqueda y el filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTreatment, setFilterTreatment] = useState('Todos');

  // Tu URL de producción de n8n
  const N8N_WEBHOOK_URL = 'https://victorbot.sosmarketing.agency/webhook/api-leads';

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(N8N_WEBHOOK_URL);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setLeads(data);
      } else if (data && data[0] && Array.isArray(data[0])) {
        setLeads(data[0]); 
      } else if (data && typeof data === 'object' && data.id) {
        setLeads([data]);
      } else {
        setLeads([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar los leads:", error);
      setLeads([]);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    navigate('/login');
  };

  // --- LÓGICA DE FILTRADO Y BÚSQUEDA ---
  const filteredLeads = leads.filter((lead) => {
    // 1. Filtro por tratamiento
    if (filterTreatment !== 'Todos' && lead.treatment !== filterTreatment) return false;

    // 2. Filtro por término de búsqueda (Excluyendo ciudad)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = lead.name?.toLowerCase().includes(term);
      const matchPhone = lead.phone?.toLowerCase().includes(term);
      const matchUsername = lead.username?.toLowerCase().includes(term);
      const matchEmail = lead.email?.toLowerCase().includes(term);
      const matchTreatment = lead.treatment?.toLowerCase().includes(term);
      const matchDate = new Date(lead.created_at).toLocaleDateString('es-ES').includes(term);

      // Si no coincide con NINGUNO de estos campos, lo ocultamos
      if (!matchName && !matchPhone && !matchUsername && !matchEmail && !matchTreatment && !matchDate) {
        return false;
      }
    }
    
    return true; // Si pasa todos los filtros, lo mostramos
  });

  // Extraer lista única de tratamientos para el selector desplegable
  const uniqueTreatments = ['Todos', ...new Set(leads.map(lead => lead.treatment).filter(Boolean))];

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {/* Menú Lateral */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#0056b3]">CRM Médico</h2>
          <p className="mt-1 text-sm text-slate-500">Dr. Víctor Manrique</p>
        </div>
        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 rounded-lg bg-[#0056b3] px-4 py-3 text-white">
            <Users className="w-5 h-5" /> Leads (Pacientes)
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 transition rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]">
            <Activity className="w-5 h-5" /> Estadísticas
          </a>
        </nav>
        <div className="absolute w-64 p-4 border-t border-gray-100 bottom-0">
          <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 text-red-500 transition rounded-lg hover:bg-red-50">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Leads</h1>
          <button onClick={fetchLeads} className="flex items-center gap-2 px-4 py-2 text-sm bg-white rounded-full shadow-sm text-slate-500 hover:bg-gray-50 border border-gray-200">
            <Database className="w-4 h-4 text-green-500" /> Actualizar Datos
          </button>
        </header>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-[#0056b3]">
            <p className="text-sm font-medium text-slate-500">Total Leads Captados</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : leads.length}</p>
          </div>
          <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-green-500">
            <p className="text-sm font-medium text-slate-500">Filtrados en pantalla</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : filteredLeads.length}</p>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, usuario, correo o tratamiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent"
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <select
              value={filterTreatment}
              onChange={(e) => setFilterTreatment(e.target.value)}
              className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer"
            >
              {uniqueTreatments.map(treatment => (
                <option key={treatment} value={treatment}>{treatment}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Leads */}
        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 mb-4 animate-spin text-[#0056b3]" />
              <p>Conectando con la base de datos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600 min-w-[800px]">
                <thead className="bg-gray-50 text-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Nombre</th>
                    <th className="px-6 py-4 font-semibold">Teléfono</th>
                    <th className="px-6 py-4 font-semibold">Usuario (IG)</th>
                    <th className="px-6 py-4 font-semibold">Ciudad</th>
                    <th className="px-6 py-4 font-semibold">Tratamiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="transition hover:bg-gray-50">
                      {/* Fecha con formato DD/MM/YYYY */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{lead.name}</td>
                      <td className="px-6 py-4 font-mono text-sm">{lead.phone}</td>
                      
                      {/* Enlace clickeable de Instagram */}
                      <td className="px-6 py-4">
                        <a 
                          href={`https://instagram.com/${lead.username}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#0056b3] hover:underline hover:text-blue-700 transition"
                        >
                          @{lead.username}
                        </a>
                      </td>
                      
                      <td className="px-6 py-4">{lead.city}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${lead.treatment === 'Por definir' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-[#0056b3]'}`}>
                          {lead.treatment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredLeads.length === 0 && (
             <div className="py-16 text-center text-slate-500">
               No se encontraron resultados para tu búsqueda.
             </div>
          )}
        </div>
      </main>
    </div>
  );
}