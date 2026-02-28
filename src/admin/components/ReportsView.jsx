import React, { useState } from 'react';
import { Search, Plus, FileText, Printer, X, Check, FileStack, Pill, Activity } from 'lucide-react';
import logoDr from '../../assets/logo-dr-victor-horizontal-2.png'; 

const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];
const CAFE_OPTIONS = ['No consume', '1 taza al día', '2 tazas al día', '3 tazas al día', '4 tazas al día', '5 tazas al día', '6 tazas al día', '7 tazas al día', '8+ tazas al día'];
const IPA_OPTIONS = ['No aplica', 'IPA 1', 'IPA 2', 'IPA 3', 'IPA 4', 'IPA 5', 'IPA > 5'];
const PLAN_OPTIONS = ['RECOMENDACIONES DIETÉTICAS', 'TRATAMIENTO AMBULATORIO', 'PERFIL 20 PT PTT', 'PERFIL HEPÁTICO', 'VALORACIÓN CIRUGÍA BARIÁTRICA', 'GASTROSCOPIA', 'VALORACIÓN CARDIOVASCULAR', 'EKG', 'RX DE TÓRAX PA'];

const DIAGNOSES_LIST = [
  { category: "🧠 Obesidad y metabolismo", items: ["Obesidad grado I", "Obesidad grado II", "Obesidad grado III", "Obesidad mórbida", "Síndrome metabólico", "Resistencia a la insulina", "Prediabetes", "Diabetes tipo 2", "Reganancia de peso post bariátrica", "Candidato a balón gástrico", "Fallo de manga gástrica"] },
  { category: "🍽️ Gastroenterología general", items: ["Enfermedad por reflujo gastroesofágico (ERGE)", "Gastritis crónica", "Hernia hiatal", "Dispepsia funcional", "Síndrome de intestino irritable", "Estreñimiento crónico", "Diarrea crónica"] },
  { category: "🔬 Endoscopia digestiva", items: ["Esofagitis", "Gastritis erosiva", "Úlcera gástrica o duodenal", "Pólipos gástricos", "Barrett esofágico", "Helicobacter pylori positivo", "Sangrado digestivo alto"] },
  { category: "🧬 Hepatobiliar", items: ["Esteatosis hepática", "Esteatohepatitis (NASH)", "Cirrosis hepática", "Hepatopatía alcohólica", "Colestasis", "Pancreatitis"] },
  { category: "💊 Nutrición / post bariátrica", items: ["Síndrome anémico", "Deficiencia de hierro", "Déficit de B12", "Malabsorción post cirugía bariátrica"] },
  { category: "🪡 Procedimientos bariátricos endoscópicos", items: ["Candidato a balón gástrico", "Seguimiento post balón intragástrico", "Complicación de balón gástrico", "Evaluación pre bariátrica"] }
];

const ULTRASOUND_LIST = [
  { category: "🧠 Hígado", items: ["Esteatosis hepática grado I", "Esteatosis hepática grado II", "Esteatosis hepática grado III", "Hepatomegalia", "Cirrosis hepática", "Hígado heterogéneo", "Lesión focal hepática", "Quiste hepático", "Tumor hepático", "Absceso hepático", "Ascitis"] },
  { category: "🟢 Vesícula biliar", items: ["Colelitiasis (cálculos biliares)", "Colecistitis", "Vesícula escleroatrófica", "Pólipos vesiculares", "Barro biliar"] },
  { category: "🟡 Vías biliares", items: ["Dilatación de vías biliares", "Coledocolitiasis", "Colangitis (sospecha por imagen)", "Obstrucción biliar"] },
  { category: "🟠 Páncreas", items: ["Esteatosis pancreática", "Pancreatitis", "Quiste pancreático", "Masa pancreática", "Páncreas hiperecogénico"] },
  { category: "🔵 Bazo", items: ["Esplenomegalia", "Lesión esplénica"] },
  { category: "💧 Hallazgos generales en eco abdominal", items: ["Líquido libre abdominal", "Adenopatías abdominales", "Aneurisma aórtico abdominal", "Quistes abdominales"] }
];

