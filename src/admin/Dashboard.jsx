import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, HeartPulse, Database, Loader2, Search, Filter, X } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navegación interna
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' o 'patients'
  
  // Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTreatment, setFilterTreatment] = useState('Todos');

  // Estado para el Modal de Nuevo Paciente
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [medicalData, setMedicalData] = useState({ weight: '', height: '' });

  // URLs de tus Webhooks de n8n
  const N8N_GET_URL = 'https://victorbot.sosmarketing.agency/webhook/api-leads';
  const N8N_POST_URL = 'https://victorbot.sosmarketing.agency/webhook/update-lead';

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(N8N_GET_URL);
      const data = await response.json();
      if (Array.isArray(data)) setLeads(data);
      else if (data && data[0] && Array.isArray(data[0])) setLeads(data[0]); 
      else if (data && typeof data === 'object' && data.id) setLeads([data]);
      else setLeads([]);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLeads([]);
      setLoading(false);
    }
  };

  const updateLead = async (id, updatedFields) => {
    const currentLead = leads.find(l => l.id === id);
    if (!currentLead) return;

    const payload = {
      id: id,
      is_contacted: updatedFields.is_contacted !== undefined ? updatedFields.is_contacted : currentLead.is_contacted,
      is_patient: updatedFields.is_patient !== undefined ? updatedFields.is_patient : currentLead.is_patient,
      notes: updatedFields.notes !== undefined ? updatedFields.notes : (currentLead.notes || ''),
      initial_weight: updatedFields.initial_weight !== undefined ? updatedFields.initial_weight : currentLead.initial_weight,
      height: updatedFields.height !== undefined ? updatedFields.height : currentLead.height,
      bmi: updatedFields.bmi !== undefined ? updatedFields.bmi : currentLead.bmi,
      final_weight: updatedFields.final_weight !== undefined ? updatedFields.final_weight : currentLead.final_weight,
    };

    try {
      setLeads(leads.map(lead => lead.id === id ? { ...lead, ...payload } : lead));
      await fetch(N8N_POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  // --- LÓGICA DEL MODAL CLÍNICO ---
  const handlePatientClick = (lead) => {
    if (lead.is_patient) {
      // Si ya era paciente, lo desmarcamos
      updateLead(lead.id, { is_patient: false, initial_weight: null, height: null, bmi: null, final_weight: null });
    } else {
      // Si no era paciente, abrimos el modal
      setSelectedLeadId(lead.id);
      setMedicalData({ weight: '', height: '' });
      setModalOpen(true);
    }
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    const w = parseFloat(medicalData.weight);
    const h = parseFloat(medicalData.height);
    let bmiValue = null;
    
    // Cálculo automático del IMC
    if (w > 0 && h > 0) {
      bmiValue = (w / (h * h)).toFixed(2);
    }

    updateLead(selectedLeadId, { 
      is_patient: true, 
      initial_weight: w || null, 
      height: h || null, 
      bmi: bmiValue
    });
    setModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    navigate('/login');
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredLeads = leads.filter((lead) => {
    if (filterTreatment !== 'Todos' && lead.treatment !== filterTreatment) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(term) ||
        lead.phone?.toLowerCase().includes(term) ||
        lead.username?.toLowerCase().includes(term) ||
        lead.treatment?.toLowerCase().includes(term)
      );
    }
    return true; 
  });

  const patientsList = filteredLeads.filter(l => l.is_patient);
  const uniqueTreatments = ['Todos', ...new Set(leads.map(lead => lead.treatment).filter(Boolean))];

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {/* --- MENÚ LATERAL --- */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#0056b3]">CRM Médico</h2>
          <p className="mt-1 text-sm text-slate-500">Dr. Víctor Manrique</p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('leads')}
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'leads' ? 'bg-[#0056b3] text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]'}`}
          >
            <Users className="w-5 h-5" /> Leads Generales
          </button>
          <button 
            onClick={() => setActiveTab('patients')}
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'patients' ? 'bg-[#0056b3] text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]'}`}
          >
            <HeartPulse className="w-5 h-5" /> Pacientes Clínicos
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 text-red-500 transition rounded-lg hover:bg-red-50">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {activeTab === 'leads' ? 'Gestión de Leads' : 'Historial de Pacientes'}
          </h1>
          <button onClick={fetchLeads} className="flex items-center gap-2 px-4 py-2 text-sm bg-white rounded-full shadow-sm text-slate-500 hover:bg-gray-50 border border-gray-200">
            <Database className="w-4 h-4 text-green-500" /> Actualizar Datos
          </button>
        </header>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-[#0056b3]">
            <p className="text-sm font-medium text-slate-500">Total Leads</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : leads.length}</p>
          </div>
          <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-purple-500">
            <p className="text-sm font-medium text-slate-500">Pacientes Activos</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : leads.filter(l => l.is_patient).length}</p>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, usuario o tratamiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3]"
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <select
              value={filterTreatment}
              onChange={(e) => setFilterTreatment(e.target.value)}
              className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer"
            >
              {uniqueTreatments.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* --- TABLA DINÁMICA --- */}
        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 mb-4 animate-spin text-[#0056b3]" />
              <p>Conectando con la base de datos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'leads' ? (
                /* TABLA DE LEADS */
                <table className="w-full text-sm text-left text-slate-600 min-w-[1000px]">
                  <thead className="bg-gray-50 text-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Fecha</th>
                      <th className="px-6 py-4 font-semibold">Datos del Contacto</th>
                      <th className="px-6 py-4 font-semibold">Tratamiento</th>
                      <th className="px-6 py-4 font-semibold">Estatus</th>
                      <th className="px-6 py-4 font-semibold">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="transition hover:bg-gray-50">
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 align-top">
                          {new Date(lead.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="font-medium text-slate-800 mb-1">{lead.name}</div>
                          <div className="font-mono text-xs text-slate-500 mb-1">{lead.phone}</div>
                          <a href={`https://instagram.com/${lead.username}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0056b3] hover:underline">@{lead.username}</a>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-[#0056b3]">{lead.treatment}</span>
                          <div className="mt-2 text-xs text-slate-400">📍 {lead.city}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-2">
                            <button onClick={() => updateLead(lead.id, { is_contacted: !lead.is_contacted })} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${lead.is_contacted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                              {lead.is_contacted ? '✅ Contactado' : 'Marcar Contactado'}
                            </button>
                            <button onClick={() => handlePatientClick(lead)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${lead.is_patient ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                              {lead.is_patient ? '⭐ Ya es Paciente' : 'Marcar Paciente'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <textarea
                            defaultValue={lead.notes || ''}
                            onBlur={(e) => { if (e.target.value !== (lead.notes || '')) updateLead(lead.id, { notes: e.target.value }); }}
                            placeholder="Añadir nota..."
                            className="w-full min-w-[200px] text-xs p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0056b3] resize-y" rows="3"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* TABLA DE PACIENTES CLÍNICOS */
                <table className="w-full text-sm text-left text-slate-600 min-w-[1000px]">
                  <thead className="bg-purple-50 text-purple-900">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Paciente</th>
                      <th className="px-6 py-4 font-semibold">Tratamiento</th>
                      <th className="px-6 py-4 font-semibold">Peso Inicial</th>
                      <th className="px-6 py-4 font-semibold">Estatura</th>
                      <th className="px-6 py-4 font-semibold">IMC</th>
                      <th className="px-6 py-4 font-semibold">Peso Final (Evolución)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patientsList.map((patient) => (
                      <tr key={patient.id} className="transition hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{patient.name}</div>
                          <div className="text-xs text-slate-500">{patient.phone}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#0056b3]">{patient.treatment}</td>
                        <td className="px-6 py-4 font-mono">{patient.initial_weight ? `${patient.initial_weight} kg` : '-'}</td>
                        <td className="px-6 py-4 font-mono">{patient.height ? `${patient.height} m` : '-'}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-slate-100 font-bold font-mono">{patient.bmi || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={patient.final_weight || ''}
                              onBlur={(e) => { 
                                const val = parseFloat(e.target.value);
                                if (val !== patient.final_weight) updateLead(patient.id, { final_weight: val || null }); 
                              }}
                              placeholder="Ej. 65.5"
                              className="w-24 p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-xs text-slate-400">kg</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          
          {!loading && ((activeTab === 'leads' && filteredLeads.length === 0) || (activeTab === 'patients' && patientsList.length === 0)) && (
             <div className="py-16 text-center text-slate-500">No se encontraron resultados.</div>
          )}
        </div>
      </main>

      {/* --- MODAL DE DATOS CLÍNICOS --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center bg-[#0056b3] p-4 text-white">
              <h3 className="font-bold text-lg">Ingreso de Paciente</h3>
              <button onClick={() => setModalOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition"><X size={20}/></button>
            </div>
            <form onSubmit={handleSavePatient} className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-4">Ingresa los datos base para calcular el IMC y transferir al panel clínico.</p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Peso Inicial (kg)</label>
                <input 
                  type="number" step="0.01" required
                  value={medicalData.weight}
                  onChange={(e) => setMedicalData({...medicalData, weight: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0056b3]"
                  placeholder="Ej: 85.5"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Estatura (metros)</label>
                <input 
                  type="number" step="0.01" required
                  value={medicalData.height}
                  onChange={(e) => setMedicalData({...medicalData, height: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0056b3]"
                  placeholder="Ej: 1.75"
                />
              </div>
              <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-sm">Confirmar y Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}