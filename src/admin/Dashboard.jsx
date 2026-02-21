import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, HeartPulse, Database, Loader2, Search, Filter, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const TREATMENT_OPTIONS = [
  "Manga Gástrica",
  "Balón Allurion",
  "Balón Ovalsiluethe",
  "Método Tore",
  "CPRE",
  "Consulta presencial",
  "Consulta online",
  "Retiro de balón"
];

const MEDICAL_TREATMENTS = [
  "Manga Gástrica", "Balón Allurion", "Balón Ovalsiluethe", "Método Tore", "CPRE", "Retiro de balón"
];

const getTreatmentsArray = (treatmentStr) => {
  if (!treatmentStr || typeof treatmentStr !== 'string' || treatmentStr === 'Por definir') return [];
  return treatmentStr.split(',').map(t => t.trim()).filter(Boolean);
};

const parseNotes = (notesStr) => {
  if (!notesStr) return [];
  try {
    const parsed = JSON.parse(notesStr);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    return [{ id: 'old-note', date: new Date().toISOString(), content: notesStr }];
  }
  return [];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTreatment, setFilterTreatment] = useState('Todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [medicalData, setMedicalData] = useState({ weight: '', height: '' });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', treatments: [] });

  // Estados del Modal de Notas
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeNotesLead, setActiveNotesLead] = useState(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [notesPage, setNotesPage] = useState(1); // ✨ NUEVO: Estado para la paginación

  const N8N_GET_URL = 'https://victorbot.sosmarketing.agency/webhook/api-leads';
  const N8N_POST_URL = 'https://victorbot.sosmarketing.agency/webhook/update-lead';

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${N8N_GET_URL}?t=${new Date().getTime()}`);
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
      name: updatedFields.name !== undefined ? updatedFields.name : currentLead.name,
      phone: updatedFields.phone !== undefined ? updatedFields.phone : currentLead.phone,
      treatment: updatedFields.treatment !== undefined ? updatedFields.treatment : currentLead.treatment,
    };

    setLeads(leads.map(lead => lead.id === id ? { ...lead, ...payload } : lead));

    try {
      await fetch(N8N_POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Error al enviar actualización a n8n:", error);
    }
  };

  const handleHeightChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 1) {
      val = val.slice(0, 1) + '.' + val.slice(1, 3);
    }
    setMedicalData({...medicalData, height: val});
  };

  const handlePatientClick = (e, lead) => {
    e.stopPropagation(); 
    if (lead.is_patient) {
      updateLead(lead.id, { is_patient: false, initial_weight: null, height: null, bmi: null, final_weight: null });
    } else {
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
    if (w > 0 && h > 0) bmiValue = (w / (h * h)).toFixed(2);

    updateLead(selectedLeadId, { is_patient: true, initial_weight: w || null, height: h || null, bmi: bmiValue });
    setModalOpen(false);
  };

  const handleRowDoubleClick = (lead) => {
    setLeadToEdit(lead);
    const validTreatments = getTreatmentsArray(lead.treatment).filter(t => TREATMENT_OPTIONS.includes(t));
    setEditFormData({
      name: lead.name || '',
      phone: lead.phone || '',
      treatments: validTreatments 
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const treatmentString = editFormData.treatments.join(', ') || 'Por definir';
    const hasMedicalTreatment = editFormData.treatments.some(t => MEDICAL_TREATMENTS.includes(t));
    
    if (hasMedicalTreatment && !leadToEdit.is_patient) {
      setEditModalOpen(false);
      updateLead(leadToEdit.id, { name: editFormData.name, phone: editFormData.phone, treatment: treatmentString });
      
      setSelectedLeadId(leadToEdit.id);
      setMedicalData({ weight: '', height: '' });
      setTimeout(() => setModalOpen(true), 300); 
    } else {
      updateLead(leadToEdit.id, { name: editFormData.name, phone: editFormData.phone, treatment: treatmentString });
      setEditModalOpen(false);
    }
  };

  const handleSaveNewNote = (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const currentNotes = parseNotes(activeNotesLead.notes);
    const newNote = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: newNoteContent.trim()
    };
    
    const updatedNotesArray = [...currentNotes, newNote];
    const updatedNotesString = JSON.stringify(updatedNotesArray);

    updateLead(activeNotesLead.id, { notes: updatedNotesString });
    
    setActiveNotesLead({ ...activeNotesLead, notes: updatedNotesString });
    setNewNoteContent('');
    setNotesPage(1); // Volvemos a la página 1 para ver la nota recién agregada
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    navigate('/login');
  };

  const filteredLeads = leads.filter((lead) => {
    if (filterTreatment !== 'Todos' && lead.treatment && !lead.treatment.includes(filterTreatment)) return false;
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
  const allTreatmentsArray = leads.map(l => l.treatment).filter(Boolean).join(',').split(',');
  const uniqueTreatments = ['Todos', ...new Set(allTreatmentsArray.map(t => t.trim()).filter(t => t && t !== 'Por definir'))];

  // ✨ LÓGICA DE PAGINACIÓN DE NOTAS
  const NOTES_PER_PAGE = 4;
  let sortedNotes = [];
  let paginatedNotes = [];
  let totalPages = 1;

  if (activeNotesLead) {
    // Ordenamos de más reciente a más antigua
    sortedNotes = parseNotes(activeNotesLead.notes).sort((a, b) => new Date(b.date) - new Date(a.date));
    totalPages = Math.ceil(sortedNotes.length / NOTES_PER_PAGE) || 1;
    paginatedNotes = sortedNotes.slice((notesPage - 1) * NOTES_PER_PAGE, notesPage * NOTES_PER_PAGE);
  }

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#0056b3]">CRM Médico</h2>
          <p className="mt-1 text-sm text-slate-500">Dr. Víctor Manrique</p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <button onClick={() => setActiveTab('leads')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'leads' ? 'bg-[#0056b3] text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]'}`}>
            <Users className="w-5 h-5" /> Leads Generales
          </button>
          <button onClick={() => setActiveTab('patients')} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'patients' ? 'bg-[#0056b3] text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056b3]'}`}>
            <HeartPulse className="w-5 h-5" /> Pacientes Clínicos
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 text-red-500 transition rounded-lg hover:bg-red-50">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {activeTab === 'leads' ? 'Gestión de Leads' : 'Historial de Pacientes'}
          </h1>
          <button onClick={fetchLeads} className="flex items-center gap-2 px-4 py-2 text-sm bg-white rounded-full shadow-sm text-slate-500 hover:bg-gray-50 border border-gray-200">
            <Database className="w-4 h-4 text-green-500" /> Actualizar Datos
          </button>
        </header>

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

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input type="text" placeholder="Buscar por nombre, teléfono, usuario o tratamiento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3]" />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <select value={filterTreatment} onChange={(e) => setFilterTreatment(e.target.value)} className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
              {uniqueTreatments.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 mb-4 animate-spin text-[#0056b3]" />
              <p>Conectando con la base de datos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <p className="px-6 py-2 text-xs text-slate-400 bg-slate-50 border-b border-gray-100">💡 Tip: Haz doble clic sobre cualquier fila para editar la información del paciente.</p>
              
              {activeTab === 'leads' ? (
                <table className="w-full text-sm text-left text-slate-600 min-w-[1000px]">
                  <thead className="bg-gray-50 text-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Fecha</th>
                      <th className="px-6 py-4 font-semibold">Datos del Contacto</th>
                      <th className="px-6 py-4 font-semibold">Tratamientos</th>
                      <th className="px-6 py-4 font-semibold">Estatus</th>
                      <th className="px-6 py-4 font-semibold text-center">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} onDoubleClick={() => handleRowDoubleClick(lead)} className="transition hover:bg-blue-50 cursor-pointer group">
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 align-top">
                          {new Date(lead.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="font-medium text-slate-800 mb-1 group-hover:text-[#0056b3] transition">{lead.name}</div>
                          <div className="font-mono text-xs text-slate-500 mb-1">{lead.phone}</div>
                          <a href={`https://instagram.com/${lead.username}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-[#0056b3] hover:underline">@{lead.username}</a>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {getTreatmentsArray(lead.treatment).map(t => (
                              <span key={t} className="px-2 py-1 text-[10px] font-semibold rounded-full bg-blue-100 text-[#0056b3] whitespace-nowrap">{t}</span>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-slate-400">📍 {lead.city}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-2">
                            <button onClick={(e) => { e.stopPropagation(); updateLead(lead.id, { is_contacted: !lead.is_contacted }); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${lead.is_contacted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                              {lead.is_contacted ? '✅ Contactado' : 'Marcar Contactado'}
                            </button>
                            <button onClick={(e) => handlePatientClick(e, lead)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${lead.is_patient ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                              {lead.is_patient ? '⭐ Ya es Paciente' : 'Marcar Paciente'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top text-center">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveNotesLead(lead); setNotesPage(1); setNotesModalOpen(true); }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0056b3] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                          >
                            <FileText size={16} /> 
                            Ver notas ({parseNotes(lead.notes).length})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm text-left text-slate-600 min-w-[1000px]">
                  <thead className="bg-purple-50 text-purple-900">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Paciente</th>
                      <th className="px-6 py-4 font-semibold">Tratamientos</th>
                      <th className="px-6 py-4 font-semibold">Peso Inicial</th>
                      <th className="px-6 py-4 font-semibold">Estatura</th>
                      <th className="px-6 py-4 font-semibold">IMC</th>
                      <th className="px-6 py-4 font-semibold">Peso Final (Evolución)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patientsList.map((patient) => (
                      <tr key={patient.id} onDoubleClick={() => handleRowDoubleClick(patient)} className="transition hover:bg-purple-50 cursor-pointer group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 group-hover:text-purple-700 transition">{patient.name}</div>
                          <div className="text-xs text-slate-500">{patient.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {getTreatmentsArray(patient.treatment).map(t => (
                               <span key={t} className="px-2 py-1 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700 whitespace-nowrap">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono">{patient.initial_weight ? `${patient.initial_weight} kg` : '-'}</td>
                        <td className="px-6 py-4 font-mono">{patient.height ? `${patient.height} m` : '-'}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-slate-100 font-bold font-mono">{patient.bmi || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="number" step="0.01" defaultValue={patient.final_weight || ''} 
                              onBlur={(e) => { const val = parseFloat(e.target.value); if (val !== patient.final_weight) updateLead(patient.id, { final_weight: val || null }); }} 
                              placeholder="Ej. 65.5" className="w-24 p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" 
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
        </div>
      </main>

      {/* --- MODALES EXISTENTES (Paciente y Editar) --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center bg-[#0056b3] p-4 text-white">
              <h3 className="font-bold text-lg">Confirmación de Paciente</h3>
              <button onClick={() => setModalOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition"><X size={20}/></button>
            </div>
            <form onSubmit={handleSavePatient} className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 text-sm">
                ¿Desea registrar a <strong className="font-bold">{leads.find(l => l.id === selectedLeadId)?.name}</strong> en el panel clínico?
              </div>
              <p className="text-sm text-slate-600">Ingresa sus datos base para iniciar su ficha y calcular el IMC.</p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Peso Inicial (kg)</label>
                <input type="number" step="0.01" required value={medicalData.weight} onChange={(e) => setMedicalData({...medicalData, weight: e.target.value})} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0056b3] outline-none" placeholder="Ej: 85.5" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Estatura (metros)</label>
                <input type="text" required value={medicalData.height} onChange={handleHeightChange} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0056b3] outline-none font-mono tracking-wider" placeholder="Ej: 1.75" maxLength={4} />
              </div>
              <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Solo Guardar Edición</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-sm">Confirmar como Paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center bg-slate-800 p-4 text-white">
              <h3 className="font-bold text-lg">Editar Información</h3>
              <button onClick={() => setEditModalOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
                  <input type="text" value={editFormData.name || ''} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input type="text" value={editFormData.phone || ''} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="w-full p-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-800 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Tratamientos de Interés</label>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {TREATMENT_OPTIONS.map(treatment => (
                    <label key={treatment} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0056b3] focus:ring-[#0056b3]" checked={editFormData.treatments.includes(treatment)}
                        onChange={(e) => {
                          if (e.target.checked) setEditFormData({...editFormData, treatments: [...editFormData.treatments, treatment]});
                          else setEditFormData({...editFormData, treatments: editFormData.treatments.filter(t => t !== treatment)});
                        }}
                      />
                      {treatment}
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✨ MODAL DE HISTORIAL DE NOTAS (CON PAGINACIÓN) */}
      {notesModalOpen && activeNotesLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-center bg-slate-50 border-b border-gray-100 p-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Historial de Notas</h3>
                <p className="text-sm font-medium text-slate-500">{activeNotesLead.name}</p>
              </div>
              <button onClick={() => setNotesModalOpen(false)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><X size={20}/></button>
            </div>

            <div className="px-6 pt-4 pb-2 border-b border-gray-50 flex flex-wrap gap-1">
              {getTreatmentsArray(activeNotesLead.treatment).map(t => (
                <span key={t} className="px-2 py-1 text-[10px] font-semibold rounded-md bg-blue-50 text-[#0056b3] border border-blue-100">{t}</span>
              ))}
              {getTreatmentsArray(activeNotesLead.treatment).length === 0 && (
                <span className="text-xs text-slate-400 italic">Sin tratamiento asignado</span>
              )}
            </div>

            {/* Listado de notas (Máx 4 por vista) */}
            <div className="p-6 flex-1 space-y-4 bg-slate-50/50 h-[380px] overflow-y-auto">
              {paginatedNotes.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-16 flex flex-col items-center">
                  <FileText className="w-12 h-12 mb-3 text-slate-200" />
                  Aún no hay notas para este paciente. <br/>Escribe la primera abajo.
                </div>
              ) : (
                paginatedNotes.map(note => (
                  <div key={note.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#0056b3] bg-blue-50 px-2 py-1 rounded">
                        {new Date(note.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-3 bg-white border-y border-gray-100">
                <button 
                  disabled={notesPage === 1}
                  onClick={() => setNotesPage(prev => prev - 1)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 p-1.5 rounded transition"
                >
                  <ChevronLeft size={16} /> Más recientes
                </button>
                <span className="text-xs font-medium text-slate-500">
                  Página {notesPage} de {totalPages}
                </span>
                <button 
                  disabled={notesPage === totalPages}
                  onClick={() => setNotesPage(prev => prev + 1)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 p-1.5 rounded transition"
                >
                  Más antiguas <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Caja de nueva nota */}
            <form onSubmit={handleSaveNewNote} className="p-5 bg-white">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Añadir nueva nota</label>
              <textarea 
                required
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Escribe el progreso, observaciones o recordatorios..." 
                className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0056b3] outline-none resize-none mb-3" 
                rows="3" 
              />
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0056b3] hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                  Guardar Nota
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}