const GASTRO_VADEMECUM = [
  "Omeprazol 20mg", "Omeprazol 40mg", "Esomeprazol 40mg", "Pantoprazol 40mg", "Lansoprazol 30mg", "Dexlansoprazol 60mg", "Sucralfato 1g (Suspensión)", "Sucralfato 200mg", "Magaldrato / Simeticona",
  "Domperidona 10mg", "Metoclopramida 10mg", "Levosulpirida 25mg", "Itoprida 50mg", "Cinitaprida 1mg", "Trimebutina 200mg", "Otilonio Bromuro 40mg", "Butilescopolamina 10mg", "Mebeverina 200mg",
  "Loperamida 2mg", "Racecadotrilo 100mg", "Saccharomyces boulardii (Floratil)", "Bacillus clausii (Enterogermina)", "Lactulosa (Jarabe)", "Polietilenglicol (PEG 3350)", "Bisacodilo 5mg", "Picosulfato de sodio",
  "Amoxicilina 500mg", "Amoxicilina 1g", "Claritromicina 500mg", "Levofloxacina 500mg", "Metronidazol 500mg", "Rifaximina 200mg", "Rifaximina 400mg (Normix)", "Ciprofloxacina 500mg",
  "Ácido Ursodesoxicólico 250mg", "Ácido Ursodesoxicólico 500mg", "Silimarina",
  "Semaglutida (Ozempic)", "Liraglutida (Saxenda)", "Semaglutida oral (Rybelsus)", "Orlistat", "Metformina 500mg", "Metformina 850mg",
  "Hierro Polimaltosado", "Hierro Sucrosomial (EV)", "Vitamina B12 (Cianocobalamina)", "Vitamina D3 100.000 UI", "Ácido Fólico 5mg", "Citrato de Calcio", "Multivitamínico Bariátrico",
  "Ketorolaco 10mg", "Ibuprofeno 400mg", "Acetaminofén (Paracetamol) 500mg", "Ondansetrón 8mg"
];

const COMMON_EXAMS = [
  "Endoscopia Digestiva Superior", "Colonoscopia", "Ecoendoscopia", "Ecografía Abdominal Superior", "Ecografía Pélvica",
  "Perfil 20", "Perfil Hepático", "Perfil Lipídico", "Tiempos de Coagulación (PT, PTT)", "Hematología Completa",
  "Sangre Oculta en Heces", "Examen de Heces (Coproanálisis)", "Coprocultivo", "Calprotectina Fecal", "Test de Aliento para Helicobacter pylori",
  "Antígeno en Heces para H. pylori", "Amilasa y Lipasa sérica", "Insulina Basal y Glicemia", "HOMA-IR"
];

