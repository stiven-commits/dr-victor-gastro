import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, HeartPulse, Database, Loader2, Search, Filter, X, FileText, ChevronLeft, ChevronRight, ShieldAlert, CircleDot } from 'lucide-react';

const TREATMENT_OPTIONS = [
  "Manga Gástrica", "Balón Allurion", "Balón Ovalsiluethe", "Método Tore", "CPRE", "Consulta presencial", "Consulta online", "Retiro de balón"
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
  
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { name: 'Usuario', role: 'user', username: 'desconocido' };

  const [activeTab, setActiveTab] = useState('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTreatment, setFilterTreatment] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos'); // ✨ NUEVO: Estado del filtro estatus
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [medicalData, setMedicalData] = useState({ weight: '', height: '' });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', treatments: [] });

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeNotesLead, setActiveNotesLead] = useState(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [notesPage, setNotesPage] = useState(1); 

  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const N8N_GET_URL = 'https://victorbot.sosmarketing.agency/webhook/api-leads';
  const N8N_POST_URL = 'https://victorbot.sosmarketing.agency/webhook/update-lead';
  const N8N_AUDIT_URL = 'https://victorbot.sosmarketing.agency/webhook/api-audit-logs'; 

  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => { if (activeTab === 'audit') fetchAuditLogs(); }, [activeTab]);
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm, filterTreatment, filterStatus]); // ✨ Reset paginación al filtrar

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${N8N_GET_URL}?t=${new Date().getTime()}`);
      const data = await response.json();
      if (Array.isArray(data)) setLeads(data);
      else if (data && data[0] && Array.isArray(data[0])) setLeads(data[0]); 
      else setLeads([]);
      setLoading(false);
    } catch (error) {
      setLeads([]);
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const response = await fetch(`${N8N_AUDIT_URL}?t=${new Date().getTime()}`);
      const data = await response.json();
      setAuditLogs(Array.isArray(data) ? data : data[0] || []);
    } catch (error) { setAuditLogs([]); }
    setLoadingAudit(false);
  };

  const updateLead = async (id, updatedFields) => {
    const currentLead = leads.find(l => l.id === id);
    if (!currentLead) return;
    const payload = { ...currentLead, ...updatedFields, updated_by: currentUser.username };
    setLeads(leads.map(lead => lead.id === id ? payload : lead));
    try {
      await fetch(N8N_POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) { console.error(error); }
  };

  const handleHeightChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 1) val = val.slice(0, 1) + '.' + val.slice(1, 3);
    setMedicalData({...medicalData, height: val});
  };

  const handlePatientClick = (e, lead) => {
    e.stopPropagation(); 
    if (lead.is_patient) updateLead(lead.id, { is_patient: false, initial_weight: null, height: null, bmi: null, final_weight: null });
    else { setSelectedLeadId(lead.id); setMedicalData({ weight: '', height: '' }); setModalOpen(true); }
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    const w = parseFloat(medicalData.weight);
    const h = parseFloat(medicalData.height);
    let bmiValue = (w > 0 && h > 0) ? (w / (h * h)).toFixed(2) : null;
    updateLead(selectedLeadId, { is_patient: true, initial_weight: w || null, height: h || null, bmi: bmiValue });
    setModalOpen(false);
  };

  const handleRowDoubleClick = (lead) => {
    setLeadToEdit(lead);
    const validTreatments = getTreatmentsArray(lead.treatment).filter(t => TREATMENT_OPTIONS.includes(t));
    setEditFormData({ name: lead.name || '', phone: lead.phone || '', treatments: validTreatments });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const treatmentString = editFormData.treatments.join(', ') || 'Por definir';
    if (editFormData.treatments.some(t => MEDICAL_TREATMENTS.includes(t)) && !leadToEdit.is_patient) {
      setEditModalOpen(false);
      updateLead(leadToEdit.id, { name: editFormData.name, phone: editFormData.phone, treatment: treatmentString });
      setSelectedLeadId(leadToEdit.id); setMedicalData({ weight: '', height: '' });
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
    const newNote = { id: Date.now().toString(), date: new Date().toISOString(), content: newNoteContent.trim(), author: currentUser.name };
    const updatedNotesString = JSON.stringify([...currentNotes, newNote]);
    updateLead(activeNotesLead.id, { notes: updatedNotesString });
    setActiveNotesLead({ ...activeNotesLead, notes: updatedNotesString });
    setNewNoteContent(''); setNotesPage(1); 
  };

  // ✨ LÓGICA DE FILTRADO AVANZADO (TRATAMIENTO + STATUS)
  const filteredLeads = leads.filter((lead) => {
    // Filtro Tratamiento
    if (filterTreatment !== 'Todos' && lead.treatment && !lead.treatment.includes(filterTreatment)) return false;
    
    // Filtro Status
    if (filterStatus === 'Por Contactar' && (lead.is_contacted || lead.is_patient)) return false;
    if (filterStatus === 'Contactados' && !lead.is_contacted) return false;
    if (filterStatus === 'Solo Leads' && lead.is_patient) return false;
    if (filterStatus === 'Solo Pacientes' && !lead.is_patient) return false;

    // Filtro Búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return lead.name?.toLowerCase().includes(term) || lead.phone?.toLowerCase().includes(term) || lead.username?.toLowerCase().includes(term) || lead.treatment?.toLowerCase().includes(term);
    }
    return true; 
  });

  const patientsList = filteredLeads.filter(l => l.is_patient);
  const uncontactedCount = leads.filter(l => !l.is_patient && !l.is_contacted).length;

  // Paginación principal (7 por página)
  const ITEMS_PER_PAGE = 7;
  const totalItems = activeTab === 'leads' ? filteredLeads.length : patientsList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedList = (activeTab === 'leads' ? filteredLeads : patientsList).slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const allTreatmentsArray = leads.map(l => l.treatment).filter(Boolean).join(',').split(',');
  const uniqueTreatments = ['Todos', ...new Set(allTreatmentsArray.map(t => t.trim()).filter(t => t && t !== 'Por definir'))];

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col items-start">
          <img src="/logo.png" alt="Logo Dr. Víctor" className="h-12 w-auto object-contain mb-3" />
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
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center w-full gap-3 px-4 py-3 text-red-500 transition rounded-lg hover:bg-red-50"><LogOut className="w-5 h-5" /> Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">{activeTab === 'leads' ? 'Gestión de Leads' : activeTab === 'patients' ? 'Historial de Pacientes' : 'Auditoría del Sistema'}</h1>
        </header>

        {activeTab !== 'audit' && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-[#0056b3]"><p className="text-sm font-medium text-slate-500">Total Leads</p><p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : leads.length}</p></div>
            <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-orange-500"><p className="text-sm font-medium text-slate-500">Por Contactar</p><p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : uncontactedCount}</p></div>
            <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-purple-500"><p className="text-sm font-medium text-slate-500">Pacientes Activos</p><p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : leads.filter(l => l.is_patient).length}</p></div>
          </div>
        )}

        {activeTab !== 'audit' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input type="text" placeholder="Buscar por nombre, teléfono..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3]" />
            </div>
            {/* ✨ FILTRO STATUS */}
            <div className="relative">
              <CircleDot className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
                <option value="Todos">Estatus: Todos</option>
                <option value="Por Contactar">🔔 Por Contactar</option>
                <option value="Contactados">✅ Contactados</option>
                <option value="Solo Leads">🎯 Solo Leads</option>
                <option value="Solo Pacientes">⭐ Solo Pacientes</option>
              </select>
            </div>
            {/* FILTRO TRATAMIENTO */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <select value={filterTreatment} onChange={(e) => setFilterTreatment(e.target.value)} className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
                {uniqueTreatments.map(t => <option key={t} value={t}>{t === 'Todos' ? 'Tratamiento: Todos' : t}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col">
          {loading && activeTab !== 'audit' ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Loader2 className="w-8 h-8 mb-4 animate-spin text-[#0056b3]" /><p>Cargando datos...</p></div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'audit' ? (
                <div>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-slate-50"><h3 className="font-bold text-slate-700">Auditoría</h3><button onClick={fetchAuditLogs} className="text-xs text-slate-500 hover:underline">Actualizar</button></div>
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="bg-slate-800 text-white"><tr><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Paciente</th><th className="px-6 py-4">Acción</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">{auditLogs.map(log => (<tr key={log.id} className="hover:bg-slate-50"><td className="px-6 py-4 text-xs font-mono">{new Date(log.created_at).toLocaleString('es-VE')}</td><td className="px-6 py-4 font-semibold">@{log.user_name}</td><td className="px-6 py-4">{log.lead_name}</td><td className="px-6 py-4 text-xs">{log.action_details}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col">
                  <p className="px-6 py-2 text-xs text-slate-400 bg-slate-50 border-b border-gray-100">💡 Doble clic para editar.</p>
                  <table className="w-full text-sm text-left min-w-[1000px]">
                    <thead className={`${activeTab === 'leads' ? 'bg-gray-50' : 'bg-purple-50'} text-slate-800`}>
                      <tr>
                        <th className="px-6 py-4 font-semibold">{activeTab === 'leads' ? 'Fecha' : 'Paciente'}</th>
                        <th className="px-6 py-4 font-semibold">{activeTab === 'leads' ? 'Datos Contacto' : 'Tratamientos'}</th>
                        <th className="px-6 py-4 font-semibold">{activeTab === 'leads' ? 'Tratamientos' : 'Peso Inicial'}</th>
                        <th className="px-6 py-4 font-semibold">{activeTab === 'leads' ? 'Estatus' : 'IMC'}</th>
                        <th className="px-6 py-4 font-semibold text-center">{activeTab === 'leads' ? 'Notas' : 'Peso Final'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedList.map((lead) => (
                        <tr key={lead.id} onDoubleClick={() => handleRowDoubleClick(lead)} className={`transition hover:bg-slate-50 cursor-pointer`}>
                          {activeTab === 'leads' ? (
                            <>
                              <td className="px-6 py-4 text-xs text-slate-500">{new Date(lead.created_at).toLocaleDateString('es-ES')}</td>
                              <td className="px-6 py-4"><div className="font-bold">{lead.name}</div><div className="text-xs font-mono text-slate-400">{lead.phone}{lead.username && (
                                <a 
                                href={`https://instagram.com/${lead.username}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => e.stopPropagation()} 
                                className="text-xs text-[#0056b3] hover:underline flex items-center gap-0.5"
                                >
                                @{lead.username}
                                </a>
                                )}</div>
                            </td>
                              <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{getTreatmentsArray(lead.treatment).map(t => <span key={t} className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">{t}</span>)}</div></td>
                              <td className="px-6 py-4"><div className="flex flex-col gap-1">
                                <button onClick={(e) => { e.stopPropagation(); updateLead(lead.id, { is_contacted: !lead.is_contacted }); }} className={`px-2 py-1 text-[10px] font-bold rounded border ${lead.is_contacted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{lead.is_contacted ? '✅ Contactado' : '🔔 Por Contactar'}</button>
                                <button onClick={(e) => handlePatientClick(e, lead)} className={`px-2 py-1 text-[10px] font-bold rounded border ${lead.is_patient ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-slate-400 border-slate-200'}`}>{lead.is_patient ? '⭐ Paciente' : 'Marcar Paciente'}</button>
                              </div></td>
                              <td className="px-6 py-4 text-center"><button onClick={(e) => { e.stopPropagation(); setActiveNotesLead(lead); setNotesPage(1); setNotesModalOpen(true); }} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100">Notas ({parseNotes(lead.notes).length})</button></td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4"><div className="font-bold">{lead.name}</div><div className="text-xs text-slate-400">{lead.phone}</div></td>
                              <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{getTreatmentsArray(lead.treatment).map(t => <span key={t} className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700">{t}</span>)}</div></td>
                              <td className="px-6 py-4 font-mono">{lead.initial_weight || '-'} kg</td>
                              <td className="px-6 py-4 font-bold text-purple-700">{lead.bmi || '-'}</td>
                              <td className="px-6 py-4"><input type="number" step="0.01" defaultValue={lead.final_weight || ''} onBlur={(e) => updateLead(lead.id, { final_weight: parseFloat(e.target.value) || null })} className="w-20 p-1 text-center border border-purple-100 rounded focus:ring-1 focus:ring-purple-400 outline-none" placeholder="kg" /></td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab !== 'audit' && totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-100">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="text-sm font-bold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 px-3 py-2 rounded-lg transition"><ChevronLeft size={18} /></button>
              <span className="text-sm font-medium text-slate-500">Página {currentPage} de {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="text-sm font-bold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 px-3 py-2 rounded-lg transition"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      </main>

      {/* MODALES IGUALES PERO ACTUALIZADOS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center bg-[#0056b3] p-4 text-white"><h3 className="font-bold">Datos Médicos</h3><button onClick={() => setModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleSavePatient} className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold mb-1">Peso Inicial (kg)</label><input type="number" step="0.01" required value={medicalData.weight} onChange={(e) => setMedicalData({...medicalData, weight: e.target.value})} className="w-full p-2.5 border rounded-lg" /></div>
              <div><label className="block text-sm font-semibold mb-1">Estatura (metros)</label><input type="text" required value={medicalData.height} onChange={handleHeightChange} className="w-full p-2.5 border rounded-lg" placeholder="1.75" maxLength={4} /></div>
              <button type="submit" className="w-full bg-green-500 text-white py-2.5 rounded-xl font-bold hover:bg-green-600 transition">Confirmar como Paciente</button>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center bg-slate-800 p-4 text-white"><h3 className="font-bold">Editar Lead</h3><button onClick={() => setEditModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Nombre</label><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-semibold mb-1">Teléfono</label><input type="text" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-semibold mb-2">Tratamientos</label><div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border">{TREATMENT_OPTIONS.map(t => (<label key={t} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editFormData.treatments.includes(t)} onChange={(e) => e.target.checked ? setEditFormData({...editFormData, treatments: [...editFormData.treatments, t]}) : setEditFormData({...editFormData, treatments: editFormData.treatments.filter(item => item !== t)})} /> {t}</label>))}</div></div>
              <button type="submit" className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-bold">Guardar Cambios</button>
            </form>
          </div>
        </div>
      )}

      {notesModalOpen && activeNotesLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col h-[600px]">
            <div className="p-4 bg-slate-50 border-b flex justify-between"><div><h3 className="font-bold">Notas Históricas</h3><p className="text-xs text-slate-500">{activeNotesLead.name}</p></div><button onClick={() => setNotesModalOpen(false)}><X size={20}/></button></div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-100/50">
              {paginatedNotesModal.length === 0 ? <div className="text-center text-slate-400 py-20">Sin notas registradas.</div> : paginatedNotesModal.map(note => (
                <div key={note.id} className="bg-white p-3 rounded-xl border shadow-sm">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 border-b pb-1 mb-2"><span>{new Date(note.date).toLocaleString()}</span><span>Por: {note.author}</span></div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
            {totalNotesPages > 1 && <div className="p-2 border-t flex justify-between"><button disabled={notesPage === 1} onClick={() => setNotesPage(p => p-1)}><ChevronLeft size={16}/></button><span className="text-xs">Pág {notesPage}</span><button disabled={notesPage === totalNotesPages} onClick={() => setNotesPage(p => p+1)}><ChevronRight size={16}/></button></div>}
            <form onSubmit={handleSaveNewNote} className="p-4 border-t"><textarea required value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Nueva nota..." className="w-full p-2 border rounded-lg text-sm mb-2" rows="2" /><div className="flex justify-end"><button type="submit" className="bg-[#0056b3] text-white px-4 py-1.5 rounded-lg text-sm font-bold">Guardar Nota</button></div></form>
          </div>
        </div>
      )}
    </div>
  );
}