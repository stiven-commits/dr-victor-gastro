import React, { useState } from 'react';
import { Search, Plus, FileText, Printer, X, Check, FileStack } from 'lucide-react';
import logoDr from '../../assets/logo-dr-victor-horizontal-2.png'; // Logo dinámico

const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];
const CAFE_OPTIONS = ['No consume', '1 taza al día', '2 tazas al día', '3 tazas al día', '4 tazas al día', '5 tazas al día', '6 tazas al día', '7 tazas al día', '8+ tazas al día'];
const IPA_OPTIONS = ['No aplica', 'IPA 1', 'IPA 2', 'IPA 3', 'IPA 4', 'IPA 5', 'IPA > 5'];
const PLAN_OPTIONS = ['RECOMENDACIONES DIETÉTICAS', 'TRATAMIENTO AMBULATORIO', 'PERFIL 20 PT PTT', 'PERFIL HEPÁTICO', 'VALORACIÓN CIRUGÍA BARIÁTRICA', 'GASTROSCOPIA', 'VALORACIÓN CARDIOVASCULAR', 'EKG', 'RX DE TÓRAX PA'];

const DIAGNOSES_LIST = [
  { 
    category: "🧠 Obesidad y control metabólico", 
    items: [
      "Obesidad grado I", 
      "Obesidad grado II", 
      "Obesidad grado III (mórbida)", 
      "Sobrepeso con comorbilidades", 
      "Síndrome metabólico", 
      "Resistencia a la insulina", 
      "Prediabetes", 
      "Diabetes mellitus tipo 2", 
      "Dislipidemia (colesterol alto)", 
      "Esteatosis hepática (hígado graso)"
    ] 
  },
  { 
    category: "🍽️ Bariátrica y Balón Gástrico", 
    items: [
      "Obesidad refractaria a tratamiento médico", 
      "Reganancia de peso post cirugía bariátrica", 
      "Fallo de manga gástrica", 
      "Preparación para cirugía bariátrica", 
      "Obesidad con alto riesgo quirúrgico"
    ] 
  },
  { 
    category: "💉 Tratamientos Inyectables (GLP-1)", 
    items: [
      "Obesidad con indicación farmacológica", 
      "IMC > 30 con comorbilidades", 
      "Obesidad con resistencia a la insulina", 
      "Obesidad con hígado graso", 
      "Obesidad sarcopénica", 
      "Descontrol de apetito"
    ] 
  },
  { 
    category: "🩺 Digestivos y Gastroenterología", 
    items: [
      "Enfermedad por reflujo gastroesofágico (ERGE)", 
      "Gastritis crónica", 
      "Infección por Helicobacter pylori", 
      "Hernia hiatal", 
      "Dispepsia funcional", 
      "Estreñimiento crónico", 
      "Síndrome de intestino irritable (SII)", 
      "Sobrecrecimiento bacteriano (SIBO)", 
      "Úlcera gástrica / duodenal", 
      "Pólipos colónicos", 
      "Diverticulosis colónica", 
      "Colelitiasis (cálculos biliares)", 
      "Esófago de Barrett", 
      "Hemorroides / Enfermedad hemorroidal"
    ] 
  },
  { 
    category: "🩸 Deficiencias Nutricionales", 
    items: [
      "Síndrome anémico", 
      "Deficiencia de hierro", 
      "Déficit de vitamina B12", 
      "Deficiencia de vitamina D", 
      "Malabsorción post cirugía bariátrica"
    ] 
  },
  { 
    category: "🧾 Antecedentes Quirúrgicos", 
    items: [
      "Antecedente de manga gástrica", 
      "Bypass gástrico previo", 
      "Balón gástrico previo", 
      "Cirugía bariátrica fallida", 
      "Colecistectomía (vesícula) previa"
    ] 
  }
];