export default function ReportsView({ leads, updateLead }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('Todos');

  // Modals & Navigation
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('informes');
  const [isPrintOpen, setIsPrintOpen] = useState(false); 
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reportToPrint, setReportToPrint] = useState(null);
  const [recipeToPrint, setRecipeToPrint] = useState(null);

  const [reportForm, setReportForm] = useState({
    alergia: '', antecedentes: '', motivo: '', enfermedad: '',
    tabaquicos: '', ipa: 'No aplica', alcohol: '', cafe: 'No consume', usa: [], idx: [], plan: []
  });

  // NUEVO: recipeForm ahora tiene exams[]
  const [recipeForm, setRecipeForm] = useState({ indicaciones: '', medications: [], exams: [] });

  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const [idxSearch, setIdxSearch] = useState('');
  const [showIdxDropdown, setShowIdxDropdown] = useState(false);

  const [usaSearch, setUsaSearch] = useState('');
  const [showUsaDropdown, setShowUsaDropdown] = useState(false);
  
  const [medSearch, setMedSearch] = useState('');
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [currentMed, setCurrentMed] = useState({ name: '', dosage: '', frequency: '', duration: '' });

  // NUEVO: Buscador de Exámenes
  const [examSearch, setExamSearch] = useState('');
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { username: 'desconocido' };

  const patientsOnly = leads.filter(l => l.is_patient);
  const filteredPatients = patientsOnly.filter(row => {
    const matchesSearch = !searchTerm || (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) || (row.cedula && row.cedula.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = filterState === 'Todos' || row.state === filterState;
    return matchesSearch && matchesState;
  });

  const parseJSON = (data) => {
    if (!data) return [];
    if (typeof data === 'string') { try { return JSON.parse(data); } catch (e) { return []; } }
    return Array.isArray(data) ? data : [];
  };

  const handleOpenCenter = (patient) => {
    setSelectedPatient(patient);
    const alergiasPrevias = patient.allergic === 'Si' ? patient.allergies_detail : 'Niega alergias';
    setReportForm({
      alergia: alergiasPrevias || 'Niega alergias', antecedentes: patient.medical_history || 'Sin antecedentes relevantes.',
      motivo: '', enfermedad: '', tabaquicos: 'Niega', ipa: 'No aplica', alcohol: 'Ocasional', cafe: '1 taza al día', usa: [], idx: [], plan: []
    });
    setRecipeForm({ indicaciones: '', medications: [], exams: [] });
    setCurrentMed({ name: '', dosage: '', frequency: '', duration: '' });
    setExamSearch('');
    setIsCenterOpen(true);
    setActiveTab('informes');
  };

  const handlePlanToggle = (option) => {
    setReportForm(prev => ({ ...prev, plan: prev.plan.includes(option) ? prev.plan.filter(p => p !== option) : [...prev.plan, option] }));
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    const newReport = { id: Date.now().toString(), date: new Date().toISOString(), author: currentUser.name || currentUser.username, ...reportForm };
    const currentReports = parseJSON(selectedPatient.medical_reports);
    updateLead(selectedPatient.id, { medical_reports: JSON.stringify([...currentReports, newReport]), updated_by: currentUser.username });
    setSelectedPatient(prev => ({ ...prev, medical_reports: JSON.stringify([...currentReports, newReport]) }));
    alert("Informe guardado con éxito");
    setReportForm(prev => ({ ...prev, motivo: '', enfermedad: '', usa: [], idx: [], plan: [] }));
  };

  const handleAddMedication = () => {
    if (!currentMed.name) return;
    setRecipeForm(prev => ({ ...prev, medications: [...prev.medications, { ...currentMed, id: Date.now() }] }));
    setCurrentMed({ name: '', dosage: '', frequency: '', duration: '' });
    setMedSearch('');
  };

  const handleRemoveMedication = (id) => {
    setRecipeForm(prev => ({ ...prev, medications: prev.medications.filter(m => m.id !== id) }));
  };

  // NUEVO: Agregar y Eliminar Exámenes
  const handleAddExam = () => {
    if (!examSearch.trim()) return;
    setRecipeForm(prev => ({ ...prev, exams: [...(prev.exams || []), { id: Date.now(), name: examSearch.trim() }] }));
    setExamSearch('');
  };
  
  const handleRemoveExam = (id) => {
    setRecipeForm(prev => ({ ...prev, exams: (prev.exams || []).filter(e => e.id !== id) }));
  };

  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    if (recipeForm.medications.length === 0 && (!recipeForm.exams || recipeForm.exams.length === 0)) {
      return alert("Debe añadir al menos un medicamento o un examen.");
    }
    const newRecipe = { id: Date.now().toString(), date: new Date().toISOString(), author: currentUser.name || currentUser.username, ...recipeForm };
    const currentRecipes = parseJSON(selectedPatient.medical_recipes);
    updateLead(selectedPatient.id, { medical_recipes: JSON.stringify([...currentRecipes, newRecipe]), updated_by: currentUser.username });
    setSelectedPatient(prev => ({ ...prev, medical_recipes: JSON.stringify([...currentRecipes, newRecipe]) }));
    alert("Récipe guardado con éxito");
    setRecipeForm({ indicaciones: '', medications: [], exams: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Buscar paciente para Documentos Clínicos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] outline-none font-medium" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Identidad</th>
              <th className="px-6 py-4 text-center">Documentos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map(patient => {
              const repCount = parseJSON(patient.medical_reports).length;
              const recCount = parseJSON(patient.medical_recipes).length;
              const totalDocs = repCount + recCount;
              return (
                <tr key={patient.id} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4"><div className="font-bold text-slate-800 text-base">{patient.name}</div><div className="text-slate-500 text-xs mt-0.5">{patient.phone}</div></td>
                  <td className="px-6 py-4"><div className="text-slate-700">C.I: {patient.cedula || 'N/A'}</div><div className="text-slate-500 text-xs mt-0.5">Edad: {patient.edad || '-'} años</div></td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleOpenCenter(patient)} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm ${totalDocs > 0 ? 'bg-[#0056b3] text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      <FileStack className="w-4 h-4" /> {totalDocs > 0 ? `Ver Expediente (${totalDocs})` : 'Abrir Expediente'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isCenterOpen && selectedPatient && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col relative my-auto min-h-[80vh]">
            <div className="flex justify-between items-center bg-[#0056b3] p-5 text-white rounded-t-2xl">
              <div><h3 className="font-black text-lg">Expediente Clínico</h3><p className="text-blue-100 text-sm">{selectedPatient.name} - CI: {selectedPatient.cedula}</p></div>
              <button onClick={() => setIsCenterOpen(false)} className="hover:bg-blue-700 p-2 rounded-lg transition"><X size={24}/></button>
            </div>
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button onClick={() => setActiveTab('informes')} className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'informes' ? 'bg-white text-[#0056b3] border-b-2 border-[#0056b3]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><FileText className="w-5 h-5"/> Informes Médicos ({parseJSON(selectedPatient.medical_reports).length})</button>
              <button onClick={() => setActiveTab('recipes')} className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'recipes' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Pill className="w-5 h-5"/> Récipes y Recetas ({parseJSON(selectedPatient.medical_recipes).length})</button>
            </div>

            <div className="p-6 flex-1 bg-white">
              
              {/* --- PESTAÑA INFORMES --- */}
              {activeTab === 'informes' && (
                <div className="space-y-8">
                  {parseJSON(selectedPatient.medical_reports).length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase">Historial de Informes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {parseJSON(selectedPatient.medical_reports).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(rep => (
                          <div key={rep.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                            <div><p className="font-bold text-[#0056b3] text-sm">{rep.motivo || 'Informe'}</p><p className="text-xs text-slate-500">{new Date(rep.date).toLocaleDateString('es-VE')} - Dr. {rep.author}</p></div>
                            <button onClick={() => { setReportToPrint({ patient: selectedPatient, data: rep }); setIsPrintOpen('informe'); }} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition"><Printer size={16}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveReport} className="space-y-5 border-t border-slate-100 pt-6">
                    <h4 className="font-black text-slate-800 flex items-center gap-2"><Plus className="text-[#0056b3]"/> Redactar Nuevo Informe</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motivo de Consulta *</label>
                        <textarea required value={reportForm.motivo} onChange={e => setReportForm({...reportForm, motivo: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3] resize-none"></textarea>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enfermedad Actual *</label>
                        <textarea required value={reportForm.enfermedad} onChange={e => setReportForm({...reportForm, enfermedad: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3] resize-none"></textarea>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Antecedentes Personales</label>
                        <textarea value={reportForm.antecedentes} onChange={e => setReportForm({...reportForm, antecedentes: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3] resize-none"></textarea>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alergias</label>
                        <input type="text" value={reportForm.alergia} onChange={e => setReportForm({...reportForm, alergia: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-4 border-b pb-2">Hábitos Psicobiológicos</label>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Tabáquicos</label><input type="text" value={reportForm.tabaquicos} onChange={e => setReportForm({...reportForm, tabaquicos: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
                        <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Índice IPA</label><select value={reportForm.ipa} onChange={e => setReportForm({...reportForm, ipa: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0056b3] bg-white">{IPA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                        <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Alcohol</label><input type="text" value={reportForm.alcohol} onChange={e => setReportForm({...reportForm, alcohol: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
                        <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Café</label><select value={reportForm.cafe} onChange={e => setReportForm({...reportForm, cafe: e.target.value})} className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0056b3] bg-white">{CAFE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">USA (Hallazgos Ecográficos)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(reportForm.usa || []).map((diag, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                              {diag} <button type="button" onClick={() => setReportForm({...reportForm, usa: reportForm.usa.filter(d => d !== diag)})} className="hover:text-red-500 ml-1"><X className="w-3 h-3"/></button>
                            </span>
                          ))}
                        </div>
                        <input type="text" value={usaSearch} onChange={e => {setUsaSearch(e.target.value); setShowUsaDropdown(true);}} onFocus={() => setShowUsaDropdown(true)} onBlur={() => setTimeout(() => setShowUsaDropdown(false), 200)} className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Buscar hallazgo..." />
                        {showUsaDropdown && (
                          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto left-0 top-full">
                            {ULTRASOUND_LIST.map((group, gIndex) => {
                              const filteredItems = group.items.filter(item => item.toLowerCase().includes(usaSearch.toLowerCase()) && !(reportForm.usa || []).includes(item));
                              if (filteredItems.length === 0) return null;
                              return (
                                <div key={gIndex}>
                                  <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 sticky top-0">{group.category}</div>
                                  {filteredItems.map((item, iIndex) => (
                                    <div key={iIndex} onMouseDown={(e) => { e.preventDefault(); setReportForm({...reportForm, usa: [...(reportForm.usa || []), item]}); setUsaSearch(''); setShowUsaDropdown(false); }} className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer">{item}</div>
                                  ))}
                                </div>
                              )
                            })}
                            {usaSearch.trim() !== '' && (
                              <div onMouseDown={(e) => { e.preventDefault(); setReportForm({...reportForm, usa: [...(reportForm.usa || []), usaSearch.trim().toUpperCase()]}); setUsaSearch(''); setShowUsaDropdown(false); }} className="px-4 py-3 text-sm font-bold text-[#0056b3] hover:bg-blue-50 cursor-pointer flex items-center gap-2"><Plus className="w-4 h-4"/> Añadir personalizado</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">IDX (Diagnósticos) *</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {reportForm.idx.map((diag, i) => (
                            <span key={i} className="bg-blue-100 text-[#0056b3] px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                              {diag} <button type="button" onClick={() => setReportForm({...reportForm, idx: reportForm.idx.filter(d => d !== diag)})} className="hover:text-red-500 ml-1"><X className="w-3 h-3"/></button>
                            </span>
                          ))}
                        </div>
                        <input type="text" value={idxSearch} onChange={e => {setIdxSearch(e.target.value); setShowIdxDropdown(true);}} onFocus={() => setShowIdxDropdown(true)} onBlur={() => setTimeout(() => setShowIdxDropdown(false), 200)} className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Buscar diagnóstico..." />
                        {showIdxDropdown && (
                          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto left-0 top-full">
                            {DIAGNOSES_LIST.map((group, gIndex) => {
                              const filteredItems = group.items.filter(item => item.toLowerCase().includes(idxSearch.toLowerCase()) && !reportForm.idx.includes(item));
                              if (filteredItems.length === 0) return null;
                              return (
                                <div key={gIndex}>
                                  <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 sticky top-0">{group.category}</div>
                                  {filteredItems.map((item, iIndex) => (
                                    <div key={iIndex} onMouseDown={(e) => { e.preventDefault(); setReportForm({...reportForm, idx: [...reportForm.idx, item]}); setIdxSearch(''); setShowIdxDropdown(false); }} className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer">{item}</div>
                                  ))}
                                </div>
                              )
                            })}
                            {idxSearch.trim() !== '' && (
                              <div onMouseDown={(e) => { e.preventDefault(); setReportForm({...reportForm, idx: [...reportForm.idx, idxSearch.trim().toUpperCase()]}); setIdxSearch(''); setShowIdxDropdown(false); }} className="px-4 py-3 text-sm font-bold text-[#0056b3] hover:bg-blue-50 cursor-pointer flex items-center gap-2"><Plus className="w-4 h-4"/> Añadir personalizado</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Plan Médico (Selección Múltiple)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {PLAN_OPTIONS.map(plan => (
                          <label key={plan} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-bold ${reportForm.plan.includes(plan) ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                            <input type="checkbox" checked={reportForm.plan.includes(plan)} onChange={() => handlePlanToggle(plan)} className="hidden" />
                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${reportForm.plan.includes(plan) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                              {reportForm.plan.includes(plan) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {plan}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="text-right"><button type="submit" className="px-8 py-3 bg-[#0056b3] text-white rounded-xl font-black hover:bg-blue-700 shadow-lg transition">Guardar Informe</button></div>
                  </form>
                </div>
              )}

              {/* --- PESTAÑA RÉCIPES Y ÓRDENES MÉDICAS --- */}
              {activeTab === 'recipes' && (
                <div className="space-y-8">
                  {parseJSON(selectedPatient.medical_recipes).length > 0 && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <h4 className="font-bold text-emerald-800 mb-3 text-sm uppercase">Historial de Récipes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {parseJSON(selectedPatient.medical_recipes).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(rec => {
                          const medCount = rec.medications ? rec.medications.length : 0;
                          const exCount = rec.exams ? rec.exams.length : 0;
                          return (
                            <div key={rec.id} className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm flex justify-between items-center">
                              <div><p className="font-bold text-emerald-700 text-sm">{medCount} Meds | {exCount} Exámenes</p><p className="text-xs text-slate-500">{new Date(rec.date).toLocaleDateString('es-VE')} - Dr. {rec.author}</p></div>
                              <button onClick={() => { setRecipeToPrint({ patient: selectedPatient, data: rec }); setIsPrintOpen('recipe'); }} className="p-2 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-600 hover:text-white transition"><Printer size={16}/></button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveRecipe} className="space-y-6 border-t border-slate-100 pt-6">
                    <h4 className="font-black text-emerald-700 flex items-center gap-2"><Pill className="text-emerald-600"/> Crear Nuevo Récipe u Orden</h4>
                    
                    {/* SECCIÓN 1: MEDICAMENTOS */}
                    <div className="bg-white p-5 rounded-xl border-2 border-emerald-100 shadow-sm relative">
                      <h5 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><Pill className="w-4 h-4"/> 1. Recetar Medicamentos</h5>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4 relative">
                          <label className="block text-xs font-bold text-slate-600 mb-1">Medicamento (Vademécum)</label>
                          <input type="text" value={medSearch} onChange={e => {setMedSearch(e.target.value); setCurrentMed({...currentMed, name: e.target.value}); setShowMedDropdown(true);}} onFocus={() => setShowMedDropdown(true)} onBlur={() => setTimeout(() => setShowMedDropdown(false), 200)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: Omeprazol 20mg" />
                          
                          {showMedDropdown && (
                            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-xl max-h-48 overflow-y-auto left-0 top-full">
                              {GASTRO_VADEMECUM.filter(m => m.toLowerCase().includes(medSearch.toLowerCase())).map((m, i) => (
                                <div key={i} onMouseDown={(e) => { e.preventDefault(); setCurrentMed({...currentMed, name: m}); setMedSearch(m); setShowMedDropdown(false); }} className="px-4 py-2 text-sm hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0">{m}</div>
                              ))}
                              {medSearch.trim() !== '' && !GASTRO_VADEMECUM.some(m => m.toLowerCase() === medSearch.toLowerCase()) && (
                                <div onMouseDown={(e) => { e.preventDefault(); setCurrentMed({...currentMed, name: medSearch.trim()}); setShowMedDropdown(false); }} className="px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer flex items-center gap-2"><Plus className="w-4 h-4"/> Añadir nuevo: "{medSearch.trim()}"</div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-600 mb-1">Dosis</label><input type="text" value={currentMed.dosage} onChange={e => setCurrentMed({...currentMed, dosage: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: 1 tab" /></div>
                        <div className="md:col-span-3"><label className="block text-xs font-bold text-slate-600 mb-1">Frecuencia</label><input type="text" value={currentMed.frequency} onChange={e => setCurrentMed({...currentMed, frequency: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: Cada 12h" /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-600 mb-1">Duración</label><input type="text" value={currentMed.duration} onChange={e => setCurrentMed({...currentMed, duration: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: Por 7 días" /></div>
                        <div className="md:col-span-1"><button type="button" onClick={handleAddMedication} className="w-full p-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex justify-center"><Plus className="w-5 h-5"/></button></div>
                      </div>

                      {recipeForm.medications.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {recipeForm.medications.map((med, index) => (
                            <div key={med.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-sm">
                              <div><span className="font-bold text-emerald-700 text-sm">{index + 1}. {med.name}</span><span className="text-slate-600 text-xs ml-2">- {med.dosage} | {med.frequency} | {med.duration}</span></div>
                              <button type="button" onClick={() => handleRemoveMedication(med.id)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN 2: ÓRDENES MÉDICAS / EXÁMENES */}
                    <div className="bg-white p-5 rounded-xl border-2 border-indigo-100 shadow-sm relative">
                      <h5 className="font-bold text-indigo-800 mb-3 flex items-center gap-2"><Activity className="w-4 h-4"/> 2. Ordenar Exámenes o Tratamientos</h5>
                      <div className="flex gap-3 items-end">
                        <div className="relative flex-1">
                          <label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Examen / Procedimiento</label>
                          <input type="text" value={examSearch} onChange={e => {setExamSearch(e.target.value); setShowExamDropdown(true);}} onFocus={() => setShowExamDropdown(true)} onBlur={() => setTimeout(() => setShowExamDropdown(false), 200)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: Perfil 20, Endoscopia..." />
                          
                          {showExamDropdown && (
                            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-xl max-h-48 overflow-y-auto left-0 top-full">
                              {COMMON_EXAMS.filter(m => m.toLowerCase().includes(examSearch.toLowerCase())).map((m, i) => (
                                <div key={i} onMouseDown={(e) => { e.preventDefault(); setExamSearch(m); setShowExamDropdown(false); }} className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0">{m}</div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={handleAddExam} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2"><Plus className="w-5 h-5"/> Agregar</button>
                      </div>

                      {(recipeForm.exams || []).length > 0 && (
                        <div className="mt-4 space-y-2">
                          {(recipeForm.exams || []).map((ex, index) => (
                            <div key={ex.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-sm">
                              <span className="font-bold text-indigo-700 text-sm">{index + 1}. {ex.name}</span>
                              <button type="button" onClick={() => handleRemoveExam(ex.id)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN 3: INDICACIONES GENERALES */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">3. Indicaciones Generales (Opcional)</label>
                      <textarea value={recipeForm.indicaciones} onChange={e => setRecipeForm({...recipeForm, indicaciones: e.target.value})} rows="3" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" placeholder="Dieta blanda, reposo, venir en ayunas..."></textarea>
                    </div>

                    <div className="text-right"><button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 shadow-lg transition">Guardar Récipe y Órdenes</button></div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISTA DE IMPRESIÓN INTELIGENTE */}
      {isPrintOpen && (reportToPrint || recipeToPrint) && (
        <div id="print-section" className={`fixed inset-0 z-[100] bg-slate-500/50 backdrop-blur-sm overflow-y-auto print:overflow-visible print:bg-white print:relative print:block ${isPrintOpen === 'recipe' ? 'recipe-print-mode' : 'report-print-mode'}`}>
          
          <div className="fixed top-6 right-6 flex gap-4 print:hidden z-[999]">
            <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black shadow-2xl hover:bg-indigo-700 flex items-center gap-2"><Printer className="w-5 h-5"/> Imprimir</button>
            <button onClick={() => {setIsPrintOpen(false); setReportToPrint(null); setRecipeToPrint(null);}} className="bg-white text-slate-800 px-4 py-3 rounded-xl font-bold shadow-2xl hover:bg-slate-100"><X className="w-6 h-6"/></button>
          </div>

          <div className={`bg-white mx-auto my-12 print:my-0 print:mx-0 shadow-2xl print:shadow-none w-full print:w-full print:p-4 text-black font-sans leading-relaxed relative flex flex-col justify-between ${isPrintOpen === 'recipe' ? 'max-w-[800px] min-h-[500px] p-8 text-sm' : 'max-w-[816px] min-h-[1056px] p-12 text-sm'}`}>
            
            <div className="flex-1">
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <img src={logoDr} alt="Logo Dr. Víctor Manrique" className="mx-auto mb-4" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
                <h1 className="text-xl font-black tracking-widest">{isPrintOpen === 'informe' ? 'INFORME MÉDICO DE GASTROENTEROLOGÍA' : 'RÉCIPE / ÓRDENES MÉDICAS'}</h1>
              </div>

              <div className="grid grid-cols-2 gap-y-2 mb-8 font-semibold text-xs border-b border-gray-200 pb-4">
                <div>PACIENTE: <span className="font-normal uppercase ml-2">{(reportToPrint?.patient || recipeToPrint?.patient).name}</span></div>
                <div className="text-right">FECHA: <span className="font-normal ml-2">{new Date((reportToPrint?.data || recipeToPrint?.data).date).toLocaleDateString('es-VE')}</span></div>
                <div>EDAD: <span className="font-normal ml-2">{(reportToPrint?.patient || recipeToPrint?.patient).edad || '-'} AÑOS</span></div>
                <div className="text-right">TEL: <span className="font-normal ml-2">{(reportToPrint?.patient || recipeToPrint?.patient).phone}</span></div>
                <div>CI: <span className="font-normal ml-2">{(reportToPrint?.patient || recipeToPrint?.patient).cedula || '-'}</span></div>
              </div>

              {/* CUERPO DEL INFORME */}
              {isPrintOpen === 'informe' && reportToPrint && (
                <div className="space-y-6 text-[13px]">
                  <div><span className="font-bold underline">MOTIVO DE CONSULTA:</span><p className="mt-1 uppercase text-justify">{reportToPrint.data.motivo}</p></div>
                  <div><span className="font-bold underline">ENFERMEDAD ACTUAL:</span><p className="mt-1 text-justify uppercase">{reportToPrint.data.enfermedad}</p></div>
                  <div><span className="font-bold underline">ANTECEDENTES PERSONALES:</span><p className="mt-1 uppercase text-justify">{reportToPrint.data.antecedentes} | PESO: {reportToPrint.patient.initial_weight || '-'} KG | TALLA: {reportToPrint.patient.height || '-'} M | ALERGIA: {reportToPrint.data.alergia}</p></div>
                  <div><span className="font-bold underline">HÁBITOS PSICOBIOLÓGICOS:</span><p className="mt-1 uppercase">TABÁQUICOS: {reportToPrint.data.tabaquicos} ({reportToPrint.data.ipa}) | ALCOHOL: {reportToPrint.data.alcohol} | CAFÉ: {reportToPrint.data.cafe}</p></div>
                  
                  {((reportToPrint.data.usa && reportToPrint.data.usa.length > 0) || (reportToPrint.data.idx && reportToPrint.data.idx.length > 0)) && (
                    <div>
                      {reportToPrint.data.usa && reportToPrint.data.usa.length > 0 && <p className="uppercase flex mt-2"><span className="font-bold underline">USA:</span><span className="ml-2 font-bold">{Array.isArray(reportToPrint.data.usa) ? reportToPrint.data.usa.map((dx, i) => `${i + 1}. ${dx}`).join('   ') : reportToPrint.data.usa}</span></p>}
                      {reportToPrint.data.idx && reportToPrint.data.idx.length > 0 && <p className="uppercase flex mt-2"><span className="font-bold underline">IDX:</span><span className="ml-2 font-bold">{Array.isArray(reportToPrint.data.idx) ? reportToPrint.data.idx.map((dx, i) => `${i + 1}. ${dx}`).join('   ') : reportToPrint.data.idx}</span></p>}
                    </div>
                  )}
                  {reportToPrint.data.plan && reportToPrint.data.plan.length > 0 && <div className="mt-6"><span className="font-bold underline">PLAN:</span><ul className="mt-2 space-y-1">{reportToPrint.data.plan.map((p, i) => <li key={i} className="uppercase ml-4">• {p}</li>)}</ul></div>}
                </div>
              )}

              {/* CUERPO DEL RÉCIPE / ÓRDENES */}
              {isPrintOpen === 'recipe' && recipeToPrint && (
                <div className="space-y-6 text-[14px]">
                  
                  {/* Bloque 1: Medicamentos */}
                  {recipeToPrint.data.medications && recipeToPrint.data.medications.length > 0 && (
                    <div>
                      <div className="font-bold text-xl mb-3 border-b border-gray-200 pb-1 italic text-[#0056b3]">Rx.</div>
                      <div className="space-y-4">
                        {recipeToPrint.data.medications.map((med, i) => (
                          <div key={i} className="pl-2">
                            <div className="font-black text-base uppercase flex items-center gap-2">
                              <span className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{i + 1}</span> {med.name}
                            </div>
                            <div className="mt-1 ml-7 flex flex-wrap gap-x-6 gap-y-1 text-slate-800">
                              <span><strong className="text-slate-600">Dosis:</strong> {med.dosage}</span>
                              <span><strong className="text-slate-600">Frec:</strong> {med.frequency}</span>
                              <span><strong className="text-slate-600">Duración:</strong> {med.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bloque 2: Exámenes */}
                  {recipeToPrint.data.exams && recipeToPrint.data.exams.length > 0 && (
                    <div className="pt-2">
                      <div className="font-bold text-base mb-3 border-b border-gray-200 pb-1 uppercase">Órdenes / Exámenes Solicitados:</div>
                      <div className="space-y-2">
                        {recipeToPrint.data.exams.map((ex, i) => (
                          <div key={i} className="pl-2 font-black text-base uppercase flex items-center gap-2">
                            <span className="border-2 border-black rounded-full w-5 h-5 flex items-center justify-center text-xs">{i + 1}</span> {ex.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bloque 3: Indicaciones */}
                  {recipeToPrint.data.indicaciones && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <span className="font-bold uppercase text-xs text-slate-500">Indicaciones:</span>
                      <p className="mt-1 text-justify whitespace-pre-wrap font-medium">{recipeToPrint.data.indicaciones}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PIE DE PÁGINA */}
            <div className="mt-8 pt-4 border-t border-black text-[11px] font-bold text-black flex justify-between items-start leading-tight">
              <div>
                <p className="text-sm font-black mb-1">DR. VICTOR MANRIQUE</p>
                <p>GASTROENTEROLOGÍA / ECOGRAFIA.</p>
                <p>ENDOSCOPIA DIGESTIVA</p>
                <p>DIAGNÓSTICA Y TERAPÉUTICA</p>
                <p>ESPECIALISTA EN VÍAS BILIARES Y OBESIDAD</p>
                <p className="mt-1">INSTAGRAM: @DRVICTORGASTRO</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black">TLF: 0424-326-3209</p>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @media print {
          html, body { height: auto !important; overflow: visible !important; background: white !important; margin: 0; padding: 0; }
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; overflow: visible !important; }
          #print-section .print\\:hidden, #print-section .print\\:hidden * { display: none !important; }

          .report-print-mode { page: letter-page; }
          @page letter-page { size: letter portrait; margin: 5mm; }

          .recipe-print-mode { page: half-letter-page; }
          @page half-letter-page { size: 8.5in 5.5in landscape; margin: 5mm; }
        }
      `}</style>
    </div>
  );
}