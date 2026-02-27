import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

// Importar Componentes Modulares
import Sidebar from './components/Sidebar';
import AgendaView from './components/AgendaView';
import FinancesView from './components/FinancesView';
import MetricsCards from './components/MetricsCards';
import Filters from './components/Filters';
import { PatientModal, EditLeadModal, NotesModal, AddManualModal, DeleteConfirmationModal, WeightModal } from './components/Modals';

// Importar Utilidades
import { MEDICAL_TREATMENTS, getTreatmentsArray, parseNotes, parseHistory } from './utils/helpers';
const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTreatment, setFilterTreatment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterState, setFilterState] = useState('Todos');
  
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('crmActiveTab');
    if (savedTab === 'agenda') return 'leads';
    return savedTab || 'leads';
  });

  // ESTOS SON LOS ESTADOS QUE FALTABAN:
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [dbTreatments, setDbTreatments] = useState([]); 
  const [finances, setFinances] = useState([]);

  // ... (aquí continúan los demás estados como currentPage, addModalOpen, etc.)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [medicalData, setMedicalData] = useState({ weight: '', height: '', cedula: '', edad: '', sexo: '', medical_history: '' });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    name: '', phone: '', email: '', treatments: [], cedula: '', edad: '', initial_weight: '', height: '', sexo: '', medical_history: '' 
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [activeWeightLead, setActiveWeightLead] = useState(null);
  const [newWeightValue, setNewWeightValue] = useState('');

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeNotesLead, setActiveNotesLead] = useState(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [notesPage, setNotesPage] = useState(1); 

  // Estado del Nuevo Registro Manual
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newManualData, setNewManualData] = useState({
    name: '', phone: '', email: '', treatments: [], cedula: '', edad: '', weight: '', height: '', sexo: '', medical_history: '', is_patient: true
  });

  // Autenticación
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { name: 'Usuario', role: 'user', username: 'desconocido' };

  // RUTAS API
  const API_KEY = 'Bearer v2ew5w8mAq3';
  const N8N_GET_URL = 'https://victorbot.sosmarketing.agency/webhook/api-leads';
  const N8N_POST_URL = 'https://victorbot.sosmarketing.agency/webhook/update-lead';
  const N8N_AUDIT_URL = 'https://victorbot.sosmarketing.agency/webhook/api-audit-logs'; 
  const N8N_CREATE_URL = 'https://victorbot.sosmarketing.agency/webhook/create-lead';
  const N8N_TREATMENTS_URL = 'https://victorbot.sosmarketing.agency/webhook/get-treatments'; // <-- NUEVA RUTA
  const N8N_FINANCES_URL = 'https://victorbot.sosmarketing.agency/webhook/api-finances';
  const N8N_ADD_FINANCE_URL = 'https://victorbot.sosmarketing.agency/webhook/api-add-finance-treatment';
  const N8N_DEL_FINANCE_URL = 'https://victorbot.sosmarketing.agency/webhook/api-delete-finance-treatment';

  // Efectos (Carga de datos)
  useEffect(() => { 
    fetchLeads(); 
    fetchTreatments(); // <-- LLAMAMOS A LA NUEVA FUNCIÓN AL INICIAR
    fetchFinances();
  }, []);
  useEffect(() => {
    localStorage.setItem('crmActiveTab', activeTab);
  }, [activeTab]);
  useEffect(() => { if (activeTab === 'audit') fetchAuditLogs(); }, [activeTab]);
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm, filterTreatment, filterStatus, filterState]); 
// Efecto para actualizar el título de la pestaña del navegador
  useEffect(() => {
    let title = 'CRM Dr. Víctor';
    if (activeTab === 'leads') title = 'CRM Dr. Víctor - Leads';
    if (activeTab === 'patients') title = 'CRM Dr. Víctor - Pacientes';
    if (activeTab === 'agenda') title = 'CRM Dr. Víctor - Agenda';
    if (activeTab === 'finances') title = 'CRM Dr. Víctor - Finanzas';
    if (activeTab === 'audit') title = 'CRM Dr. Víctor - Auditoría';
    
    document.title = title;
  }, [activeTab]);
  const fetchLeads = async () => {
    try {
      const response = await fetch(`${N8N_GET_URL}?t=${new Date().getTime()}`, {
        method: 'GET', headers: { 'Authorization': API_KEY }
      });
      const data = await response.json();
      setLeads(Array.isArray(data) ? data : data[0] || [data] || []);
      setLoading(false);
    } catch (error) { setLeads([]); setLoading(false); }
  };

  const fetchTreatments = async () => {
    try {
      const response = await fetch(N8N_TREATMENTS_URL, {
        method: 'GET', 
        headers: { 'Authorization': API_KEY, 'Accept': 'application/json' }
      });
      
      const data = await response.json();
      
      // Normalización garantizada
      let finalData = [];
      if (Array.isArray(data)) {
        finalData = Array.isArray(data[0]) ? data[0] : data;
      } else if (data && typeof data === 'object') {
        finalData = data.data || data.rows || (data.id ? [data] : []);
      }
      
      setDbTreatments(finalData);
    } catch (error) { 
      console.error("Error de red cargando tratamientos:", error);
      setDbTreatments([]); 
    }
  };

  const fetchFinances = async () => {
    try {
      const response = await fetch(`${N8N_FINANCES_URL}?t=${new Date().getTime()}`, {
        headers: { 'Authorization': API_KEY, 'Accept': 'application/json' }
      });
      const data = await response.json();
      let rawFinances = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : (data.data || []);
      setFinances(rawFinances);
      return rawFinances;
    } catch (error) { console.error(error); return []; }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const response = await fetch(`${N8N_AUDIT_URL}?t=${new Date().getTime()}`, {
        method: 'GET', headers: { 'Authorization': API_KEY }
      });
      const data = await response.json();
      setAuditLogs(Array.isArray(data) ? data : data[0] || []);
    } catch (error) { setAuditLogs([]); }
    setLoadingAudit(false);
  };

  const updateLead = async (id, updatedFields) => {
    const currentLead = leads.find(l => l.id === id);
    if (!currentLead) return;
    
    const payload = { 
      ...currentLead, ...updatedFields, 
      cedula: updatedFields.cedula !== undefined ? updatedFields.cedula : currentLead.cedula,
      edad: updatedFields.edad !== undefined ? updatedFields.edad : currentLead.edad,
      updated_by: currentUser.username 
    };
    
    setLeads(leads.map(lead => lead.id === id ? payload : lead));
    try {
      await fetch(N8N_POST_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY }, 
        body: JSON.stringify(payload) 
      });
    } catch (error) { console.error(error); }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    const w = parseFloat(newManualData.weight);
    const h = parseFloat(newManualData.height);
    let bmiValue = (w > 0 && h > 0) ? (w / (h * h)).toFixed(2) : null;

    const payload = {
      name: newManualData.name,
      phone: newManualData.phone,
      email: newManualData.email || null,
      treatment: newManualData.treatments.join(', ') || 'Por definir',
      is_patient: newManualData.is_patient,
      cedula: newManualData.cedula || null,
      edad: newManualData.edad ? parseInt(newManualData.edad) : null,
      initial_weight: newManualData.is_patient ? (w || null) : null,
      height: newManualData.is_patient ? (h || null) : null,
      bmi: newManualData.is_patient ? bmiValue : null,
      sexo: newManualData.is_patient ? (newManualData.sexo || null) : null,
      medical_history: newManualData.is_patient ? (newManualData.medical_history || null) : null,
      state: newManualData.is_patient ? (newManualData.state || null) : null,
      address: newManualData.is_patient ? (newManualData.address || null) : null,
      smokes: newManualData.is_patient ? (newManualData.smokes || null) : null,
      asthmatic: newManualData.is_patient ? (newManualData.asthmatic || null) : null,
      allergic: newManualData.is_patient ? (newManualData.allergic || null) : null,
      allergies_detail: newManualData.is_patient ? (newManualData.allergies_detail || null) : null,
      updated_by: currentUser.username
    };

    const fakeId = Date.now();
    setLeads([{ ...payload, id: fakeId, created_at: new Date().toISOString(), is_contacted: true }, ...leads]);
    setAddModalOpen(false);
    setNewManualData({name: '', phone: '', email: '', treatments: [], cedula: '', edad: '', weight: '', height: '', sexo: '', medical_history: '', is_patient: true});

    try {
      await fetch(N8N_CREATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify(payload)
      });
      fetchLeads(); 
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
      updateLead(lead.id, { is_patient: false, initial_weight: null, height: null, bmi: null, final_weight: null, cedula: null, edad: null, sexo: null, medical_history: null });
    } else { 
      setSelectedLeadId(lead.id); 
      setMedicalData({ weight: '', height: '', cedula: lead.cedula || '', edad: lead.edad || '', sexo: lead.sexo || '', medical_history: lead.medical_history || '' }); 
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
      cedula: medicalData.cedula || null, edad: medicalData.edad ? parseInt(medicalData.edad) : null,
      sexo: medicalData.sexo || null, medical_history: medicalData.medical_history || null,
      state: medicalData.state || null,
      address: medicalData.address || null,
      smokes: medicalData.smokes || null,
      asthmatic: medicalData.asthmatic || null,
      allergic: medicalData.allergic || null,
      allergies_detail: medicalData.allergies_detail || null
    });
    setModalOpen(false);
  };

  const handleRowDoubleClick = async (lead) => {
    const latestFinances = await fetchFinances();
    setLeadToEdit(lead);
    const patientFinances = latestFinances.filter(f => String(f.patient_id) === String(lead.id));
    const mergedTreatments = patientFinances.map(f => f.treatment_name);
    setEditFormData({ 
      name: lead.name || '', 
      phone: lead.phone || '', 
      email: lead.email || '',
      treatments: mergedTreatments,
      cedula: lead.cedula || '',
      edad: lead.edad || '',
      initial_weight: lead.initial_weight || '',
      height: lead.height || '',
      sexo: lead.sexo || '',
      medical_history: lead.medical_history || '',
      address: lead.address || '',
      state: lead.state || '',
      smokes: lead.smokes || '',
      asthmatic: lead.asthmatic || '',
      allergic: lead.allergic || '',
      allergies_detail: lead.allergies_detail || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const treatmentString = editFormData.treatments.join(', ') || 'Por definir';
    
    const w = parseFloat(editFormData.initial_weight);
    const h = parseFloat(editFormData.height);
    let bmiValue = (w > 0 && h > 0) ? (w / (h * h)).toFixed(2) : null;

    let oldT = getTreatmentsArray(leadToEdit.treatment);
    let newT = [...editFormData.treatments];
    let addedTreatments = [];
    
    newT.forEach(t => {
      const idx = oldT.indexOf(t);
      if (idx !== -1) {
        oldT.splice(idx, 1); // Encontrado, se quita de oldT
      } else {
        addedTreatments.push(t); // Es nuevo
      }
    });
    let removedTreatments = oldT; // Lo que sobró fue eliminado
    
    // Enviar a borrar los eliminados
    removedTreatments.forEach(async (treatmentName) => {
      await fetch(N8N_DEL_FINANCE_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify({ lead_id: leadToEdit.id.toString(), treatment_name: treatmentName })
      }).catch(console.error);
    });
    // Enviar a crear los nuevos
    addedTreatments.forEach(async (treatmentName) => {
      const dbT = dbTreatments.find(d => d.name === treatmentName);
      if (dbT) {
        const price = parseFloat(dbT.price || 0);
        await fetch(N8N_ADD_FINANCE_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
          body: JSON.stringify({ lead_id: leadToEdit.id.toString(), treatment_id: dbT.id, treatment_name: dbT.name, base_price: price, discount: 0, agreed_price: price })
        }).catch(console.error);
      }
    });

    if (leadToEdit.is_patient) {
      updateLead(leadToEdit.id, { 
        name: editFormData.name, phone: editFormData.phone, treatment: treatmentString,
        email: editFormData.email || null,
        cedula: editFormData.cedula || null, edad: editFormData.edad ? parseInt(editFormData.edad) : null,
        initial_weight: w || null, height: h || null, bmi: bmiValue,
        sexo: editFormData.sexo || null, medical_history: editFormData.medical_history || null,
        state: editFormData.state || null,
        address: editFormData.address || null,
        smokes: editFormData.smokes || null,
        asthmatic: editFormData.asthmatic || null,
        allergic: editFormData.allergic || null,
        allergies_detail: editFormData.allergies_detail || null
      });
      setEditModalOpen(false);
    } else {
      updateLead(leadToEdit.id, { 
        name: editFormData.name, phone: editFormData.phone, treatment: treatmentString,
        email: editFormData.email || null,
        cedula: editFormData.cedula || null, edad: editFormData.edad ? parseInt(editFormData.edad) : null,
        state: editFormData.state || null
      });
      setEditModalOpen(false);
      
      if (editFormData.treatments.some(t => MEDICAL_TREATMENTS.includes(t))) {
        setSelectedLeadId(leadToEdit.id); 
        setMedicalData({ weight: '', height: '', cedula: editFormData.cedula || '', edad: editFormData.edad || '', sexo: '', medical_history: '' });
        setTimeout(() => setModalOpen(true), 300); 
      }
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToEdit) return;
    const payload = { id: leadToEdit.id, name: leadToEdit.name, updated_by: currentUser.username };

    // Actualización optimista: lo quitamos de la pantalla al instante
    setLeads(leads.filter(l => l.id !== leadToEdit.id));
    setDeleteModalOpen(false);
    setEditModalOpen(false);

    try {
      await fetch(N8N_DELETE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify(payload)
      });
      fetchAuditLogs();
    } catch (error) { console.error(error); }
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

  const handleSaveNewWeight = (e) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeightValue);
    if (!weightNum || weightNum <= 0) return;

    const currentHistory = parseHistory(activeWeightLead.weight_history);
    const newEntry = { id: Date.now().toString(), date: new Date().toISOString(), weight: weightNum, author: currentUser.name };
    const updatedHistoryString = JSON.stringify([...currentHistory, newEntry]);

    updateLead(activeWeightLead.id, { weight_history: updatedHistoryString, final_weight: weightNum });
    setActiveWeightLead({ ...activeWeightLead, weight_history: updatedHistoryString, final_weight: weightNum });
    setNewWeightValue('');
  };

  // Lógica de Filtrado
  const filteredLeads = leads.filter((lead) => {
    const matchesTreatment = filterTreatment === 'Todos' || !lead.treatment || lead.treatment.includes(filterTreatment);
    const matchesStatus =
      (filterStatus === '' || filterStatus === 'Todos') ||
      (filterStatus === 'Por Contactar' && !lead.is_contacted && !lead.is_patient) ||
      (filterStatus === 'Contactados' && !!lead.is_contacted) ||
      (filterStatus === 'Solo Leads' && !lead.is_patient) ||
      (filterStatus === 'Solo Pacientes' && !!lead.is_patient);

    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !term ||
      lead.name?.toLowerCase().includes(term) ||
      lead.phone?.toLowerCase().includes(term) ||
      lead.username?.toLowerCase().includes(term) ||
      lead.treatment?.toLowerCase().includes(term) ||
      lead.cedula?.toLowerCase().includes(term);

    const matchesState = filterState === 'Todos' || lead.state === filterState;
    return matchesSearch && matchesStatus && matchesTreatment && matchesState;
  });

  const patientsList = filteredLeads.filter(l => l.is_patient);
  const prospectsCount = leads.filter(l => !l.is_patient).length;

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

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      <Sidebar currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* min-w-0 es la clave para evitar que las tablas desborden el ancho del móvil */}
      <main className="flex-1 min-w-0 p-4 md:p-8">
        <header className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            {/* Botón Hamburguesa solo visible en móvil */}
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg transition">
              <Menu size={24} />
            </button>
            <h1 className="text-xl md:text-3xl font-bold text-slate-800 truncate">
              {activeTab === 'leads' ? 'Gestión de Leads' : activeTab === 'patients' ? 'Historial de Pacientes' : activeTab === 'agenda' ? 'Agenda Médica' : activeTab === 'finances' ? 'Finanzas / Pagos' : 'Auditoría'}
            </h1>
          </div>
          {activeTab !== 'audit' && activeTab !== 'agenda' && (
            <button onClick={() => setAddModalOpen(true)} className="bg-[#0056b3] text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-1 md:gap-2 shadow-sm text-sm md:text-base whitespace-nowrap">
              <Plus size={20} className="hidden md:block" /><Plus size={16} className="md:hidden" /> 
              <span className="hidden md:inline">Añadir Registro</span><span className="md:hidden">Añadir</span>
            </button>
          )}
        </header>

        {(activeTab === 'leads' || activeTab === 'patients') && (
          <>
            <MetricsCards loading={loading} totalLeads={leads.length} prospectsCount={prospectsCount} activePatients={leads.filter(l => l.is_patient).length} />
            <Filters searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterTreatment={filterTreatment} setFilterTreatment={setFilterTreatment} dbTreatments={dbTreatments} filterState={filterState} setFilterState={setFilterState} />
          </>
        )}

        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col">
          {loading && activeTab !== 'audit' ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Loader2 className="w-8 h-8 mb-4 animate-spin text-[#0056b3]" /><p>Cargando datos...</p></div>
          ) : (
            <div className="overflow-x-auto">
              
              {activeTab === 'finances' ? (
                <FinancesView />
              ) : activeTab === 'audit' ? (
                <div>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-slate-50"><h3 className="font-bold text-slate-700">Auditoría</h3><button onClick={fetchAuditLogs} className="text-xs text-slate-500 hover:underline">Actualizar</button></div>
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="bg-slate-800 text-white"><tr><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Paciente</th><th className="px-6 py-4">Acción</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">{auditLogs.map(log => (<tr key={log.id} className="hover:bg-slate-50"><td className="px-6 py-4 text-xs font-mono">{new Date(log.created_at).toLocaleString('es-VE')}</td><td className="px-6 py-4 font-semibold">@{log.user_name}</td><td className="px-6 py-4">{log.lead_name}</td><td className="px-6 py-4 text-xs">{log.action_details}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : activeTab === 'agenda' ? (
                <AgendaView API_KEY={API_KEY} leads={leads} />
              ) : activeTab === 'leads' ? (
                <div className="flex flex-col">
                  <p className="px-6 py-2 text-xs text-slate-400 bg-slate-50 border-b border-gray-100">💡 Doble clic para editar.</p>
                                    <table className="w-full text-sm text-left min-w-[320px] md:min-w-[1000px]">
                    <thead className="bg-gray-50 text-slate-800">
                      <tr>
                        <th className="px-6 py-4 font-semibold hidden md:table-cell">Fecha</th>
                        <th className="px-4 md:px-6 py-4 font-semibold">Datos Contacto</th>
                        <th className="px-6 py-4 font-semibold hidden md:table-cell">Tratamientos</th>
                        <th className="px-6 py-4 font-semibold hidden md:table-cell">Estatus</th>
                        <th className="px-6 py-4 font-semibold text-center hidden md:table-cell">Notas</th>
                        <th className="px-4 py-4 font-semibold text-right md:hidden">Detalles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedList.map((lead) => (
                        <Fragment key={lead.id}>
                          <tr onDoubleClick={() => handleRowDoubleClick(lead)} className="transition hover:bg-slate-50 cursor-pointer">
                            <td className="px-6 py-4 align-top hidden md:table-cell">
                              <div className="text-xs font-bold text-slate-700">
                                {new Date(lead.created_at).toLocaleDateString('es-VE', { timeZone: 'America/Caracas', day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </div>
                              <div className="text-[10px] font-mono text-slate-500 mt-0.5 bg-slate-100 border border-slate-200 inline-block px-1.5 py-0.5 rounded shadow-sm">
                                {new Date(lead.created_at).toLocaleTimeString('es-VE', { timeZone: 'America/Caracas', hour: '2-digit', minute: '2-digit', hour12: true })}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 align-top">
                              <div className="font-bold text-slate-800">{lead.name}</div>
                              <div className="text-xs font-mono text-slate-500 mt-0.5">{lead.phone}</div>
                              {lead.username && lead.username !== 'Registro Manual' && <a href={`https://instagram.com/${lead.username}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-[#0056b3] hover:underline flex items-center gap-0.5 mt-1">@{lead.username}</a>}
                              {lead.username === 'Registro Manual' && <span className="text-xs text-slate-400 flex items-center gap-0.5 mt-1">📝 Registro Manual</span>}
                            </td>
                            <td className="px-6 py-4 align-top hidden md:table-cell">
                              <div className="flex flex-wrap gap-1">{getTreatmentsArray(lead.treatment).map(t => <span key={t} className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">{t}</span>)}</div>
                            </td>
                            <td className="px-6 py-4 align-top hidden md:table-cell">
                              <div className="flex flex-col gap-1">
                                <button onClick={(e) => handlePatientClick(e, lead)} className={`px-3 py-1.5 text-[11px] font-bold rounded border transition-colors ${lead.is_patient ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{lead.is_patient ? '⭐ Paciente' : 'Marcar Paciente'}</button>
                              </div>
                            </td>
                            <td className="px-6 py-4 align-top text-center hidden md:table-cell">
                              <button onClick={(e) => { e.stopPropagation(); setActiveNotesLead(lead); setNotesPage(1); setNotesModalOpen(true); }} className="text-xs bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors font-semibold">Notas ({parseNotes(lead.notes).length})</button>
                            </td>
                            {/* Botón Detalles Móvil */}
                            <td className="px-4 py-4 align-middle text-right md:hidden">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setExpandedRowId(expandedRowId === lead.id ? null : lead.id); }}
                                className={`text-[11px] font-bold px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${expandedRowId === lead.id ? 'bg-slate-200 text-slate-700' : 'bg-[#0056b3] text-white shadow-sm'}`}
                              >
                                {expandedRowId === lead.id ? 'Cerrar' : 'Detalles'}
                              </button>
                            </td>
                          </tr>
                          
                          {/* Fila expandible para Móviles (Leads) */}
                          {expandedRowId === lead.id && (
                            <tr className="md:hidden bg-slate-50/80 border-b border-gray-200">
                              <td colSpan="2" className="px-4 py-4 shadow-inner">
                                <div className="flex flex-col gap-4">
                                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingreso</span>
                                    <span className="text-[11px] font-mono text-slate-600 font-bold">
                                      {new Date(lead.created_at).toLocaleDateString('es-VE', { timeZone: 'America/Caracas', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tratamientos</span>
                                    <div className="flex flex-wrap gap-1">
                                      {getTreatmentsArray(lead.treatment).map(t => <span key={t} className="px-2 py-1 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">{t}</span>)}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={(e) => handlePatientClick(e, lead)} className={`w-full px-3 py-2.5 text-[11px] font-bold rounded border transition-colors ${lead.is_patient ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-slate-500 border-slate-200 shadow-sm'}`}>{lead.is_patient ? '⭐ Paciente' : 'Marcar como Paciente Clínico'}</button>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); setActiveNotesLead(lead); setNotesPage(1); setNotesModalOpen(true); }} className="w-full text-xs bg-white text-blue-700 px-4 py-2.5 rounded-lg border border-blue-200 shadow-sm font-bold mt-1">
                                    Abrir Notas ({parseNotes(lead.notes).length})
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col">
                  <p className="px-6 py-2 text-xs text-slate-400 bg-purple-50 border-b border-purple-100">💡 Doble clic para editar datos o tratamientos.</p>
                                    <table className="w-full text-sm text-left min-w-[320px] md:min-w-[1100px]">
                    <thead className="bg-purple-50 text-purple-900">
                      <tr>
                        <th className="px-4 md:px-6 py-4 font-semibold">Paciente</th>
                        <th className="px-6 py-4 font-semibold border-l border-purple-100 hidden md:table-cell">Identidad</th>
                        <th className="px-6 py-4 font-semibold border-l border-purple-100 hidden md:table-cell">Tratamientos</th>
                        <th className="px-6 py-4 font-semibold border-l border-purple-100 hidden md:table-cell">Medidas Base</th>
                        <th className="px-6 py-4 font-semibold border-l border-purple-100 hidden md:table-cell">Evolución</th>
                        <th className="px-6 py-4 font-semibold text-center border-l border-purple-100 hidden md:table-cell">Historial</th>
                        <th className="px-6 py-4 font-semibold text-center border-l border-purple-100 hidden md:table-cell">Notas</th>
                        <th className="px-4 py-4 font-semibold text-right md:hidden">Expediente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedList.map((lead) => (
                        <Fragment key={lead.id}>
                          <tr onDoubleClick={() => handleRowDoubleClick(lead)} className="transition hover:bg-purple-50/40 cursor-pointer group">
                            <td className="px-4 md:px-6 py-4 align-top">
                              <div className="font-bold text-slate-800">{lead.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{lead.phone}</div>
                              {lead.username && lead.username !== 'Registro Manual' && <a href={`https://instagram.com/${lead.username}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[11px] text-purple-600 hover:underline mt-1 block font-medium">@{lead.username}</a>}
                              {lead.username === 'Registro Manual' && <span className="text-[11px] text-slate-400 mt-1 block font-medium">📝 Registro Manual</span>}
                              <div className="text-[9px] text-slate-400 mt-2 font-mono flex flex-col hidden md:flex">
                                <span className="uppercase tracking-wider font-semibold text-[8px] text-slate-300">Ingresó</span>
                                {new Date(lead.created_at).toLocaleString('es-VE', { timeZone: 'America/Caracas', day: '2-digit', month: '2-digit', year: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4 align-top border-l border-purple-50 hidden md:table-cell">
                              <div className="text-xs text-slate-600"><span className="text-slate-400 font-mono text-[10px]">CI:</span> {lead.cedula || 'N/A'}</div>
                              <div className="text-xs text-slate-600 mt-1"><span className="text-slate-400 font-mono text-[10px]">Edad:</span> {lead.edad ? `${lead.edad} años` : 'N/A'}</div>
                              <div className="text-xs text-slate-600 mt-1"><span className="text-slate-400 font-mono text-[10px]">Sexo:</span> {lead.sexo || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 align-top border-l border-purple-50 hidden md:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {getTreatmentsArray(lead.treatment).map(t => <span key={t} className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700">{t}</span>)}
                              </div>
                            </td>
                            <td className="px-6 py-4 align-top border-l border-purple-50 hidden md:table-cell">
                              <div className="text-sm font-bold text-slate-800">{lead.initial_weight ? `${lead.initial_weight} kg` : '-'}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{lead.height ? `${lead.height} m` : '-'}</div>
                              {lead.bmi && <div className="text-[11px] font-bold text-purple-600 mt-1.5 bg-purple-50 inline-block px-1.5 py-0.5 rounded">IMC: {lead.bmi}</div>}
                            </td>
                            <td className="px-6 py-4 align-top border-l border-purple-50 hidden md:table-cell">
                              <div className="text-sm font-bold text-green-600">{lead.final_weight ? `${lead.final_weight} kg` : (lead.initial_weight ? `${lead.initial_weight} kg` : '-')}</div>
                              {lead.initial_weight && lead.final_weight && lead.initial_weight - lead.final_weight > 0 && (
                                <div className="text-[11px] font-bold text-green-600 mt-1 flex items-center gap-1 bg-green-50 inline-block px-1.5 py-0.5 rounded">
                                  ↓ {(lead.initial_weight - lead.final_weight).toFixed(1)} kg
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 align-top text-center border-l border-purple-50 hidden md:table-cell">
                              <button onClick={(e) => { e.stopPropagation(); setActiveWeightLead(lead); setWeightModalOpen(true); }} className="text-xs bg-white text-purple-700 px-4 py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors font-semibold shadow-sm">
                                Historial ({parseHistory(lead.weight_history).length})
                              </button>
                            </td>
                            {/* NUEVA COLUMNA DE NOTAS */}
                            <td className="px-6 py-4 align-top text-center border-l border-purple-50 hidden md:table-cell">
                              <button onClick={(e) => { e.stopPropagation(); setActiveNotesLead(lead); setNotesPage(1); setNotesModalOpen(true); }} className="text-xs bg-white text-purple-700 px-4 py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors font-semibold shadow-sm">
                                Notas ({parseNotes(lead.notes).length})
                              </button>
                            </td>
                            {/* Botón Detalles Móvil */}
                            <td className="px-4 py-4 align-middle text-right md:hidden">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setExpandedRowId(expandedRowId === lead.id ? null : lead.id); }}
                                className={`text-[11px] font-bold px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${expandedRowId === lead.id ? 'bg-purple-200 text-purple-800' : 'bg-purple-600 text-white shadow-sm'}`}
                              >
                                {expandedRowId === lead.id ? 'Ocultar' : 'Ver Detalles'}
                              </button>
                            </td>
                          </tr>

                          {/* Fila expandible para Móviles (Pacientes) */}
                          {expandedRowId === lead.id && (
                            <tr className="md:hidden bg-purple-50/60 border-b border-purple-100">
                              <td colSpan="2" className="px-4 py-5 shadow-inner">
                                <div className="flex flex-col gap-4">
                                  {/* Info Identidad */}
                                  <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-purple-100 shadow-sm text-center">
                                    <div><span className="block text-[9px] text-slate-400 uppercase font-bold">CI</span><span className="text-xs font-mono font-bold text-slate-700">{lead.cedula || 'N/A'}</span></div>
                                    <div className="border-x border-gray-100"><span className="block text-[9px] text-slate-400 uppercase font-bold">Edad</span><span className="text-xs font-mono font-bold text-slate-700">{lead.edad ? `${lead.edad}a` : 'N/A'}</span></div>
                                    <div><span className="block text-[9px] text-slate-400 uppercase font-bold">Sexo</span><span className="text-xs font-mono font-bold text-slate-700">{lead.sexo || 'N/A'}</span></div>
                                  </div>

                                  {/* Tratamientos */}
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tratamientos Médicos</span>
                                    <div className="flex flex-wrap gap-1">
                                      {getTreatmentsArray(lead.treatment).map(t => <span key={t} className="px-2 py-1 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800">{t}</span>)}
                                    </div>
                                  </div>

                                  {/* Medidas y Evolución en cuadrícula */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm relative overflow-hidden">
                                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Base</span>
                                      <div className="text-sm font-bold text-slate-800">{lead.initial_weight ? `${lead.initial_weight} kg` : '-'}</div>
                                      <div className="text-[11px] text-slate-500 mt-0.5">{lead.height ? `${lead.height} m` : '-'}</div>
                                      {lead.bmi && <div className="text-[11px] font-bold text-purple-600 mt-1">IMC: {lead.bmi}</div>}
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Actual</span>
                                      <div className="text-sm font-bold text-green-700">{lead.final_weight ? `${lead.final_weight} kg` : (lead.initial_weight ? `${lead.initial_weight} kg` : '-')}</div>
                                      {lead.initial_weight && lead.final_weight && lead.initial_weight - lead.final_weight > 0 && (
                                        <div className="text-[11px] font-bold text-green-600 mt-1.5 flex items-center gap-1 bg-green-50 w-max px-1.5 py-0.5 rounded">
                                          ↓ {(lead.initial_weight - lead.final_weight).toFixed(1)} kg
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Botón Historial de Peso */}
                                  <button onClick={(e) => { e.stopPropagation(); setActiveWeightLead(lead); setWeightModalOpen(true); }} className="w-full mt-1 text-xs bg-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-700 shadow-sm flex justify-center items-center">
                                    Abrir Historial de Peso ({parseHistory(lead.weight_history).length})
                                  </button>
                                  
                                  {/* NUEVO Botón Notas Móvil */}
                                  <button onClick={(e) => { e.stopPropagation(); setActiveNotesLead(lead); setNotesPage(1); setNotesModalOpen(true); }} className="w-full mt-1 text-xs bg-white text-purple-700 px-4 py-3 rounded-xl border border-purple-200 shadow-sm font-bold flex justify-center items-center">
                                    Abrir Notas ({parseNotes(lead.notes).length})
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab !== 'audit' && totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-100">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="text-sm font-bold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-1"><ChevronLeft size={18}/> Anterior</button>
              <span className="text-sm font-medium text-slate-500">Página {currentPage} de {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="text-sm font-bold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-1">Siguiente <ChevronRight size={18}/></button>
            </div>
          )}
        </div>
      </main>

      <PatientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} medicalData={medicalData} setMedicalData={setMedicalData} handleHeightChange={handleHeightChange} handleSavePatient={handleSavePatient} leadName={leads.find(l => l.id === selectedLeadId)?.name} />
      <EditLeadModal 
        isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} 
        editFormData={editFormData} setEditFormData={setEditFormData} 
        handleSaveEdit={handleSaveEdit} leadToEdit={leadToEdit} setDeleteModalOpen={setDeleteModalOpen} dbTreatments={dbTreatments} finances={finances}
      />
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={handleDeleteLead} 
        leadName={leadToEdit?.name} 
      />
      <NotesModal isOpen={notesModalOpen} onClose={() => setNotesModalOpen(false)} activeNotesLead={activeNotesLead} paginatedNotesModal={paginatedNotesModal} totalNotesPages={totalNotesPages} notesPage={notesPage} setNotesPage={setNotesPage} newNoteContent={newNoteContent} setNewNoteContent={setNewNoteContent} handleSaveNewNote={handleSaveNewNote} />
      <AddManualModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} newManualData={newManualData} setNewManualData={setNewManualData} handleCreateManual={handleCreateManual} dbTreatments={dbTreatments} />
      <WeightModal 
        isOpen={weightModalOpen} onClose={() => setWeightModalOpen(false)} 
        activeWeightLead={activeWeightLead} newWeightValue={newWeightValue} 
        setNewWeightValue={setNewWeightValue} handleSaveNewWeight={handleSaveNewWeight} 
        parseHistory={parseHistory}
      />
    </div>
  );
}

