import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, FileText, CheckCircle2, Loader2, Package, Pill, Activity, Plus, Printer, History } from 'lucide-react';
import { getTreatmentsArray } from '../utils/helpers';
const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];

export function PatientModal({ isOpen, onClose, medicalData, setMedicalData, handleHeightChange, handleSavePatient, leadName, selectedPatient, setRecipeToPrint, setIsPrintOpen }) {
  
  // --- ESTADOS INTERNOS DEL MODAL (Para que funcione independiente del Dashboard) ---
  const [activeTab, setActiveTab] = useState('clinical');
  
  // Estados para Récipes
  const [recipeForm, setRecipeForm] = useState({ medications: [], exams: [], indicaciones: '' });
  const [medSearch, setMedSearch] = useState('');
  const [examSearch, setExamSearch] = useState('');
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [currentMed, setCurrentMed] = useState({ name: '', dosage: '', frequency: '', duration: '' });
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  // Datos para Autocompletado
  const GASTRO_VADEMECUM = ["Omeprazol 20mg", "Esomeprazol 40mg", "Lansoprazol 30mg", "Pantoprazol 40mg", "Buscapina Compositum", "Ciprofloxacina 500mg", "Metronidazol 500mg", "Levofloxacina 750mg", "Amoxicilina/Clavulánico 875/125mg", "Sucralfato 1g", "Domperidona 10mg", "Ondansetron 8mg", "Plidex (Diaze, Alipr, Simet)", "Librax", "Rifaximina 550mg", "Probióticos (Enterogermina)", "Simeticona 40mg", "Bonagel", "Ditopax", "Leche de Magnesia"];
  const COMMON_EXAMS = ["Perfil 20", "Hematología Completa", "Urea y Creatinina", "Transaminasas (TGO/TGP)", "Bilirrubina Total y Fraccionada", "Amilasa y Lipasa", "Heces y Orina", "Helicobacter Pylori (Heces)", "Coprocultivo", "Sangre Oculta en Heces", "Ecografía Abdominal", "Endoscopia Digestiva Superior", "Colonoscopia", "Tomografía Abdominal", "Resonancia Magnética Abdominal", "Ph-metría", "Manometría Esofágica", "Test de Aliento"];

  // Helpers
  const parseJSON = (str) => { try { return str ? JSON.parse(str) : []; } catch (e) { return []; } };
  const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];

  // Lógica Interna de Récipes
  const handleAddMedication = () => {
    if (!currentMed.name) return;
    setRecipeForm({ ...recipeForm, medications: [...recipeForm.medications, { ...currentMed, id: Date.now() }] });
    setCurrentMed({ name: '', dosage: '', frequency: '', duration: '' });
    setMedSearch('');
  };

  const handleRemoveMedication = (id) => {
    setRecipeForm({ ...recipeForm, medications: recipeForm.medications.filter(m => m.id !== id) });
  };

  const handleAddExam = () => {
    if (!examSearch) return;
    setRecipeForm({ ...recipeForm, exams: [...recipeForm.exams, { name: examSearch, id: Date.now() }] });
    setExamSearch('');
  };

  const handleRemoveExam = (id) => {
    setRecipeForm({ ...recipeForm, exams: recipeForm.exams.filter(e => e.id !== id) });
  };

  const onSaveRecipe = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setIsSavingRecipe(true);
    
    // Construir el nuevo objeto de récipe
    const newRecipe = {
      id: Date.now(),
      date: new Date().toISOString(),
      author: 'Dr. Víctor', // Podrías pasar el usuario real si quisieras
      medications: recipeForm.medications,
      exams: recipeForm.exams,
      indicaciones: recipeForm.indicaciones
    };

    const currentRecipes = parseJSON(selectedPatient.medical_recipes);
    const updatedRecipes = [...currentRecipes, newRecipe];

    try {
      // Llamada directa a la API desde el Modal (para no depender del Dashboard)
      await fetch('https://victorbot.sosmarketing.agency/webhook/update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer v2ew5w8mAq3' },
        body: JSON.stringify({
          id: selectedPatient.id,
          medical_recipes: JSON.stringify(updatedRecipes),
          updated_by: 'Dr. Víctor'
        })
      });
      
      // Limpiar formulario y cerrar o mostrar éxito
      setRecipeForm({ medications: [], exams: [], indicaciones: '' });
      alert('Récipe guardado correctamente.');
      if(onClose) onClose(); // Cerrar modal o recargar si prefieres
      // Nota: Para ver el cambio reflejado en la lista, el Dashboard debería recargar los leads.
      // Como estamos "aislados", lo ideal sería llamar a una función refresh del padre, pero con cerrar basta por ahora.
    } catch (error) {
      console.error(error);
      alert('Error guardando el récipe');
    } finally {
      setIsSavingRecipe(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-10 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-full overflow-hidden">
        
        {/* ENCABEZADO CON TABS */}
        <div className="bg-[#0056b3] p-0 text-white flex flex-col">
          <div className="flex justify-between items-center p-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Historia Clínica Digital</h3>
              <p className="text-xs text-blue-100 opacity-80 font-mono mt-0.5">Paciente: {leadName}</p>
            </div>
            <button onClick={onClose} className="hover:bg-blue-700/50 p-1.5 rounded-lg transition"><X size={20}/></button>
          </div>
          
          {/* BARRA DE NAVEGACIÓN */}
          <div className="flex px-4 gap-1">
            <button 
              onClick={() => setActiveTab('clinical')}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition flex items-center gap-2 ${activeTab === 'clinical' ? 'bg-white text-[#0056b3]' : 'bg-blue-800/30 text-blue-100 hover:bg-blue-800/50'}`}
            >
              <FileText size={16}/> Datos Clínicos
            </button>
            <button 
              onClick={() => setActiveTab('recipes')}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition flex items-center gap-2 ${activeTab === 'recipes' ? 'bg-white text-[#0056b3]' : 'bg-blue-800/30 text-blue-100 hover:bg-blue-800/50'}`}
            >
              <Pill size={16}/> Récipes y Órdenes
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL MODAL (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          
          {/* --- PESTAÑA 1: DATOS CLÍNICOS --- */}
          {activeTab === 'clinical' && (
            <form onSubmit={handleSavePatient} className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Identificación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Cédula de Identidad</label><input type="text" value={medicalData.cedula} onChange={(e) => setMedicalData({...medicalData, cedula: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0056b3] outline-none font-mono" placeholder="V-12345678" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Edad</label><input type="number" value={medicalData.edad} onChange={(e) => setMedicalData({...medicalData, edad: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0056b3] outline-none" placeholder="0" min="1" max="120" /></div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Sexo</label>
                      <select value={medicalData.sexo} onChange={(e) => setMedicalData({...medicalData, sexo: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0056b3] outline-none bg-white">
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Datos Físicos</h4>
                <div className="grid grid-cols-2 gap-5">
                  <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Peso Inicial (kg)</label><input type="number" step="0.01" required value={medicalData.weight} onChange={(e) => setMedicalData({...medicalData, weight: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0056b3] outline-none font-bold text-slate-700" placeholder="0.00" /></div>
                  <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Estatura (m)</label><input type="text" required value={medicalData.height} onChange={handleHeightChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0056b3] outline-none font-bold text-slate-700" placeholder="1.70" maxLength={4} /></div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Ubicación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Estado</label>
                    <select value={medicalData.state || ''} onChange={(e) => setMedicalData({...medicalData, state: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0056b3] outline-none bg-white">
                      <option value="">Seleccione un estado</option>
                      {VZLA_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Dirección Detallada</label><input type="text" value={medicalData.address || ''} onChange={(e) => setMedicalData({...medicalData, address: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0056b3] outline-none" placeholder="Av, Calle, Casa..." /></div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Antecedentes Médicos</h4>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">¿Fuma?</label><select value={medicalData.smokes || ''} onChange={(e) => setMedicalData({...medicalData, smokes: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"><option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">¿Asmático?</label><select value={medicalData.asthmatic || ''} onChange={(e) => setMedicalData({...medicalData, asthmatic: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"><option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">¿Alergias?</label><select value={medicalData.allergic || ''} onChange={(e) => setMedicalData({...medicalData, allergic: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"><option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                </div>
                {medicalData.allergic === 'Si' && (
                  <div className="mb-4"><label className="block text-xs font-bold text-red-500 mb-1">Especifique Alergias:</label><input type="text" value={medicalData.allergies_detail || ''} onChange={(e) => setMedicalData({...medicalData, allergies_detail: e.target.value})} className="w-full p-2.5 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none bg-red-50/20" placeholder="Ej: Penicilina, Ibuprofeno..." /></div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Historia Médica / Cirugías Previas</label>
                  <textarea value={medicalData.medical_history} onChange={(e) => setMedicalData({...medicalData, medical_history: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0056b3] outline-none resize-none leading-relaxed" rows="4" placeholder="Describa antecedentes importantes..."></textarea>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#0056b3] text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-900/10 active:scale-[0.99]">
                Guardar Historia Clínica
              </button>
            </form>
          )}

          {/* --- PESTAÑA 2: RÉCIPES Y ÓRDENES MÉDICAS (TU DISEÑO RESTAURADO) --- */}
          {activeTab === 'recipes' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              
              {/* HISTORIAL (SI EXISTE) */}
              {parseJSON(selectedPatient?.medical_recipes).length > 0 && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 mb-3 text-sm uppercase flex items-center gap-2"><History size={16}/> Historial de Récipes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                    {parseJSON(selectedPatient.medical_recipes).sort((a,b)=>new Date(b.date)-new Date(a.date)).map((rec, idx) => {
                      const medCount = rec.medications ? rec.medications.length : 0;
                      const exCount = rec.exams ? rec.exams.length : 0;
                      return (
                        <div key={rec.id || idx} className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm flex justify-between items-center hover:shadow-md transition">
                          <div>
                            <p className="font-bold text-emerald-700 text-sm flex items-center gap-2">
                              {medCount > 0 && <span className="flex items-center gap-1"><Pill size={12}/> {medCount} Meds</span>}
                              {exCount > 0 && <span className="flex items-center gap-1"> | <Activity size={12}/> {exCount} Exámenes</span>}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date(rec.date).toLocaleDateString('es-VE', {day:'2-digit', month:'short', year:'numeric'})}</p>
                          </div>
                          <button onClick={() => { if(setRecipeToPrint) setRecipeToPrint({ patient: selectedPatient, data: rec }); if(setIsPrintOpen) setIsPrintOpen('recipe'); }} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition" title="Imprimir Récipe">
                            <Printer size={18}/>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={onSaveRecipe} className="space-y-6 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-black text-emerald-700 flex items-center gap-2"><Pill className="text-emerald-600"/> Crear Nuevo Récipe u Orden</h4>
                </div>
                
                {/* SECCIÓN 1: MEDICAMENTOS (VERDE) */}
                <div className="bg-white p-5 rounded-xl border-2 border-emerald-100 shadow-sm relative group hover:border-emerald-200 transition">
                  <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">Récipes</div>
                  <h5 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 text-sm"><div className="p-1.5 bg-emerald-100 rounded-lg"><Pill className="w-4 h-4"/></div> 1. Recetar Medicamentos</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-4 relative">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Medicamento (Vademécum)</label>
                      <input type="text" value={medSearch} onChange={e => {setMedSearch(e.target.value); setCurrentMed({...currentMed, name: e.target.value}); setShowMedDropdown(true);}} onFocus={() => setShowMedDropdown(true)} onBlur={() => setTimeout(() => setShowMedDropdown(false), 200)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium" placeholder="Buscar..." />
                      
                      {showMedDropdown && (
                        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto left-0 top-full">
                          {GASTRO_VADEMECUM.filter(m => m.toLowerCase().includes(medSearch.toLowerCase())).map((m, i) => (
                            <div key={i} onMouseDown={(e) => { e.preventDefault(); setCurrentMed({...currentMed, name: m}); setMedSearch(m); setShowMedDropdown(false); }} className="px-4 py-2 text-sm hover:bg-emerald-50 cursor-pointer border-b border-slate-50 text-slate-700">{m}</div>
                          ))}
                          {medSearch.trim() !== '' && !GASTRO_VADEMECUM.some(m => m.toLowerCase() === medSearch.toLowerCase()) && (
                            <div onMouseDown={(e) => { e.preventDefault(); setCurrentMed({...currentMed, name: medSearch.trim()}); setShowMedDropdown(false); }} className="px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer flex items-center gap-2"><Plus className="w-4 h-4"/> Añadir nuevo</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-3"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dosis</label><input type="text" value={currentMed.dosage} onChange={e => setCurrentMed({...currentMed, dosage: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: 1 tab" /></div>
                    <div className="md:col-span-2"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Frecuencia</label><input type="text" value={currentMed.frequency} onChange={e => setCurrentMed({...currentMed, frequency: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: 12h" /></div>
                    <div className="md:col-span-2"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Duración</label><input type="text" value={currentMed.duration} onChange={e => setCurrentMed({...currentMed, duration: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: 5 días" /></div>
                    <div className="md:col-span-1"><button type="button" onClick={handleAddMedication} className="w-full p-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition shadow-sm flex justify-center items-center"><Plus className="w-5 h-5"/></button></div>
                  </div>

                  {recipeForm.medications.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {recipeForm.medications.map((med, index) => (
                        <div key={med.id} className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 hover:border-emerald-300 transition group">
                          <div><span className="font-bold text-emerald-800 text-sm">{index + 1}. {med.name}</span><span className="text-emerald-600 text-xs ml-2 font-medium">{med.dosage} • {med.frequency} • {med.duration}</span></div>
                          <button type="button" onClick={() => handleRemoveMedication(med.id)} className="text-emerald-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><X className="w-4 h-4"/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECCIÓN 2: ÓRDENES Y EXÁMENES (INDIGO - RESTAURADO) */}
                <div className="bg-white p-5 rounded-xl border-2 border-indigo-100 shadow-sm relative group hover:border-indigo-200 transition">
                  <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">Laboratorio</div>
                  <h5 className="font-bold text-indigo-800 mb-4 flex items-center gap-2 text-sm"><div className="p-1.5 bg-indigo-100 rounded-lg"><Activity className="w-4 h-4"/></div> 2. Ordenar Exámenes o Tratamientos</h5>
                  
                  <div className="flex gap-3 items-end">
                    <div className="relative flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre del Examen / Procedimiento</label>
                      <input type="text" value={examSearch} onChange={e => {setExamSearch(e.target.value); setShowExamDropdown(true);}} onFocus={() => setShowExamDropdown(true)} onBlur={() => setTimeout(() => setShowExamDropdown(false), 200)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Buscar procedimiento..." />
                      
                      {showExamDropdown && (
                        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto left-0 top-full">
                          {COMMON_EXAMS.filter(m => m.toLowerCase().includes(examSearch.toLowerCase())).map((m, i) => (
                            <div key={i} onMouseDown={(e) => { e.preventDefault(); setExamSearch(m); setShowExamDropdown(false); }} className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer border-b border-slate-50 text-slate-700">{m}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={handleAddExam} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm flex items-center gap-2 text-sm"><Plus className="w-4 h-4"/> Agregar</button>
                  </div>

                  {(recipeForm.exams || []).length > 0 && (
                    <div className="mt-4 space-y-2">
                      {(recipeForm.exams || []).map((ex, index) => (
                        <div key={ex.id} className="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 hover:border-indigo-300 transition group">
                          <span className="font-bold text-indigo-800 text-sm">{index + 1}. {ex.name}</span>
                          <button type="button" onClick={() => handleRemoveExam(ex.id)} className="text-indigo-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><X className="w-4 h-4"/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECCIÓN 3: INDICACIONES */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">3. Indicaciones Generales (Opcional)</label>
                  <textarea value={recipeForm.indicaciones} onChange={e => setRecipeForm({...recipeForm, indicaciones: e.target.value})} rows="2" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-400 resize-none" placeholder="Ej: Dieta blanda, reposo por 48h..."></textarea>
                </div>

                <div className="text-right">
                  <button type="submit" disabled={isSavingRecipe} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 shadow-lg transition flex items-center gap-2 ml-auto disabled:opacity-70">
                    {isSavingRecipe ? <Loader2 className="animate-spin w-5 h-5"/> : <><CheckCircle2 size={18}/> Guardar Récipe y Órdenes</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EditLeadModal({ isOpen, onClose, editFormData, setEditFormData, handleSaveEdit, leadToEdit, setDeleteModalOpen, dbTreatments = [], finances = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { role: 'viewer' };

  if (!isOpen || !leadToEdit) return null;

  const handleHeight = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 1) val = val.slice(0, 1) + '.' + val.slice(1, 3);
    setEditFormData({ ...editFormData, height: val });
  };

  const selectedTreatments = Array.isArray(editFormData.treatments) ? editFormData.treatments : [];
  // Validar dbTreatments
  const safeDbTreatments = Array.isArray(dbTreatments) ? dbTreatments : [];

  const filteredTreatments = (dbTreatments || []).filter((option) => {
    const optionName = option?.name || '';
    if (!optionName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  console.log('Datos de Tratamientos Recibidos:', dbTreatments);
  let availableFinances = [...finances.filter(f => String(f.patient_id) === String(leadToEdit.id))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-full">
        <div className={`flex justify-between items-center p-4 text-white ${leadToEdit.is_patient ? 'bg-purple-700' : 'bg-slate-800'}`}>
          <h3 className="font-bold text-lg">{leadToEdit.is_patient ? '⭐ Editar Paciente' : '🎯 Editar Lead'}</h3>
          <button type="button" onClick={onClose} className="hover:text-gray-200 transition"><X size={20}/></button>
        </div>

        <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Nombre</label><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} /></div>
            <div><label className="block text-sm font-semibold mb-1">Teléfono</label><input type="text" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} /></div>
            <div><label className="block text-sm font-semibold mb-1">Correo Electrónico</label><input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} placeholder="Opcional" className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Cédula</label><input type="text" value={editFormData.cedula} onChange={(e) => setEditFormData({ ...editFormData, cedula: e.target.value })} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} placeholder="V-12345678"/></div>
            <div><label className="block text-sm font-semibold mb-1">Edad</label><input type="number" value={editFormData.edad} onChange={(e) => setEditFormData({ ...editFormData, edad: e.target.value })} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} placeholder="Años" min="1" max="120"/></div>
          </div>

          {/* TODO: Implementar validación de permisos de Rol (Lectura/Escritura) */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tratamientos de Interés</label>
            <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto pr-1">
              {selectedTreatments.length === 0 && <p className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">No hay procedimientos asignados.</p>}
              {selectedTreatments.map((tratamientoActual) => {
                const fIndex = availableFinances.findIndex(f => String(f.treatment_name).trim() === String(tratamientoActual).trim());
                let financeRecord = null;
                if (fIndex !== -1) {
                    financeRecord = availableFinances[fIndex];
                    availableFinances.splice(fIndex, 1); // Lo quitamos para que el próximo duplicado use el siguiente registro
                }
                
                // Nueva lógica infalible de bloqueo
                const isFullyPaid = financeRecord?.payment_status === 'Pagado';
                const isPartiallyPaid = financeRecord?.payment_status === 'Parcial' || (parseFloat(financeRecord?.amount_paid || 0) > 0 && !isFullyPaid);
                const isLocked = isFullyPaid || isPartiallyPaid;
                
                return (
                  <div key={tratamientoActual} className={`flex justify-between items-center border p-3 rounded-xl transition ${isFullyPaid ? 'bg-green-50/50 border-green-200' : isPartiallyPaid ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <p className={`text-sm font-bold ${isFullyPaid ? 'text-green-800' : isPartiallyPaid ? 'text-amber-700' : 'text-slate-800'}`}>
                        {tratamientoActual} {isPartiallyPaid && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Abonado</span>}
                      </p>
                      {financeRecord ? (
                        <p className="text-[11px] text-slate-500 font-mono mt-1 flex gap-3">
                          <span>💰 ${parseFloat(financeRecord.agreed_price || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span>📅 {new Date(financeRecord.created_at).toLocaleDateString('es-VE')}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-medium mt-1 italic">⚠️ Pendiente por guardar en finanzas...</p>
                      )}
                    </div>
                    
                    {isLocked ? (
                      <span className={`text-lg cursor-not-allowed px-3 ${isFullyPaid ? 'text-green-600' : 'text-amber-500'}`} title={isFullyPaid ? "100% Pagado (Bloqueado)" : "Pago Parcial (Bloqueado)"}>🔒</span>
                    ) : (
                      <button type="button" onClick={() => setEditFormData({ ...editFormData, treatments: selectedTreatments.filter((t) => t !== tratamientoActual) })} className="text-red-400 hover:text-white hover:bg-red-500 p-2 rounded-lg transition shadow-sm" title="Eliminar procedimiento">
                        🗑️
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="relative w-full">
              <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} onBlur={() => setTimeout(() => setIsDropdownOpen(false), 300)} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder={`Buscar entre ${dbTreatments?.length || 0} tratamientos...`} />
              {isDropdownOpen && filteredTreatments.length > 0 && (
                <ul className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-2xl max-h-48 overflow-y-auto left-0 top-full">
                  {filteredTreatments.map((t, idx) => (
                    <li key={idx} onMouseDown={() => { setEditFormData({ ...editFormData, treatments: [...selectedTreatments, t.name] }); setSearchTerm(''); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700">
                      {t.name}
                    </li>
                  ))}
                </ul>
              )}
              {isDropdownOpen && filteredTreatments.length === 0 && searchTerm !== '' && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-sm text-gray-500 top-full">No se encontraron tratamientos</div>
              )}
            </div>
          </div>

          {leadToEdit.is_patient && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-700">Sexo</label>
                  <select value={editFormData.sexo} onChange={(e) => setEditFormData({ ...editFormData, sexo: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">Peso Inicial (kg)</label><input type="number" step="0.01" value={editFormData.initial_weight} onChange={(e) => setEditFormData({ ...editFormData, initial_weight: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400" /></div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">Estatura (m)</label><input type="text" value={editFormData.height} onChange={handleHeight} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 font-mono" maxLength={4} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-700">Estado</label>
                  <select value={editFormData.state || ''} onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    <option value="">Seleccione un estado</option>
                    {VZLA_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-700">Dirección Exacta</label>
                  <input type="text" value={editFormData.address || ''} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400" placeholder="Av, Calle, Casa..." />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">¿Fuma?</label><select value={editFormData.smokes || ''} onChange={(e) => setEditFormData({ ...editFormData, smokes: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white"><option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">¿Asmático?</label><select value={editFormData.asthmatic || ''} onChange={(e) => setEditFormData({ ...editFormData, asthmatic: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white"><option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">¿Alergias?</label><select value={editFormData.allergic || ''} onChange={(e) => setEditFormData({ ...editFormData, allergic: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white"><option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option></select></div>
              </div>
              {editFormData.allergic === 'Si' && (
                <div><label className="block text-sm font-semibold mb-1 text-red-600">¿A cuáles medicamentos?</label><input type="text" value={editFormData.allergies_detail || ''} onChange={(e) => setEditFormData({ ...editFormData, allergies_detail: e.target.value })} className="w-full p-2.5 border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-400" placeholder="Especifique..." /></div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1 text-purple-700">Antecedentes Médicos</label>
                <textarea value={editFormData.medical_history} onChange={(e) => setEditFormData({ ...editFormData, medical_history: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 resize-none" rows="3" placeholder="Alergias, cirugías previas, enfermedades crónicas..."></textarea>
              </div>
              {/* Nueva Caja de Consentimiento Legal */}
              <div className="md:col-span-2 mt-2">
                <label className="block text-sm font-semibold mb-1 text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Registro de Consentimientos
                </label>
                <textarea
                  readOnly
                  value={editFormData.consent_log || ''}
                  className="w-full p-3 border border-green-200 rounded-lg outline-none bg-green-50/30 text-slate-600 font-mono text-xs whitespace-pre-wrap"
                  rows="4"
                  placeholder="El paciente no ha firmado consentimientos digitales aún."
                ></textarea>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
            {currentUser?.role === 'admin' ? (
              <button type="button" onClick={() => setDeleteModalOpen(true)} className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-lg transition flex items-center gap-2">🗑️ Eliminar</button>
            ) : <div></div>}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
              <button type="submit" className={`px-6 py-2.5 text-white rounded-lg font-bold shadow-sm transition ${leadToEdit.is_patient ? 'bg-purple-700 hover:bg-purple-800' : 'bg-slate-800 hover:bg-slate-900'}`}>Guardar Cambios</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NotesModal({ isOpen, onClose, activeNotesLead, paginatedNotesModal, totalNotesPages, notesPage, setNotesPage, newNoteContent, setNewNoteContent, handleSaveNewNote }) {
  if (!isOpen || !activeNotesLead) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col h-[600px]">
        <div className="p-4 bg-slate-50 border-b flex justify-between"><div><h3 className="font-bold text-slate-800">Notas Clínicas</h3><p className="text-xs font-medium text-slate-500">{activeNotesLead.name}</p></div><button onClick={onClose} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><X size={20}/></button></div>
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50/50">
          {paginatedNotesModal.length === 0 ? <div className="text-center text-sm font-medium text-slate-400 py-20 flex flex-col items-center"><FileText className="w-10 h-10 mb-2 opacity-20"/>Sin notas registradas.</div> : paginatedNotesModal.map(note => (
            <div key={note.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-2">
                <span className="text-[11px] font-bold text-[#0056b3] bg-blue-50 px-2 py-1 rounded">{new Date(note.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</span>
                <span className="text-[10px] font-medium text-slate-400">Por: {note.author}</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
            </div>
          ))}
        </div>
        {totalNotesPages > 1 && <div className="px-4 py-2 border-t flex justify-between items-center bg-white"><button disabled={notesPage === 1} onClick={() => setNotesPage(p => p-1)} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronLeft size={18} className="text-[#0056b3]"/></button><span className="text-xs font-semibold text-slate-400">Página {notesPage} de {totalNotesPages}</span><button disabled={notesPage === totalNotesPages} onClick={() => setNotesPage(p => p+1)} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronRight size={18} className="text-[#0056b3]"/></button></div>}
        <form onSubmit={handleSaveNewNote} className="p-5 border-t bg-white">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Añadir evolución médica</label>
          <textarea required value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Escribe observaciones..." className="w-full p-3 border border-gray-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-[#0056b3] outline-none resize-none" rows="3" />
          <div className="flex justify-end"><button type="submit" className="bg-[#0056b3] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition">Guardar Nota</button></div>
        </form>
      </div>
    </div>
  );
}

export function AddManualModal({ isOpen, onClose, newManualData, setNewManualData, handleCreateManual, dbTreatments = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleHeight = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 1) val = val.slice(0, 1) + '.' + val.slice(1, 3);
    setNewManualData({...newManualData, height: val});
  };

  const selectedTreatments = Array.isArray(newManualData.treatments) ? newManualData.treatments : [];
  // Validar dbTreatments
  const safeDbTreatments = Array.isArray(dbTreatments) ? dbTreatments : [];

  const filteredTreatments = safeDbTreatments.filter((option) => {
  const optionName = option?.name || '';
  return optionName.toLowerCase().includes((searchTerm || '').toLowerCase()) && !selectedTreatments.includes(optionName);
  });

  console.log('Datos de Tratamientos Recibidos:', dbTreatments);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-full">
        <div className="flex justify-between items-center bg-[#0056b3] p-4 text-white">
          <h3 className="font-bold">Añadir Registro Manual</h3>
          <button type="button" onClick={onClose} className="hover:text-red-200 transition"><X size={20}/></button>
        </div>

        <form onSubmit={handleCreateManual} className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <input type="checkbox" id="isPatientToggle" checked={newManualData.is_patient} onChange={(e) => setNewManualData({ ...newManualData, is_patient: e.target.checked })} className="w-5 h-5 text-[#0056b3] rounded focus:ring-[#0056b3] cursor-pointer" />
            <label htmlFor="isPatientToggle" className="font-bold text-[#0056b3] cursor-pointer">{newManualData.is_patient ? '⭐ Guardar como Paciente Clínico' : '🎯 Guardar solo como Lead (Prospecto)'}</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Nombre Completo *</label><input required type="text" value={newManualData.name} onChange={(e) => setNewManualData({ ...newManualData, name: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
            <div><label className="block text-sm font-semibold mb-1">Teléfono *</label><input required type="text" value={newManualData.phone} onChange={(e) => setNewManualData({ ...newManualData, phone: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
            <div><label className="block text-sm font-semibold mb-1">Correo (Email)</label><input type="email" value={newManualData.email} onChange={(e) => setNewManualData({ ...newManualData, email: e.target.value })} placeholder="Opcional" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Cédula</label><input type="text" value={newManualData.cedula} onChange={(e) => setNewManualData({ ...newManualData, cedula: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="V-12345678" /></div>
            <div><label className="block text-sm font-semibold mb-1">Edad</label><input type="number" value={newManualData.edad} onChange={(e) => setNewManualData({ ...newManualData, edad: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Años" min="1" max="120" /></div>
          </div>

          {/* NUEVO: CAJA PARA REPRESENTANTE LEGAL (Aparece dinámicamente) */}
          {parseInt(newManualData.edad) < 18 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <h4 className="text-amber-800 font-bold text-xs uppercase flex items-center gap-2">⚠️ Datos del Representante Legal</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">Nombre Completo *</label>
                  <input type="text" value={newManualData.guardian_name || ''} onChange={e => setNewManualData({...newManualData, guardian_name: e.target.value})} className="w-full p-2 border border-amber-300 rounded focus:ring-amber-500 text-sm bg-white" placeholder="Ej: Maria Perez" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">Cédula *</label>
                  <input type="text" value={newManualData.guardian_cedula || ''} onChange={e => setNewManualData({...newManualData, guardian_cedula: e.target.value})} className="w-full p-2 border border-amber-300 rounded focus:ring-amber-500 text-sm bg-white" placeholder="Ej: V-1234567" />
                </div>
              </div>
            </div>
          )}

          {/* TODO: Implementar validación de permisos de Rol (Lectura/Escritura) */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tratamientos de Interés</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTreatments.map((tratamientoActual) => (
                <span key={tratamientoActual} className="bg-blue-100 text-[#0056b3] px-2 py-1 rounded-md text-xs font-bold flex items-center">
                  {tratamientoActual}
                  <button type="button" onClick={() => setNewManualData({ ...newManualData, treatments: selectedTreatments.filter((t) => t !== tratamientoActual) })} className="ml-1 text-[#0056b3] hover:text-blue-800">X</button>
                </span>
              ))}
            </div>
            <div className="relative w-full">
              <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} onBlur={() => setTimeout(() => setIsDropdownOpen(false), 300)} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder={`Buscar entre ${dbTreatments?.length || 0} tratamientos...`} />
              {isDropdownOpen && filteredTreatments.length > 0 && (
                <ul className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-2xl max-h-48 overflow-y-auto left-0 top-full">
                  {filteredTreatments.map((t, idx) => (
                    <li key={idx} onMouseDown={() => { setNewManualData({ ...newManualData, treatments: [...selectedTreatments, t.name] }); setSearchTerm(''); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700">
                      {t.name}
                    </li>
                  ))}
                </ul>
              )}
              {isDropdownOpen && filteredTreatments.length === 0 && searchTerm !== '' && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-sm text-gray-500 top-full">No se encontraron tratamientos</div>
              )}
            </div>
          </div>

          {newManualData.is_patient && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-700">Sexo</label>
                  <select value={newManualData.sexo} onChange={(e) => setNewManualData({ ...newManualData, sexo: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">Peso Inicial (kg)</label><input type="number" step="0.01" required={newManualData.is_patient} value={newManualData.weight} onChange={(e) => setNewManualData({ ...newManualData, weight: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400" placeholder="Ej: 85.5" /></div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">Estatura (m)</label><input type="text" required={newManualData.is_patient} value={newManualData.height} onChange={handleHeight} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 font-mono" placeholder="Ej: 1.75" maxLength={4} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-700">Estado</label>
                  <select value={newManualData.state || ''} onChange={(e) => setNewManualData({ ...newManualData, state: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    <option value="">Seleccione un estado</option>
                    {VZLA_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-700">Dirección Exacta</label>
                  <input type="text" value={newManualData.address || ''} onChange={(e) => setNewManualData({ ...newManualData, address: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400" placeholder="Av, Calle, Casa..." />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">¿Fuma?</label><select value={newManualData.smokes || ''} onChange={(e) => setNewManualData({ ...newManualData, smokes: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white"><option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">¿Asmático?</label><select value={newManualData.asthmatic || ''} onChange={(e) => setNewManualData({ ...newManualData, asthmatic: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white"><option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">¿Alergias?</label><select value={newManualData.allergic || ''} onChange={(e) => setNewManualData({ ...newManualData, allergic: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white"><option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option></select></div>
              </div>
              {newManualData.allergic === 'Si' && (
                <div><label className="block text-sm font-semibold mb-1 text-red-600">¿A cuáles medicamentos?</label><input type="text" value={newManualData.allergies_detail || ''} onChange={(e) => setNewManualData({ ...newManualData, allergies_detail: e.target.value })} className="w-full p-2.5 border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-400" placeholder="Especifique..." /></div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1 text-purple-700">Antecedentes Médicos</label>
                <textarea value={newManualData.medical_history} onChange={(e) => setNewManualData({ ...newManualData, medical_history: e.target.value })} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 resize-none" rows="3" placeholder="Alergias, cirugías previas, enfermedades crónicas..."></textarea>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-[#0056b3] text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition">Guardar Registro</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, leadName }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform transition-all">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">¿Estás seguro?</h3>
        <p className="text-sm text-slate-500 mb-6">
          Estás a punto de eliminar a <strong className="text-slate-700">{leadName}</strong>. Esta acción no se puede deshacer y borrará permanentemente todo su historial clínico.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition w-full">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2.5 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm transition w-full">Sí, Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export function WeightModal({ isOpen, onClose, activeWeightLead, newWeightValue, setNewWeightValue, handleSaveNewWeight, parseHistory }) {
  if (!isOpen || !activeWeightLead) return null;
  const historyList = parseHistory(activeWeightLead.weight_history).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col max-h-[600px] overflow-hidden">
        <div className="p-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-purple-900">Evolución de Peso</h3>
            <p className="text-xs font-medium text-purple-600">{activeWeightLead.name}</p>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-purple-700 hover:bg-purple-100 p-1.5 rounded-lg transition"><X size={20}/></button>
        </div>
        
        <div className="flex-1 p-5 space-y-3 overflow-y-auto bg-slate-50/50">
          {historyList.length === 0 ? (
            <div className="text-center text-sm font-medium text-slate-400 py-10">Sin registros de peso.</div>
          ) : (
            historyList.map(record => (
              <div key={record.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <div className="text-[11px] font-bold text-slate-500">{new Date(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div className="text-[9px] font-medium text-slate-400 mt-0.5">Por: {record.author}</div>
                </div>
                <div className="text-lg font-mono font-bold text-purple-700">{record.weight} kg</div>
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={handleSaveNewWeight} className="p-5 border-t border-gray-100 bg-white">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registrar Nuevo Peso</label>
          <div className="flex gap-2">
            <input type="number" step="0.01" required value={newWeightValue} onChange={(e) => setNewWeightValue(e.target.value)} placeholder="Ej: 75.5" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono" />
            <button type="submit" className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-purple-700 transition">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export function CreateAppointmentModal({ isOpen, onClose, leads, handleCreate }) {
  const [formData, setFormData] = useState({ patient_id: '', title: '', date: '', time: '', duration: '20', patient_email: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isOpen) return null;

  const validLeads = leads.filter(l => l.name && l.name !== 'Pendiente' && l.email && l.email !== 'Pendiente' && l.email.includes('@'));

  const filteredLeads = validLeads.filter(l => {
    const term = searchTerm.toLowerCase();
    return (
      (l.name && l.name.toLowerCase().includes(term)) ||
      (l.cedula && l.cedula.toLowerCase().includes(term)) ||
      (l.email && l.email.toLowerCase().includes(term))
    );
  });

  const handleSelectLead = (lead) => {
    setFormData({
      ...formData,
      patient_id: lead.id.toString(),
      title: `Consulta - ${lead.name}`,
      patient_email: lead.email || ''
    });
    setSearchTerm(`${lead.name} (${lead.cedula || 'Sin C.I'})`);
    setShowDropdown(false);
  };

  const handleCustomClose = () => {
    setSearchTerm('');
    setFormData({ patient_id: '', title: '', date: '', time: '', duration: '20', patient_email: '' });
    onClose();
  };

  // Calcular la fecha mínima (mañana)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const minDate = `${year}-${month}-${day}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center bg-[#0056b3] p-4 text-white">
          <h3 className="font-bold">Agendar Nueva Cita</h3>
          <button type="button" onClick={handleCustomClose} className="hover:text-gray-200 transition"><X size={20}/></button>
        </div>
        <form onSubmit={(e) => handleCreate(e, formData)} className="p-6 space-y-4">
          <div className="relative">
            <label className="block text-sm font-semibold mb-1 text-slate-700">Paciente (Buscar por nombre, CI o correo)</label>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
                if(e.target.value === '') setFormData({...formData, patient_id: '', patient_email: ''});
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] bg-white"
              placeholder="Escribe para buscar..."
              required={!formData.patient_id}
            />
            {showDropdown && (
              <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl divide-y divide-gray-50">
                {filteredLeads.length > 0 ? filteredLeads.map(l => (
                  <li 
                    key={l.id} 
                    onMouseDown={(e) => { e.preventDefault(); handleSelectLead(l); }}
                    className="p-3 hover:bg-blue-50 cursor-pointer transition"
                  >
                    <div className="font-bold text-sm text-[#0056b3]">{l.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">CI: {l.cedula || 'N/A'} | ✉️ {l.email}</div>
                  </li>
                )) : (
                  <li className="p-3 text-sm text-slate-500 text-center">No se encontraron pacientes válidos.</li>
                )}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Motivo / Título</label>
            <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Fecha</label>
              <input 
                required 
                type="date" 
                min={minDate}
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" 
              />
            </div>
            <div><label className="block text-sm font-semibold mb-1 text-slate-700">Hora</label><input required type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Duración</label>
              <select required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
                <option value="20">20 min</option>
                <option value="40">40 min</option>
                <option value="60">1 hora</option>
                <option value="80">1 h 20 min</option>
                <option value="100">1 h 40 min</option>
                <option value="120">2 horas</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <button type="button" onClick={handleCustomClose} className="px-5 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-[#0056b3] text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition">Guardar Cita</button>
          </div>
        </form>
      </div>
    </div>
  );
}
// Agrega esta constante al inicio del archivo o justo antes del componente Modal
const BALLOON_BRANDS = [
  { id: 'allurion', name: 'Allurion', duration: '4 Meses' },
  { id: 'ovalsilhouette', name: 'OvalSilhouette', duration: '6 Meses' },
  { id: 'spatz3', name: 'Spatz3', duration: '1 Año' }
];

export function BalloonDeductionModal({ isOpen, onClose, patient, onConfirm, balloonStock = [] }) {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Calcular opciones disponibles según el stock recibido
  const availableOptions = BALLOON_BRANDS.map(brand => {
    const stockItem = balloonStock.find(s => s.brand_id === brand.id);
    const currentStock = stockItem?.current_stock ? parseInt(stockItem.current_stock) : 0;
    return { ...brand, stock: currentStock };
  }).filter(b => b.stock > 0); // Solo mostramos los que tienen stock positivo

  // 2. Seleccionar automáticamente la primera opción disponible al abrir
  if (isOpen && !selectedBrand && availableOptions.length > 0) {
    setSelectedBrand(availableOptions[0].id);
  }

  if (!isOpen || !patient) return null;

  const handleSubmit = async () => {
    if (!selectedBrand) return;
    setSubmitting(true);
    await onConfirm(selectedBrand);
    setSubmitting(false);
    setSelectedBrand(''); // Limpiar selección
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-amber-500 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><Package size={20}/> Asignar Balón</h3>
          <button onClick={onClose} className="hover:bg-amber-600 p-1 rounded"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Paciente</p>
            <p className="font-bold text-lg text-slate-800">{patient.name}</p>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800">
            ⚠️ Esta acción descontará <strong>1 unidad</strong> del inventario físico.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Marca del Balón (Disponible)
            </label>
            
            {availableOptions.length > 0 ? (
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
              >
                {availableOptions.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.duration}) — Stock: {b.stock}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                🚫 No hay balones en stock
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Cancelar</button>
            <button 
              onClick={handleSubmit} 
              disabled={submitting || availableOptions.length === 0}
              className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin w-4 h-4"/> : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