export default function ReportsView({ leads, updateLead }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('Todos');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeReportsList, setActiveReportsList] = useState([]);
  const [reportToPrint, setReportToPrint] = useState(null);

  // Selector de paciente para nuevo informe
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Selector de IDX
  const [idxSearch, setIdxSearch] = useState('');
  const [showIdxDropdown, setShowIdxDropdown] = useState(false);

  // Formulario
  const [reportForm, setReportForm] = useState({
    alergia: '', antecedentes: '', motivo: '', enfermedad: '',
    tabaquicos: '', ipa: 'No aplica', alcohol: '', cafe: 'No consume', usa: '', idx: [], plan: []
  });

  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { username: 'desconocido' };

  // Filtrar pacientes en la tabla principal
  const patientsOnly = leads.filter(l => l.is_patient);
  const filteredPatients = patientsOnly.filter(row => {
    const matchesSearch = !searchTerm || (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) || (row.cedula && row.cedula.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = filterState === 'Todos' || row.state === filterState;
    return matchesSearch && matchesState;
  });

  const parseReports = (reportsData) => {
    if (!reportsData) return [];
    if (typeof reportsData === 'string') {
      try { return JSON.parse(reportsData); } catch (e) { return []; }
    }
    return Array.isArray(reportsData) ? reportsData : [];
  };

  const handleOpenList = (patient) => {
    setSelectedPatient(patient);
    setActiveReportsList(parseReports(patient.medical_reports));
    setIsListOpen(true);
  };

  const handleSelectPatientForCreate = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(`${patient.name} (C.I: ${patient.cedula || 'N/A'})`);
    setShowPatientDropdown(false);
    
    const alergiasPrevias = patient.allergic === 'Si' ? patient.allergies_detail : 'Niega alergias';
    setReportForm({
      alergia: alergiasPrevias || 'Niega alergias',
      antecedentes: patient.medical_history || 'Sin antecedentes relevantes.',
      motivo: '', enfermedad: '', tabaquicos: 'Niega', ipa: 'No aplica', alcohol: 'Ocasional', cafe: '1 taza al día', usa: '', idx: [], plan: []
    });
  };

  const handlePlanToggle = (option) => {
    setReportForm(prev => ({ ...prev, plan: prev.plan.includes(option) ? prev.plan.filter(p => p !== option) : [...prev.plan, option] }));
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return alert("Debe seleccionar un paciente.");
    
    const newReport = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      author: currentUser.name || currentUser.username,
      ...reportForm
    };

    const currentReports = parseReports(selectedPatient.medical_reports);
    const updatedReports = [...currentReports, newReport];

    updateLead(selectedPatient.id, { 
      medical_reports: JSON.stringify(updatedReports),
      updated_by: currentUser.username
    });

    setIsCreateOpen(false);
    setSelectedPatient(null);
    setPatientSearch('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Buscar paciente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] outline-none" />
          </div>
        </div>
        <button onClick={() => { setIsCreateOpen(true); setSelectedPatient(null); setPatientSearch(''); setReportForm({alergia:'', antecedentes:'', motivo:'', enfermedad:'', tabaquicos:'', ipa:'No aplica', alcohol:'', cafe:'No consume', usa:'', idx:[], plan:[]}); }} className="flex items-center gap-2 bg-[#0056b3] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm w-full md:w-auto justify-center">
          <Plus className="w-5 h-5" /> Crear Informe Médico
        </button>
      </div>

      {/* TABLA DE PACIENTES */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Identidad</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map(patient => {
              const reportsCount = parseReports(patient.medical_reports).length;
              return (
                <tr key={patient.id} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-base">{patient.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700">C.I: {patient.cedula || 'N/A'}</div>
                    <div className="text-slate-500 text-xs mt-0.5">Edad: {patient.edad || '-'} años</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleOpenList(patient)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${reportsCount > 0 ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      <FileStack className="w-4 h-4" />
                      {reportsCount > 0 ? `Ver Informes (${reportsCount})` : 'Sin Informes'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL: LISTA DE INFORMES */}
      {isListOpen && selectedPatient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center bg-indigo-600 p-4 text-white">
              <div>
                <h3 className="font-bold">Historial de Informes Médicos</h3>
                <p className="text-xs text-indigo-200">{selectedPatient.name}</p>
              </div>
              <button onClick={() => setIsListOpen(false)} className="hover:text-red-200 transition"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 bg-slate-50">
              {activeReportsList.length === 0 ? (
                <div className="text-center text-slate-500 py-10 font-medium">Este paciente no tiene informes registrados.</div>
              ) : (
                activeReportsList.sort((a,b) => new Date(b.date) - new Date(a.date)).map(report => (
                  <div key={report.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">{report.motivo || 'Informe de Consulta'}</h4>
                      <div className="text-xs text-slate-500 mt-1">📅 {new Date(report.date).toLocaleDateString('es-VE')} - Dr(a). {report.author}</div>
                    </div>
                    <button onClick={() => { setReportToPrint({ patient: selectedPatient, data: report }); setIsListOpen(false); setIsPrintOpen(true); }} className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition">
                      <FileText className="w-4 h-4" /> Ver
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR INFORME */}
      {/* TRUCO VISUAL: Ponemos overflow-y-auto al fondo negro (inset-0) para que el modal no tenga limites internos y los dropdowns caigan libres */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col relative my-auto">
            <div className="flex justify-between items-center bg-[#0056b3] p-4 text-white rounded-t-2xl">
              <h3 className="font-bold flex items-center gap-2"><FileText className="w-5 h-5"/> Redactar Nuevo Informe</h3>
              <button onClick={() => setIsCreateOpen(false)} className="hover:text-red-200 transition"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveReport} className="p-6 space-y-6 bg-slate-50 rounded-b-2xl">
              
              {/* Buscador de Paciente */}
              <div className="relative bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-[#0056b3] mb-2">Seleccionar Paciente *</label>
                <input required type="text" value={patientSearch} onChange={(e) => { setPatientSearch(e.target.value); setShowPatientDropdown(true); if(e.target.value === '') setSelectedPatient(null); }} onFocus={() => setShowPatientDropdown(true)} onBlur={() => setTimeout(() => setShowPatientDropdown(false), 200)} placeholder="Escriba para buscar paciente..." className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] bg-slate-50" />
                
                {/* DROPDOWN DE PACIENTE (Ahora sale de la caja sin cortarse) */}
                {showPatientDropdown && (
                  <ul className="absolute z-[9999] w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-2xl divide-y divide-gray-100 left-0 top-full">
                    {filteredPatients.length > 0 ? filteredPatients.map(l => (
                      <li key={l.id} onMouseDown={(e) => { e.preventDefault(); handleSelectPatientForCreate(l); }} className="p-3 hover:bg-blue-50 cursor-pointer transition">
                        <div className="font-bold text-sm text-[#0056b3]">{l.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">CI: {l.cedula || 'N/A'}</div>
                      </li>
                    )) : <li className="p-3 text-sm text-slate-500 text-center">No encontrado.</li>}
                  </ul>
                )}
              </div>

              {selectedPatient && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motivo de Consulta *</label>
                      <textarea required value={reportForm.motivo} onChange={e => setReportForm({...reportForm, motivo: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enfermedad Actual *</label>
                      <textarea required value={reportForm.enfermedad} onChange={e => setReportForm({...reportForm, enfermedad: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Antecedentes Personales</label>
                      <textarea value={reportForm.antecedentes} onChange={e => setReportForm({...reportForm, antecedentes: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alergias</label>
                      <input type="text" value={reportForm.alergia} onChange={e => setReportForm({...reportForm, alergia: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-4 border-b pb-2">Hábitos Psicobiológicos</label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Tabáquicos</label><input type="text" value={reportForm.tabaquicos} onChange={e => setReportForm({...reportForm, tabaquicos: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Índice IPA</label><select value={reportForm.ipa} onChange={e => setReportForm({...reportForm, ipa: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">{IPA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                      <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Alcohol</label><input type="text" value={reportForm.alcohol} onChange={e => setReportForm({...reportForm, alcohol: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Café</label><select value={reportForm.cafe} onChange={e => setReportForm({...reportForm, cafe: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">{CAFE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Usa (Diagnósticos Previos)</label>
                      <textarea value={reportForm.usa} onChange={e => setReportForm({...reportForm, usa: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                    </div>

                    {/* SELECTOR AVANZADO DE IDX */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">IDX (Diagnósticos) *</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {reportForm.idx.map((diag, i) => (
                          <span key={i} className="bg-blue-100 text-[#0056b3] px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                            {diag}
                            <button type="button" onClick={() => setReportForm({...reportForm, idx: reportForm.idx.filter(d => d !== diag)})} className="hover:text-red-500 transition ml-1"><X className="w-3 h-3"/></button>
                          </span>
                        ))}
                      </div>
                      <input type="text" value={idxSearch} onChange={e => {setIdxSearch(e.target.value); setShowIdxDropdown(true);}} onFocus={() => setShowIdxDropdown(true)} onBlur={() => setTimeout(() => setShowIdxDropdown(false), 200)} className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Buscar diagnóstico..." />
                      
                      {/* DROPDOWN DE IDX (Sale de la caja gracias al relative/absolute global) */}
                      {showIdxDropdown && (
                        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto left-0 top-full">
                          {DIAGNOSES_LIST.map((group, gIndex) => {
                            const filteredItems = group.items.filter(item => item.toLowerCase().includes(idxSearch.toLowerCase()) && !reportForm.idx.includes(item));
                            if (filteredItems.length === 0) return null;
                            return (
                              <div key={gIndex}>
                                <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 sticky top-0 border-b border-slate-200">{group.category}</div>
                                {filteredItems.map((item, iIndex) => (
                                  <div key={iIndex} onMouseDown={(e) => { e.preventDefault(); setReportForm({...reportForm, idx: [...reportForm.idx, item]}); setIdxSearch(''); setShowIdxDropdown(false); }} className="px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0">{item}</div>
                                ))}
                              </div>
                            )
                          })}
                          {idxSearch.trim() !== '' && (
                            <div onMouseDown={(e) => { e.preventDefault(); setReportForm({...reportForm, idx: [...reportForm.idx, idxSearch.trim().toUpperCase()]}); setIdxSearch(''); setShowIdxDropdown(false); }} className="px-4 py-3 text-sm font-bold text-[#0056b3] hover:bg-blue-50 cursor-pointer flex items-center gap-2">
                              <Plus className="w-4 h-4"/> Añadir personalizado: "{idxSearch.trim().toUpperCase()}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Plan Médico (Selección Múltiple)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {PLAN_OPTIONS.map(plan => (
                        <label key={plan} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-bold ${reportForm.plan.includes(plan) ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                          <input type="checkbox" checked={reportForm.plan.includes(plan)} onChange={() => handlePlanToggle(plan)} className="hidden" />
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${reportForm.plan.includes(plan) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                            {reportForm.plan.includes(plan) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {plan}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-6 py-2.5 font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition">Cancelar</button>
                <button type="submit" disabled={!selectedPatient} className="px-8 py-2.5 bg-[#0056b3] text-white rounded-xl font-black hover:bg-blue-700 shadow-lg transition disabled:opacity-50">Guardar Informe</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISTA DE IMPRESIÓN MAESTRA */}
      {isPrintOpen && reportToPrint && (
        <div id="print-section" className="fixed inset-0 z-[100] bg-slate-500/50 backdrop-blur-sm overflow-y-auto print:overflow-visible print:bg-white print:relative print:block">
          
          <div className="fixed top-6 right-6 flex gap-4 print:hidden z-[999]">
            <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black shadow-2xl hover:bg-indigo-700 flex items-center gap-2"><Printer className="w-5 h-5"/> Imprimir</button>
            <button onClick={() => setIsPrintOpen(false)} className="bg-white text-slate-800 px-4 py-3 rounded-xl font-bold shadow-2xl hover:bg-slate-100"><X className="w-6 h-6"/></button>
          </div>

          {/* Ajuste de Padding para impresión: print:p-6 (aprovecha más el espacio) */}
          <div className="bg-white mx-auto my-12 print:my-0 print:mx-0 shadow-2xl print:shadow-none w-full max-w-[816px] print:max-w-none print:w-full min-h-[1056px] print:min-h-0 p-12 print:p-6 text-sm text-black font-sans leading-relaxed relative">
            
            {/* Cabecera con Logo */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <img src={logoDr} alt="Logo Dr. Víctor Manrique" className="mx-auto mb-4" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
              <h1 className="text-xl font-black tracking-widest">INFORME MÉDICO DE GASTROENTEROLOGÍA</h1>
            </div>

            <div className="grid grid-cols-2 gap-y-2 mb-8 font-semibold text-xs">
              <div>PACIENTE: <span className="font-normal uppercase ml-2">{reportToPrint.patient.name}</span></div>
              <div className="text-right">FECHA: <span className="font-normal ml-2">{new Date(reportToPrint.data.date).toLocaleDateString('es-VE')}</span></div>
              <div>EDAD: <span className="font-normal ml-2">{reportToPrint.patient.edad || '-'} AÑOS</span></div>
              <div className="text-right">TEL: <span className="font-normal ml-2">{reportToPrint.patient.phone}</span></div>
              <div>CI: <span className="font-normal ml-2">{reportToPrint.patient.cedula || '-'}</span></div>
            </div>

            <div className="space-y-6 text-[13px]">
              <div><span className="font-bold underline">MOTIVO DE CONSULTA:</span><p className="mt-1 uppercase text-justify">{reportToPrint.data.motivo}</p></div>
              <div><span className="font-bold underline">ENFERMEDAD ACTUAL:</span><p className="mt-1 text-justify uppercase">{reportToPrint.data.enfermedad}</p></div>
              
              <div>
                <span className="font-bold underline">ANTECEDENTES PERSONALES:</span>
                <p className="mt-1 uppercase text-justify">
                  {reportToPrint.data.antecedentes} | PESO: {reportToPrint.patient.initial_weight || '-'} KG | TALLA: {reportToPrint.patient.height || '-'} M | ALERGIA: {reportToPrint.data.alergia}
                </p>
              </div>

              <div>
                <span className="font-bold underline">HÁBITOS PSICOBIOLÓGICOS:</span>
                <p className="mt-1 uppercase">
                  TABÁQUICOS: {reportToPrint.data.tabaquicos} ({reportToPrint.data.ipa}) | ALCOHOL: {reportToPrint.data.alcohol} | CAFÉ: {reportToPrint.data.cafe}
                </p>
              </div>

              {(reportToPrint.data.usa || (reportToPrint.data.idx && reportToPrint.data.idx.length > 0)) && (
                <div>
                  {reportToPrint.data.usa && <p className="uppercase"><span className="font-bold underline">USA:</span> {reportToPrint.data.usa}</p>}
                  {reportToPrint.data.idx && reportToPrint.data.idx.length > 0 && (
                    <p className="uppercase mt-2 flex">
                      <span className="font-bold underline">IDX:</span> 
                      <span className="ml-2 font-bold">
                        {Array.isArray(reportToPrint.data.idx) 
                          ? reportToPrint.data.idx.map((dx, i) => `${i + 1}. ${dx}`).join('   ')
                          : reportToPrint.data.idx}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {reportToPrint.data.plan && reportToPrint.data.plan.length > 0 && (
                <div className="mt-6">
                  <span className="font-bold underline">PLAN:</span>
                  <ul className="mt-2 space-y-1">
                    {reportToPrint.data.plan.map((p, i) => <li key={i} className="uppercase ml-4">• {p}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* PIE DE PÁGINA (Footer Exacto) */}
            <div className="mt-16 pt-4 border-t border-black text-[11px] font-bold text-black flex justify-between items-start leading-tight">
              <div>
                <p className="text-sm font-black mb-1">DR. VICTOR MANRIQUE</p>
                <p>GASTROENTEROLOGÍA / ECOGRAFIA.</p>
                <p>ENDOSCOPIADIGESTIVA</p>
                <p>DIAGNOSTICA Y TERAPEUTICA</p>
                <p>ESPECIALISTA EN VIAS BILIARES Y OBESIDAD</p>
                <p className="mt-1">INSTAGRAM: @DRVICTORGASTRO</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black">TLF: 0424-326-3209</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MAGIA DE IMPRESIÓN AJUSTADA A TAMAÑO CARTA Y SIN SCROLL */}
      <style>{`
        @media print {
          @page { 
            size: letter; 
            margin: 5mm; 
          }
          html, body { 
            height: auto !important; 
            overflow: visible !important; 
            background: white !important; 
            margin: 0; 
            padding: 0; 
          }
          body * { 
            visibility: hidden; 
          }
          #print-section, #print-section * { 
            visibility: visible; 
          }
          #print-section { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            overflow: visible !important; 
          }
          #print-section .print\\:hidden, #print-section .print\\:hidden * { 
            display: none !important; 
          }
        }
      `}</style>
    </div>
  );
}