import React, { useState } from 'react';
import { Search, Plus, FileText, Printer, X, Check, FileStack, Pill, Activity } from 'lucide-react';
import logoDr from '../../assets/logo-dr-victor-horizontal-2.png'; 

const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];
const CAFE_OPTIONS = ['No consume', '1 taza al día', '2 tazas al día', '3 tazas al día', '4 tazas al día', '5 tazas al día', '6 tazas al día', '7 tazas al día', '8+ tazas al día'];
const IPA_OPTIONS = ['No aplica', 'IPA 1', 'IPA 2', 'IPA 3', 'IPA 4', 'IPA 5', 'IPA > 5'];

const PLAN_OPTIONS = [
  'AMILASA Y LIPASA', 'ANTÍGENOS CARCINO EMBRIONARIOS', 'ANTÍGENOS FECALES PARA HELICOBACTER PYLORI', 'ALFAFETOPROTEÍNA',
  'COLANGIORESONANCIA', 'COLONOSCOPIA', 'COPROANÁLISIS', 'CPRE', 'ECO ABDOMINAL', 'ECO TIROIDEO', 'EKG',
  'ENDOSCOPIA DIGESTIVA SUPERIOR', 'EVALUACIÓN CARDIOVASCULAR', 'EVALUACIÓN POR NEUMONOLOGÍA', 'FOSFATASAS ALCALINAS',
  'GASTROSCOPIA', 'GGT', 'GLICEMIA', 'GLICEMIA POST CARGA', 'GLICEMIA POST PRANDIAL', 'HEMATOLOGÍA COMPLETA', 'HIV',
  'MARCADORES TUMORALES (CA19-9)', 'PERFIL 20', 'PERFIL CELÍACO', 'PERFIL HEPÁTICO', 'PERFIL PREOPERATORIO', 'PT Y PTT',
  'RECOMENDACIONES DIETÉTICAS', 'RX DE TÓRAX LAT', 'RX DE TÓRAX PA', 'T3 LIBRE', 'T4 LIBRE',
  'TAC ABDOMINAL CON CONTRASTE', 'TAC ABDOMINAL CON DOBLE CONTRASTE', 'TAC PÉLVICO CON CONTRASTE',
  'TAC PÉLVICO CON DOBLE CONTRASTE', 'TOMOGRAFÍA ABDOMINAL CON DOBLE CONTRASTE', 'TRATAMIENTO AMBULATORIO', 'TSH',
  'ULTRASONIDO ENDOSCÓPICO RADIAL Y LINEAL CON BIOPSIA', 'UROANÁLISIS', 'VALORACIÓN DE NUTRICIÓN',
  'VALORACIÓN POR ENDOCRINOLOGÍA', 'VALORACIÓN POR HEPATOLOGÍA', 'VDRL'
];

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

  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('informes');
  const [isPrintOpen, setIsPrintOpen] = useState(false); 
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reportToPrint, setReportToPrint] = useState(null);
  const [recipeToPrint, setRecipeToPrint] = useState(null);

  const [reportForm, setReportForm] = useState({
    type: 'medico', 
    alergia: '', antecedentes: '', motivo: '', enfermedad: '',
    tabaquicos: '', ipa: 'No aplica', alcohol: '', cafe: 'No consume', usa: [], idx: [], 
    eds: '', edi: '', 
    tension: '', fc: '', fr: '', piel: '', abdomen: '', hepatometria: '', miis: '', neurologico: '',
    higado: '', vias_intra: '', vias_extra: '', vesicula: '', pancreas: '', aorta_porta_cava: '', bazo: '', observaciones: '', conclusiones: [],
    plan: []
  });

  const [recipeForm, setRecipeForm] = useState({ indicaciones: '', medications: [], exams: [] });
  const [idxSearch, setIdxSearch] = useState('');
  const [showIdxDropdown, setShowIdxDropdown] = useState(false);
  const [usaSearch, setUsaSearch] = useState('');
  const [showUsaDropdown, setShowUsaDropdown] = useState(false);
  const [planSearch, setPlanSearch] = useState('');
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [conclusionSearch, setConclusionSearch] = useState('');
  const [showConclusionDropdown, setShowConclusionDropdown] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [currentMed, setCurrentMed] = useState({ name: '', dosage: '', frequency: '', duration: '' });
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

  const safeList = (list) => Array.isArray(list) ? list : [];

  const handleOpenCenter = (patient) => {
    setSelectedPatient(patient);
    const alergiasPrevias = patient.allergic === 'Si' ? patient.allergies_detail : 'Niega alergias';
    setReportForm({
      type: 'medico',
      alergia: alergiasPrevias || 'Niega alergias', antecedentes: patient.medical_history || 'Sin antecedentes relevantes.',
      motivo: '', enfermedad: '', tabaquicos: 'Niega', ipa: 'No aplica', alcohol: 'Ocasional', cafe: '1 taza al día', 
      usa: [], idx: [], eds: '', edi: '', 
      tension: '', fc: '', fr: '', piel: '', abdomen: '', hepatometria: '', miis: '', neurologico: '',
      higado: '', vias_intra: '', vias_extra: '', vesicula: '', pancreas: '', aorta_porta_cava: '', bazo: '', observaciones: '', conclusiones: [],
      plan: []
    });
    setRecipeForm({ indicaciones: '', medications: [], exams: [] });
    setCurrentMed({ name: '', dosage: '', frequency: '', duration: '' });
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
    setReportForm(prev => ({ 
      ...prev, motivo: '', enfermedad: '', usa: [], idx: [], eds: '', edi: '', 
      tension: '', fc: '', fr: '', piel: '', abdomen: '', hepatometria: '', miis: '', neurologico: '',
      higado: '', vias_intra: '', vias_extra: '', vesicula: '', pancreas: '', aorta_porta_cava: '', bazo: '', observaciones: '', conclusiones: [],
      plan: [] 
    }));
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
      <style>{`
        @media print {
          @page { size: letter; margin: 10mm; }
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-area { 
            position: absolute !important; 
            top: 0 !important; 
            left: 0 !important; 
            width: 100% !important; 
            background: white !important; 
            z-index: 9999 !important;
            font-size: 9pt !important;
            color: black !important;
          }
          .print-container { 
            width: 100% !important; 
            max-width: 100% !important; 
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Grid dinámico para evitar huecos */
          .smart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            width: 100%;
          }
          .physical-exam-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Buscar paciente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-medium" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
            <tr><th className="px-6 py-4">Paciente</th><th className="px-6 py-4">Identidad</th><th className="px-6 py-4 text-center">Documentos</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map(patient => (
              <tr key={patient.id} className="hover:bg-blue-50/50 transition">
                <td className="px-6 py-4"><div className="font-bold text-slate-800 text-base">{patient.name}</div><div className="text-slate-500 text-xs mt-0.5">{patient.phone}</div></td>
                <td className="px-6 py-4"><div className="text-slate-700">C.I: {patient.cedula || 'N/A'}</div><div className="text-slate-500 text-xs mt-0.5">Edad: {patient.edad || '-'} años</div></td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleOpenCenter(patient)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0056b3] text-white hover:bg-blue-700 transition shadow-sm">
                    <FileStack className="w-4 h-4" /> Ver Expediente
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCenterOpen && selectedPatient && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col relative my-auto min-h-[80vh]">
            <div className="flex justify-between items-center bg-[#0056b3] p-5 text-white rounded-t-2xl">
              <div><h3 className="font-black text-lg">Expediente Clínico</h3><p className="text-blue-100 text-sm">{selectedPatient.name} - CI: {selectedPatient.cedula}</p></div>
              <button onClick={() => setIsCenterOpen(false)} className="hover:bg-blue-700 p-2 rounded-lg transition"><X size={24}/></button>
            </div>
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button onClick={() => setActiveTab('informes')} className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'informes' ? 'bg-white text-[#0056b3] border-b-2 border-[#0056b3]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><FileText className="w-5 h-5"/> Informes Médicos</button>
              <button onClick={() => setActiveTab('recipes')} className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'recipes' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><Pill className="w-5 h-5"/> Récipes y Recetas</button>
            </div>

            <div className="p-6 flex-1 bg-white">
              {activeTab === 'informes' && (
                <div className="space-y-8">
                  {parseJSON(selectedPatient.medical_reports).length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase">Historial de Informes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {parseJSON(selectedPatient.medical_reports).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(rep => (
                          <div key={rep.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                            <div><p className="font-bold text-[#0056b3] text-sm uppercase">{rep.motivo || (rep.type === 'ultrasonido' ? 'Ecografía' : 'Informe Médico')}</p><p className="text-xs text-slate-500">{new Date(rep.date).toLocaleDateString('es-VE')} - Dr. {rep.author}</p></div>
                            <button onClick={() => { setReportToPrint({ patient: selectedPatient, data: rep }); setIsPrintOpen('informe'); }} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition"><Printer size={16}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveReport} className="space-y-5 border-t border-slate-100 pt-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <h4 className="font-black text-slate-800 flex items-center gap-2"><Plus className="text-[#0056b3]"/> Nuevo Documento</h4>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button type="button" onClick={() => setReportForm({...reportForm, type: 'medico'})} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${reportForm.type === 'medico' ? 'bg-white text-[#0056b3] shadow-sm' : 'text-slate-500'}`}>Informe Médico</button>
                        <button type="button" onClick={() => setReportForm({...reportForm, type: 'ultrasonido'})} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${reportForm.type === 'ultrasonido' ? 'bg-white text-[#0056b3] shadow-sm' : 'text-slate-500'}`}>Ecografía Abdominal</button>
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

                    {reportForm.type === 'medico' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motivo de Consulta *</label>
                            <textarea required={reportForm.type === 'medico'} value={reportForm.motivo} onChange={e => setReportForm({...reportForm, motivo: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3] resize-none"></textarea>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enfermedad Actual *</label>
                            <textarea required={reportForm.type === 'medico'} value={reportForm.enfermedad} onChange={e => setReportForm({...reportForm, enfermedad: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3] resize-none"></textarea>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-4 border-b pb-2 text-[#0056b3]">Examen Físico</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Tensión (T)</label><textarea value={reportForm.tension} onChange={e => setReportForm({...reportForm, tension: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm resize-none" rows="1"></textarea></div>
                            <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">FC</label><textarea value={reportForm.fc} onChange={e => setReportForm({...reportForm, fc: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm resize-none" rows="1"></textarea></div>
                            <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">FR</label><textarea value={reportForm.fr} onChange={e => setReportForm({...reportForm, fr: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm resize-none" rows="1"></textarea></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Piel</label><textarea value={reportForm.piel} onChange={e => setReportForm({...reportForm, piel: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm" rows="2"></textarea></div>
                            <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Abdomen</label><textarea value={reportForm.abdomen} onChange={e => setReportForm({...reportForm, abdomen: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm" rows="2"></textarea></div>
                            <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">Hepatometría</label><textarea value={reportForm.hepatometria} onChange={e => setReportForm({...reportForm, hepatometria: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm" rows="2"></textarea></div>
                            <div><label className="block text-[11px] font-semibold text-slate-600 mb-1">MIIS</label><textarea value={reportForm.miis} onChange={e => setReportForm({...reportForm, miis: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm" rows="2"></textarea></div>
                            <div className="md:col-span-2"><label className="block text-[11px] font-semibold text-slate-600 mb-1">Neurológico</label><textarea value={reportForm.neurologico} onChange={e => setReportForm({...reportForm, neurologico: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm" rows="2"></textarea></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hallazgos Ecográficos (USA)</label>
                            <div className="flex flex-wrap gap-2 mb-2">{safeList(reportForm.usa).map((diag, i) => (<span key={i} className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">{diag} <button type="button" onClick={() => setReportForm({...reportForm, usa: reportForm.usa.filter(d => d !== diag)})} className="hover:text-red-500 ml-1"><X className="w-3 h-3"/></button></span>))}</div>
                            <input type="text" value={usaSearch} onChange={e => {setUsaSearch(e.target.value); setShowUsaDropdown(true);}} onFocus={() => setShowUsaDropdown(true)} onBlur={() => setTimeout(() => setShowUsaDropdown(false), 200)} className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Buscar hallazgo..." />
                            {showUsaDropdown && (<div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto left-0 top-full">{ULTRASOUND_LIST.map((group, gIndex) => { const filteredItems = group.items.filter(item => item.toLowerCase().includes(usaSearch.toLowerCase()) && !safeList(reportForm.usa).includes(item)); if (filteredItems.length === 0) return null; return (<div key={gIndex}><div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 sticky top-0">{group.category}</div>{filteredItems.map((item, iIndex) => (<div key={iIndex} onMouseDown={(e) => { e.preventDefault(); setReportForm({...reportForm, usa: [...safeList(reportForm.usa), item]}); setUsaSearch(''); setShowUsaDropdown(false); }} className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer">{item}</div>))}</div>) })}</div>)}
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">IDX (Diagnósticos) *</label>
                            <div className="flex flex-wrap gap-2 mb-2">{safeList(reportForm.idx).map((diag, i) => (<span key={i} className="bg-blue-100 text-[#0056b3] px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">{diag} <button type="button" onClick={() => setReportForm({...reportForm, idx: reportForm.idx.filter(d => d !== diag)})} className="hover:text-red-500 ml-1"><X className="w-3 h-3"/></button></span>))}</div>
                            <input type="text" value={idxSearch} onChange={e => {setIdxSearch(e.target.value); setShowIdxDropdown(true);}} onFocus={() => setShowIdxDropdown(true)} onBlur={() => setTimeout(() => setShowIdxDropdown(false), 200)} className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Buscar diagnóstico..." />
                            {showIdxDropdown && (<div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto left-0 top-full">{DIAGNOSES_LIST.map((group, gIndex) => { const filteredItems = group.items.filter(item => item.toLowerCase().includes(idxSearch.toLowerCase()) && !safeList(reportForm.idx).includes(item)); if (filteredItems.length === 0) return null; return (<div key={gIndex}><div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 sticky top-0">{group.category}</div>{filteredItems.map((item, iIndex) => (<div key={iIndex} onMouseDown={(e) => { e.preventDefault(); setReportForm({...reportForm, idx: [...safeList(reportForm.idx), item]}); setIdxSearch(''); setShowIdxDropdown(false); }} className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer">{item}</div>))}</div>) })}</div>)}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">EDS (Hallazgos Endoscópicos Superior)</label><textarea value={reportForm.eds} onChange={e => setReportForm({...reportForm, eds: e.target.value})} rows="3" className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none"></textarea></div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">EDI (Hallazgos Endoscópicos Inferior)</label><textarea value={reportForm.edi} onChange={e => setReportForm({...reportForm, edi: e.target.value})} rows="3" className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none"></textarea></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Plan Médico / Paraclínicos</label>
                          <div className="flex flex-wrap gap-2 mb-2">{safeList(reportForm.plan).map((item, i) => (<span key={i} className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">{item} <button type="button" onClick={() => handlePlanToggle(item)} className="hover:text-emerald-900 ml-1"><X className="w-3 h-3"/></button></span>))}</div>
                          <input type="text" value={planSearch} onChange={e => {setPlanSearch(e.target.value); setShowPlanDropdown(true);}} onFocus={() => setShowPlanDropdown(true)} onBlur={() => setTimeout(() => setShowPlanDropdown(false), 200)} className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Buscar examen..." />
                          {showPlanDropdown && (<div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto left-0 top-full">{PLAN_OPTIONS.filter(item => item.toLowerCase().includes(planSearch.toLowerCase()) && !safeList(reportForm.plan).includes(item)).map((item, index) => (<div key={index} onMouseDown={(e) => { e.preventDefault(); handlePlanToggle(item); setPlanSearch(''); setShowPlanDropdown(false); }} className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0">{item}</div>))}</div>)}
                        </div>
                      </>
                    )}

                    {reportForm.type === 'ultrasonido' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hígado</label><textarea value={reportForm.higado} onChange={e => setReportForm({...reportForm, higado: e.target.value})} rows="2" className="w-full p-2 border border-slate-200 rounded text-sm resize-none"></textarea></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vías Biliares Intrahepáticas</label><textarea value={reportForm.vias_intra} onChange={e => setReportForm({...reportForm, vias_intra: e.target.value})} rows="2" className="w-full p-2 border border-slate-200 rounded text-sm resize-none"></textarea></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vías Biliares Extrahepáticas</label><textarea value={reportForm.vias_extra} onChange={e => setReportForm({...reportForm, vias_extra: e.target.value})} rows="2" className="w-full p-2 border border-slate-200 rounded text-sm resize-none"></textarea></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vesícula</label><textarea value={reportForm.vesicula} onChange={e => setReportForm({...reportForm, vesicula: e.target.value})} rows="2" className="w-full p-2 border border-slate-200 rounded text-sm resize-none"></textarea></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Páncreas</label><textarea value={reportForm.pancreas} onChange={e => setReportForm({...reportForm, pancreas: e.target.value})} rows="2" className="w-full p-2 border border-slate-200 rounded text-sm resize-none"></textarea></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aorta, Porta y Cava</label><textarea value={reportForm.aorta_porta_cava} onChange={e => setReportForm({...reportForm, aorta_porta_cava: e.target.value})} rows="2" className="w-full p-2 border border-slate-200 rounded text-sm resize-none"></textarea></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bazo</label><textarea value={reportForm.bazo} onChange={e => setReportForm({...reportForm, bazo: e.target.value})} rows="2" className="w-full p-2 border border-slate-200 rounded text-sm resize-none"></textarea></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observaciones</label><textarea value={reportForm.observaciones} onChange={e => setReportForm({...reportForm, observaciones: e.target.value})} rows="2" className="w-full p-2 border border-slate-200 rounded text-sm resize-none"></textarea></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Conclusiones *</label>
                          <div className="flex flex-wrap gap-2 mb-2">{safeList(reportForm.conclusiones).map((conc, i) => (<span key={i} className="bg-blue-100 text-[#0056b3] px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">{conc} <button type="button" onClick={() => setReportForm({...reportForm, conclusiones: reportForm.conclusiones.filter(c => c !== conc)})} className="hover:text-red-500 ml-1"><X className="w-3 h-3"/></button></span>))}</div>
                          <div className="flex gap-2">
                            <input type="text" value={conclusionSearch} onChange={e => setConclusionSearch(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="Escribir conclusión..." />
                            <button type="button" onClick={() => { if(conclusionSearch.trim()){ setReportForm({...reportForm, conclusiones: [...safeList(reportForm.conclusiones), conclusionSearch.trim()]}); setConclusionSearch(''); }}} className="bg-[#0056b3] text-white px-4 rounded-lg"><Plus size={20}/></button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="text-right"><button type="submit" className="px-8 py-3 bg-[#0056b3] text-white rounded-xl font-black hover:bg-blue-700 shadow-lg transition">Guardar Informe</button></div>
                  </form>
                </div>
              )}

              {activeTab === 'recipes' && (
                <div className="space-y-8">
                  {parseJSON(selectedPatient.medical_recipes).length > 0 && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <h4 className="font-bold text-emerald-800 mb-3 text-sm uppercase">Historial de Récipes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {parseJSON(selectedPatient.medical_recipes).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(rec => (
                          <div key={rec.id} className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm flex justify-between items-center">
                            <div><p className="font-bold text-emerald-700 text-sm uppercase">{safeList(rec.medications).length} Meds | {safeList(rec.exams).length} Exámenes</p><p className="text-xs text-slate-500">{new Date(rec.date).toLocaleDateString('es-VE')} - Dr. {rec.author}</p></div>
                            <button onClick={() => { setRecipeToPrint({ patient: selectedPatient, data: rec }); setIsPrintOpen('recipe'); }} className="p-2 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-600 hover:text-white transition"><Printer size={16}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSaveRecipe} className="space-y-6 border-t border-slate-100 pt-6">
                    <h4 className="font-black text-emerald-700 flex items-center gap-2"><Pill className="text-emerald-600"/> Crear Nuevo Récipe</h4>
                    <div className="bg-white p-5 rounded-xl border-2 border-emerald-100 shadow-sm relative">
                      <h5 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">Tratamiento</h5>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4 relative">
                          <input type="text" value={medSearch} onChange={e => {setMedSearch(e.target.value); setCurrentMed({...currentMed, name: e.target.value}); setShowMedDropdown(true);}} onFocus={() => setShowMedDropdown(true)} onBlur={() => setTimeout(() => setShowMedDropdown(false), 200)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Medicamento..." />
                          {showMedDropdown && (<div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-xl max-h-48 overflow-y-auto">{GASTRO_VADEMECUM.filter(m => m.toLowerCase().includes(medSearch.toLowerCase())).map((m, i) => (<div key={i} onMouseDown={(e) => { e.preventDefault(); setCurrentMed({...currentMed, name: m}); setMedSearch(m); setShowMedDropdown(false); }} className="px-4 py-2 text-sm hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0">{m}</div>))}</div>)}
                        </div>
                        <div className="md:col-span-2"><input type="text" value={currentMed.dosage} onChange={e => setCurrentMed({...currentMed, dosage: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Dosis" /></div>
                        <div className="md:col-span-2"><input type="text" value={currentMed.frequency} onChange={e => setCurrentMed({...currentMed, frequency: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Frec." /></div>
                        <div className="md:col-span-2"><input type="text" value={currentMed.duration} onChange={e => setCurrentMed({...currentMed, duration: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Durac." /></div>
                        <div className="md:col-span-2"><button type="button" onClick={handleAddMedication} className="w-full p-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition">Añadir</button></div>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border-2 border-blue-100 shadow-sm">
                      <div className="flex gap-2">
                        <input type="text" value={examSearch} onChange={e => {setExamSearch(e.target.value); setShowExamDropdown(true);}} onFocus={() => setShowExamDropdown(true)} onBlur={() => setTimeout(() => setShowExamDropdown(false), 200)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm flex-1" placeholder="Exámenes..." />
                        <button type="button" onClick={handleAddExam} className="px-4 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">Añadir</button>
                      </div>
                    </div>
                    <textarea value={recipeForm.indicaciones} onChange={e => setRecipeForm({...recipeForm, indicaciones: e.target.value})} rows="3" className="w-full p-3 border border-slate-200 rounded-lg text-sm" placeholder="Indicaciones..."></textarea>
                    <div className="text-right"><button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 shadow-lg transition">Generar Récipe</button></div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isPrintOpen === 'informe' && reportToPrint && (
        <div className="fixed inset-0 z-[70] bg-white overflow-auto print-area">
          <div className="max-w-4xl mx-auto p-12 bg-white min-h-screen relative print-container flex flex-col justify-between">
            <div className="absolute top-4 right-4 no-print flex gap-2">
              <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2"><Printer size={16}/> Imprimir</button>
              <button onClick={() => setIsPrintOpen(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded font-bold hover:bg-slate-300">Cerrar</button>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-8 border-b-2 border-[#0056b3] pb-4">
                <img src={logoDr} alt="Logo" className="h-16 object-contain" />
                <div className="text-right text-xs text-slate-500 uppercase">
                  <p>Fecha: {new Date(reportToPrint.data.date).toLocaleDateString('es-VE')}</p>
                  <p className="font-black text-[#0056b3] text-sm">{reportToPrint.data.type === 'ultrasonido' ? 'Informe Ultrasonido Abdominal' : 'Informe Médico de Gastroenterología'}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1 text-center">Datos del Paciente</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                  <p><span className="font-bold text-slate-600">Nombre:</span> {reportToPrint.patient.name}</p>
                  <p><span className="font-bold text-slate-600">Cédula:</span> {reportToPrint.patient.cedula}</p>
                  <p><span className="font-bold text-slate-600">Edad:</span> {reportToPrint.patient.edad} años</p>
                  <p><span className="font-bold text-slate-600">Teléfono:</span> {reportToPrint.patient.phone}</p>
                </div>
              </div>

              <div className="space-y-6 text-xs text-justify leading-relaxed">
                {reportToPrint.data.type !== 'ultrasonido' ? (
                  <>
                    <div className="smart-grid">
                      {reportToPrint.data.motivo && <div><span className="font-bold underline uppercase">Motivo de consulta:</span> <p>{reportToPrint.data.motivo}</p></div>}
                      {reportToPrint.data.enfermedad && <div><span className="font-bold underline uppercase">Enfermedad actual:</span> <p>{reportToPrint.data.enfermedad}</p></div>}
                    </div>

                    {(reportToPrint.data.antecedentes || reportToPrint.data.alergia) && (
                      <div className="smart-grid">
                        {reportToPrint.data.antecedentes && <div><span className="font-bold underline uppercase">Antecedentes:</span> <p>{reportToPrint.data.antecedentes}</p></div>}
                        {reportToPrint.data.alergia && <div><span className="font-bold underline uppercase">Alergias:</span> <p>{reportToPrint.data.alergia}</p></div>}
                      </div>
                    )}

                    {(reportToPrint.data.tabaquicos || reportToPrint.data.alcohol) && (
                      <div className="border-y border-slate-100 py-1"><span className="font-bold underline uppercase">Hábitos:</span> Tabaco: {reportToPrint.data.tabaquicos || 'Niega'} (IPA: {reportToPrint.data.ipa || 'N/A'}) | Alcohol: {reportToPrint.data.alcohol || 'Niega'} | Café: {reportToPrint.data.cafe || 'No consume'}</div>
                    )}

                    {/* EXAMEN FÍSICO OPTIMIZADO */}
                    {(reportToPrint.data.tension || reportToPrint.data.fc || reportToPrint.data.fr || reportToPrint.data.piel || reportToPrint.data.abdomen || reportToPrint.data.hepatometria || reportToPrint.data.miis || reportToPrint.data.neurologico) && (
                      <div className="mt-2">
                        <span className="font-bold underline uppercase block mb-2">Examen Físico:</span>
                        <div className="flex gap-4 mb-2 border-b border-slate-50 pb-2">
                          {reportToPrint.data.tension && <span><strong>T:</strong> {reportToPrint.data.tension}</span>}
                          {reportToPrint.data.fc && <span><strong>FC:</strong> {reportToPrint.data.fc}</span>}
                          {reportToPrint.data.fr && <span><strong>FR:</strong> {reportToPrint.data.fr}</span>}
                        </div>
                        <div className="physical-exam-grid">
                          {reportToPrint.data.piel && <div><strong>Piel:</strong> {reportToPrint.data.piel}</div>}
                          {reportToPrint.data.abdomen && <div><strong>Abdomen:</strong> {reportToPrint.data.abdomen}</div>}
                          {reportToPrint.data.hepatometria && <div><strong>Hepatometría:</strong> {reportToPrint.data.hepatometria}</div>}
                          {reportToPrint.data.miis && <div><strong>MIIS:</strong> {reportToPrint.data.miis}</div>}
                          {reportToPrint.data.neurologico && <div><strong>Neurológico:</strong> {reportToPrint.data.neurologico}</div>}
                        </div>
                      </div>
                    )}

                    <div className="smart-grid mt-4">
                      {safeList(reportToPrint.data.usa).length > 0 && <div><span className="font-bold underline uppercase">Hallazgos Ecográficos (USA):</span><ul className="list-disc ml-5 mt-1">{safeList(reportToPrint.data.usa).map((u, i) => <li key={i}>{u}</li>)}</ul></div>}
                      {safeList(reportToPrint.data.idx).length > 0 && <div><span className="font-bold underline uppercase">Impresión Diagnóstica (IDX):</span><ul className="list-disc ml-5 mt-1">{safeList(reportToPrint.data.idx).map((d, i) => <li key={i}>{d}</li>)}</ul></div>}
                    </div>

                    <div className="smart-grid mt-4">
                      {reportToPrint.data.eds && <div><span className="font-bold underline uppercase">Hallazgos EDS:</span> <p className="mt-1 whitespace-pre-line">{reportToPrint.data.eds}</p></div>}
                      {reportToPrint.data.edi && <div><span className="font-bold underline uppercase">Hallazgos EDI:</span> <p className="mt-1 whitespace-pre-line">{reportToPrint.data.edi}</p></div>}
                    </div>

                    {safeList(reportToPrint.data.plan).length > 0 && <div className="mt-4"><span className="font-bold underline uppercase">Plan y Paraclínicos:</span><ul className="mt-1 grid grid-cols-2 gap-x-4">{safeList(reportToPrint.data.plan).map((p, i) => <li key={i} className="uppercase ml-4">• {p}</li>)}</ul></div>}
                  </>
                ) : (
                  /* VISTA ULTRASONIDO */
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-4">
                      {reportToPrint.data.higado && <div><span className="font-bold underline uppercase">Hígado:</span> <p>{reportToPrint.data.higado}</p></div>}
                      {reportToPrint.data.vias_intra && <div><span className="font-bold underline uppercase">Vías Intrahepáticas:</span> <p>{reportToPrint.data.vias_intra}</p></div>}
                      {reportToPrint.data.vias_extra && <div><span className="font-bold underline uppercase">Vías Extrahepáticas:</span> <p>{reportToPrint.data.vias_extra}</p></div>}
                      {reportToPrint.data.vesicula && <div><span className="font-bold underline uppercase">Vesícula:</span> <p>{reportToPrint.data.vesicula}</p></div>}
                      {reportToPrint.data.pancreas && <div><span className="font-bold underline uppercase">Páncreas:</span> <p>{reportToPrint.data.pancreas}</p></div>}
                      {reportToPrint.data.aorta_porta_cava && <div><span className="font-bold underline uppercase">Aorta, Porta y Cava:</span> <p>{reportToPrint.data.aorta_porta_cava}</p></div>}
                      {reportToPrint.data.bazo && <div><span className="font-bold underline uppercase">Bazo:</span> <p>{reportToPrint.data.bazo}</p></div>}
                      {reportToPrint.data.observaciones && <div><span className="font-bold underline uppercase">Observaciones:</span> <p>{reportToPrint.data.observaciones}</p></div>}
                    </div>
                    {safeList(reportToPrint.data.conclusiones).length > 0 && <div className="mt-3 bg-slate-50 p-2 rounded"><span className="font-bold underline uppercase">Conclusiones:</span><ul className="list-disc ml-5 mt-1">{safeList(reportToPrint.data.conclusiones).map((c, i) => <li key={i} className="font-bold uppercase">{c}</li>)}</ul></div>}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-center text-[9pt] text-slate-700 leading-tight border-t border-slate-200 pt-4">
              <p className="font-bold text-slate-900 text-sm">Dr. Victor Manrique</p>
              <p className="font-bold">CM: 1991 MPPS: 92627</p>
              <p>Gastroenterología / Ecografía</p>
              <p>Endoscopia Digestiva Diagnóstica y Terapéutica</p>
              <p>Especialista en Vía Biliares y Obesidad</p>
              <p>Telf: 04243263209 | Instagram: @drvictorgastro</p>
            </div>
          </div>
        </div>
      )}

      {/* Récipes (Se mantiene igual que tu versión funcional) */}
      {isPrintOpen === 'recipe' && recipeToPrint && (
        <div className="fixed inset-0 z-[70] bg-white overflow-auto print-area flex items-center justify-center bg-gray-100">
          <div className="bg-white w-[14cm] h-[21.5cm] shadow-2xl relative p-8 flex flex-col justify-between print-container uppercase"> 
            <div className="absolute top-4 right-4 no-print flex gap-2">
              <button onClick={() => window.print()} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"><Printer size={14}/> Imprimir</button>
              <button onClick={() => setIsPrintOpen(false)} className="bg-slate-200 text-slate-700 px-3 py-1 rounded text-xs font-bold hover:bg-slate-300">Cerrar</button>
            </div>
            <div>
              <div className="flex justify-between items-center border-b-2 border-emerald-600 pb-3 mb-4">
                <img src={logoDr} alt="Logo" className="h-12 object-contain" />
                <div className="text-right text-[10px] text-slate-500 uppercase"><p>Fecha: {new Date(recipeToPrint.data.date).toLocaleDateString('es-VE')}</p><p className="font-black text-emerald-700 text-xs">RÉCIPE MÉDICO</p></div>
              </div>
              <div className="mb-4 text-[10px]"><p><span className="font-bold">Paciente:</span> {recipeToPrint.patient.name} | <span className="font-bold">C.I:</span> {recipeToPrint.patient.cedula}</p></div>
              <div className="space-y-4 text-[11px]">
                {safeList(recipeToPrint.data.medications).length > 0 && (
                  <div><h4 className="font-bold border-b border-emerald-100 mb-2 uppercase">Tratamiento Farmacológico</h4><ul className="space-y-2">{safeList(recipeToPrint.data.medications).map((m, i) => (<li key={i} className="ml-2"><span className="font-bold">• {m.name}</span><div className="ml-3">{m.dosage} - {m.frequency} x {m.duration}</div></li>))}</ul></div>
                )}
                {safeList(recipeToPrint.data.exams).length > 0 && (
                  <div><h4 className="font-bold border-b border-blue-100 mb-2 uppercase">Órdenes Médicas / Exámenes</h4><ul className="space-y-1">{safeList(recipeToPrint.data.exams).map((e, i) => (<li key={i} className="ml-2 font-bold">• {e.name}</li>))}</ul></div>
                )}
                {recipeToPrint.data.indicaciones && (<div><h4 className="font-bold border-b border-slate-100 mb-2 uppercase">Indicaciones</h4><p className="whitespace-pre-wrap">{recipeToPrint.data.indicaciones}</p></div>)}
              </div>
            </div>
            <div className="text-center text-[9pt] text-slate-700 leading-tight border-t border-slate-200 pt-2"><p className="font-bold text-slate-900">Dr. Victor Manrique</p><p>CM: 1991 MPPS: 92627</p><p>Gastroenterología / Ecografía</p><p>@drvictorgastro | 04243263209</p></div>
          </div>
        </div>
      )}
    </div>
  );
}