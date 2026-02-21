import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

// Importar Componentes Modulares
import Sidebar from './components/Sidebar';
import MetricsCards from './components/MetricsCards';
import Filters from './components/Filters';
import { PatientModal, EditLeadModal, NotesModal } from './components/Modals';

// Importar Utilidades
import { TREATMENT_OPTIONS, MEDICAL_TREATMENTS, getTreatmentsArray, parseNotes } from './utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Estados Generales
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leads');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Estados de Filtros y Paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTreatment, setFilterTreatment] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos'); 
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [medicalData, setMedicalData] = useState({ weight: '', height: '', cedula: '', edad: '' });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', treatments: [] });

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeNotesLead, setActiveNotesLead] = useState(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [notesPage, setNotesPage] = useState(1); 

  // Autenticación
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { name: 'Usuario', role: 'user', username: 'desconocido' };

  const N8N_GET_URL = 'https://victorbot.sosmarketing.agency/webhook/api-leads';
  const N8N_POST_URL = 'https://victorbot.sosmarketing.agency/webhook/update-lead';
  const N8N_AUDIT_URL = 'https://victorbot.sosmarketing.agency/webhook/api-audit-logs'; 

  // Efectos (Carga de datos)
  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => { if (activeTab === 'audit') fetchAuditLogs(); }, [activeTab]);
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm, filterTreatment, filterStatus]); 

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${N8N_GET_URL}?t=${new Date().getTime()}`);
      const data = await response.json();
      setLeads(Array.isArray(data) ? data : data[0] || [data] || []);
      setLoading(false);
    } catch (error) { setLeads([]); setLoading(false); }
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

  // Acciones en Base de Datos
  const updateLead = async (id, updatedFields) => {
    const currentLead = leads.find(l => l.id === id);
    if (!currentLead) return;
    
    const payload = { 
      ...currentLead, 
      ...updatedFields, 
      cedula: updatedFields.cedula !== undefined ? updatedFields.cedula : currentLead.cedula,
      edad: updatedFields.edad !== undefined ? updatedFields.edad : currentLead.edad,
      updated_by: currentUser.username 
    };
    
    setLeads(leads.map(lead => lead.id === id ? payload : lead));
    try {
      await fetch(N8N_POST_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (error) { console.error(error); }
  };

  // Manejadores de Eventos (Handlers)
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleHeightChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 1) val = val.slice(0, 1) + '.' + val.slice(1, 3);
    setMedicalData({...medicalData, height: val});
  };

  const handlePatientClick = (e, lead) => {
    e.stopPropagation(); 
    if (lead.is_patient) {
      updateLead(lead.id, { is_patient: false, initial_weight: null, height: null, bmi: null, final_weight: null, cedula: null, edad: null });
    } else { 
      setSelectedLeadId(lead.id); 
      setMedicalData({ weight: '', height: '', cedula: lead.cedula || '', edad: lead.edad || '' }); 
      setModalOpen(true); 
    }
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    const w = parseFloat(medicalData.weight);
    const h = parseFloat(medicalData.height);
    let bmiValue = (w > 0 && h > 0) ? (w / (h * h)).toFixed(2) : null;
    updateLead(selectedLeadId, { 
      is_patient: true, initial_weight: w || null, height: h || null, bmi: bmiValue,
      cedula: medicalData.cedula || null, edad: medicalData.edad ? parseInt(medicalData.edad) : null
    });
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
      setSelectedLeadId(leadToEdit.id); 
      setMedicalData({ weight: '', height: '', cedula: leadToEdit.cedula || '', edad: leadToEdit.edad || '' });
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

  // Lógica Matemática de Listas y Paginación
  const filteredLeads = leads.filter((lead) => {
    if (filterTreatment !== 'Todos' && lead.treatment && !lead.treatment.includes(filterTreatment)) return false;
    if (filterStatus === 'Por Contactar' && (lead.is_contacted || lead.is_patient)) return false;
    if (filterStatus === 'Contactados' && !lead.is_contacted) return false;
    if (filterStatus === 'Solo Leads' && lead.is_patient) return false;
    if (filterStatus === 'Solo Pacientes' && !lead.is_patient) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return lead.name?.toLowerCase().includes(term) || lead.phone?.toLowerCase().includes(term) || lead.username?.toLowerCase().includes(term) || lead.treatment?.toLowerCase().includes(term) || lead.cedula?.toLowerCase().includes(term);
    }
    return true; 
  });

  const patientsList = filteredLeads.filter(l => l.is_patient);
  const uncontactedCount = leads.filter(l => !l.is_patient && !l.is_contacted).length;

  const ITEMS_PER_PAGE = 7;
  const totalItems = activeTab === 'leads' ? filteredLeads.length : patientsList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedList = (activeTab === 'leads' ? filteredLeads : patientsList).slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const allTreatmentsArray = leads.map(l => l.treatment).filter(Boolean).join(',').split(',');
  const uniqueTreatments = ['Todos', ...new Set(allTreatmentsArray.map(t => t.trim()).filter(t => t && t !== 'Por definir'))];

  // Paginación del modal de notas
  let sortedNotes = [];
  let paginatedNotesModal = [];
  let totalNotesPages = 1;
  if (activeNotesLead) {
    sortedNotes = parseNotes(activeNotesLead.notes).sort((a, b) => new Date(b.date) - new Date(a.date));
    totalNotesPages = Math.ceil(sortedNotes.length / 4) || 1;
    paginatedNotesModal = sortedNotes.slice((notesPage - 1) * 4, notesPage * 4);
  }

  // INTERFAZ DE USUARIO PRINCIPAL
  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      
      <Sidebar currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {activeTab === 'leads' ? 'Gestión de Leads' : activeTab === 'patients' ? 'Historial de Pacientes' : 'Auditoría del Sistema'}
          </h1>
        </header>

        {activeTab !== 'audit' && (
          <>
            <MetricsCards loading={loading} totalLeads={leads.length} uncontactedCount={uncontactedCount} activePatients={leads.filter(l => l.is_patient).length} />
            <Filters searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterTreatment={filterTreatment} setFilterTreatment={setFilterTreatment} uniqueTreatments={uniqueTreatments} />
          </>
        )}

        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col">
          {loading && activeTab !== 'audit' ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Loader2 className="w-8 h-8 mb-4 animate-spin text-[#0056b3]" /><p>Cargando datos...</p></div>
          ) : (
            <div className="overflow-x-auto">
              
              {/* TABLA DE AUDITORÍA */}
              {activeTab === 'audit' ? (
                <div>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-slate-50"><h3 className="font-bold text-slate-700">Auditoría</h3><button onClick={fetchAuditLogs} className="text-xs text-slate-500 hover:underline">Actualizar</button></div>
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="bg-slate-800 text-white"><tr><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Paciente</th><th className="px-6 py-4">Acción</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">{auditLogs.map(log => (<tr key={log.id} className="hover:bg-slate-50"><td className="px-6 py-4 text-xs font-mono">{new Date(log.created_at).toLocaleString('es-VE')}</td><td className="px-6 py-4 font-semibold">@{log.user_name}</td><td className="px-6 py-4">{log.lead_name}</td><td className="px-6 py-4 text-xs">{log.action_details}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : (
                
                // TABLA DE LEADS / PACIENTES
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
                              <td className="px-6 py-4">
                                <div className="font-bold">{lead.name}</div>
                                <div className="text-xs font-mono text-slate-400">{lead.phone}</div>
                                {lead.username && <a href={`https://instagram.com/${lead.username}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-[#0056b3] hover:underline flex items-center gap-0.5 mt-0.5">@{lead.username}</a>}
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
                              <td className="px-6 py-4">
                                <div className="font-bold">{lead.name}</div>
                                <div className="text-xs text-slate-400">{lead.phone}</div>
                                {(lead.cedula || lead.edad) && (
                                  <div className="mt-1 flex gap-2 text-[10px] font-semibold text-slate-400">
                                    {lead.cedula && <span className="bg-slate-100 px-1.5 py-0.5 rounded">C.I: {lead.cedula}</span>}
                                    {lead.edad && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{lead.edad} años</span>}
                                  </div>
                                )}
                              </td>
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

          {/* CONTROLES DE PAGINACIÓN TABLAS */}
          {activeTab !== 'audit' && totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-100">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="text-sm font-bold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 px-3 py-2 rounded-lg transition"><ChevronLeft size={18} /></button>
              <span className="text-sm font-medium text-slate-500">Página {currentPage} de {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="text-sm font-bold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 px-3 py-2 rounded-lg transition"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      </main>

      {/* RENDERIZADO DE MODALES */}
      <PatientModal 
        isOpen={modalOpen} onClose={() => setModalOpen(false)} 
        medicalData={medicalData} setMedicalData={setMedicalData} 
        handleHeightChange={handleHeightChange} handleSavePatient={handleSavePatient} 
        leadName={leads.find(l => l.id === selectedLeadId)?.name} 
      />

      <EditLeadModal 
        isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} 
        editFormData={editFormData} setEditFormData={setEditFormData} handleSaveEdit={handleSaveEdit} 
      />

      <NotesModal 
        isOpen={notesModalOpen} onClose={() => setNotesModalOpen(false)} activeNotesLead={activeNotesLead} 
        paginatedNotesModal={paginatedNotesModal} totalNotesPages={totalNotesPages} notesPage={notesPage} 
        setNotesPage={setNotesPage} newNoteContent={newNoteContent} setNewNoteContent={setNewNoteContent} 
        handleSaveNewNote={handleSaveNewNote} 
      />

    </div>
  );
}