import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Search, UserPlus, UserCheck, ChevronLeft, Syringe } from 'lucide-react';
import logo from '../assets/logo-dr-victor-horizontal-300x66.png'; //

const API_KEY = 'Bearer v2ew5w8mAq3';
const POST_URL = 'https://victorbot.sosmarketing.agency/webhook/create-lead';
const UPDATE_URL = 'https://victorbot.sosmarketing.agency/webhook/update-lead';
const GET_LEADS_URL = 'https://victorbot.sosmarketing.agency/webhook/api-leads';
const GET_TREATMENTS_URL = 'https://victorbot.sosmarketing.agency/webhook/get-treatments';
const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];


export default function SelfRegistration() {
  const [viewMode, setViewMode] = useState('home'); 
  const [treatmentsList, setTreatmentsList] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '', cedula: '', phone: '', email: '', edad: '', sexo: '',
    state: '', address: '', treatment: '',
    initial_weight: '', height: '', bmi: '',
    smokes: '', asthmatic: '', allergic: '', allergies_detail: '',
    medical_history: '', guardian_name: '', guardian_cedula: ''
  });

  const [searchCedula, setSearchCedula] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [existingPatient, setExistingPatient] = useState(null);
  const [newTreatmentSelected, setNewTreatmentSelected] = useState('');
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAnesthesiaTerms, setAcceptedAnesthesiaTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    if (header) header.style.display = 'none';
    if (nav) nav.style.display = 'none';
    if (footer) footer.style.display = 'none';
    return () => {
      if (header) header.style.display = '';
      if (nav) nav.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await fetch(GET_TREATMENTS_URL, { headers: { 'Authorization': API_KEY } });
        const data = await response.json();
        // Ahora guardamos el objeto completo {name, price, requires_anesthesia}, no solo el nombre
        const normalizedData = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [];
        setTreatmentsList(normalizedData);
      } catch (error) { console.error(error); }
    };
    fetchTreatments();
  }, []);

  useEffect(() => {
    const weight = parseFloat(formData.initial_weight);
    const heightM = parseFloat(formData.height);
    if (weight > 0 && heightM > 0) {
      const bmiValue = (weight / (heightM * heightM)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi: bmiValue }));
    } else {
      setFormData(prev => ({ ...prev, bmi: '' }));
    }
  }, [formData.initial_weight, formData.height]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCedula.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(GET_LEADS_URL, { headers: { 'Authorization': API_KEY } });
      const text = await res.text();
      const leads = text ? JSON.parse(text) : [];
      const normalizedData = Array.isArray(leads) ? (Array.isArray(leads[0]) ? leads[0] : leads) : [];
      
      const cleanCedula = (val) => String(val).toUpperCase().replace(/[\s\-\.]/g, '').replace(/^[VE]/, '');
      const searchClean = cleanCedula(searchCedula);

      const found = normalizedData.find(l => {
        if (!l.is_patient || !l.cedula) return false;
        return cleanCedula(l.cedula) === searchClean;
      });
      
      if (found) {
        setExistingPatient(found);
        setViewMode('existing-consent');
      } else {
        alert("No encontramos un paciente registrado con esa cédula. Por favor verifique o regístrese como paciente nuevo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error buscando al paciente. Avise a recepción.");
    } finally {
      setIsSearching(false);
    }
  };

  const ageNew = parseInt(formData.edad);
  const isMinorNew = !isNaN(ageNew) && ageNew < 18;
  const ageExisting = existingPatient ? parseInt(existingPatient.edad) : 0;
  const isMinorExisting = existingPatient && !isNaN(ageExisting) && ageExisting < 18;

  const selectedProcedure = viewMode === 'new' ? formData.treatment : newTreatmentSelected;
  const selectedProcedureObj = treatmentsList.find(t => t.name === selectedProcedure);
  // Si eligen "Otro", por seguridad legal asumimos que SÍ requiere consentimiento
  const requiresConsent = selectedProcedureObj ? selectedProcedureObj.requires_consent : (selectedProcedure === 'Otro' ? true : false);
  const requiresAnesthesia = selectedProcedureObj ? selectedProcedureObj.requires_anesthesia : false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiresConsent && !acceptedTerms) {
      alert("Debe aceptar el consentimiento general del procedimiento para continuar.");
      return;
    }
    if (requiresAnesthesia && !acceptedAnesthesiaTerms) {
      alert("Debe aceptar el consentimiento de anestesia para este procedimiento.");
      return;
    }

    setIsSubmitting(true);
    try {
      const consentDate = new Date().toLocaleString('es-VE');

      if (viewMode === 'new') {
        if (isMinorNew && (!formData.guardian_name || !formData.guardian_cedula)) {
          alert("Los datos del representante son obligatorios para menores.");
          setIsSubmitting(false); return;
        }
        
        const consenterName = isMinorNew 
          ? `${formData.guardian_name} (C.I: ${formData.guardian_cedula}) como rep. legal` 
          : `${formData.name} (C.I: ${formData.cedula})`;
        
        let consentSignature = '';
        if (requiresConsent) {
           consentSignature += `\n===============================\nFIRMA DIGITAL DE CONSENTIMIENTO\n===============================\nAceptado por: ${consenterName}\nFecha: ${consentDate}\nProcedimiento: ${selectedProcedure}\nDeclaración: Entiende riesgos y complicaciones. Autoriza procedimiento.\n`;
        }

        if (requiresAnesthesia) {
          consentSignature += `\n===============================\nFIRMA DIGITAL DE ANESTESIA\n===============================\nAceptado por: ${consenterName}\nFecha: ${consentDate}\nDeclaración: Autoriza procedimiento anestésico y asume conocimiento de efectos colaterales.\n`;
        }

        const payload = { ...formData, consent_log: consentSignature, is_patient: true, username: 'Auto Registro Tablet' };

        await fetch(POST_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
          body: JSON.stringify(payload)
        });
      } 
      else if (viewMode === 'existing-consent') {
        if (isMinorExisting && (!formData.guardian_name || !formData.guardian_cedula)) {
          alert("Los datos del representante son obligatorios para menores.");
          setIsSubmitting(false); return;
        }

        const consenterName = isMinorExisting 
          ? `${formData.guardian_name} (C.I: ${formData.guardian_cedula}) como rep. legal` 
          : `${existingPatient.name} (C.I: ${existingPatient.cedula})`;
        
        let consentSignature = '';
        if (requiresConsent) {
           consentSignature += `\n===============================\nFIRMA DIGITAL DE CONSENTIMIENTO\n===============================\nAceptado por: ${consenterName}\nFecha: ${consentDate}\nProcedimiento: ${selectedProcedure}\nDeclaración: Entiende riesgos y complicaciones. Autoriza procedimiento.\n`;
        }

        if (requiresAnesthesia) {
          consentSignature += `\n===============================\nFIRMA DIGITAL DE ANESTESIA\n===============================\nAceptado por: ${consenterName}\nFecha: ${consentDate}\nDeclaración: Autoriza procedimiento anestésico y asume conocimiento de efectos colaterales.\n`;
        }

        const finalConsentLog = (existingPatient.consent_log || '') + '\n' + consentSignature;
        const finalTreatments = existingPatient.treatment 
          ? (existingPatient.treatment.includes(newTreatmentSelected) ? existingPatient.treatment : `${existingPatient.treatment}, ${newTreatmentSelected}`) 
          : newTreatmentSelected;

        const payload = {
          ...existingPatient, 
          treatment: finalTreatments,
          consent_log: finalConsentLog,
          updated_by: 'Auto Registro Tablet'
        };

        await fetch(UPDATE_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
          body: JSON.stringify(payload)
        });
      }

      setIsSuccess(true);
      setTimeout(() => { window.location.reload(); }, 8000);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al enviar sus datos. Por favor, avise en recepción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const GeneralConsentText = () => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 h-64 overflow-y-auto mb-4 shadow-inner text-sm text-slate-700 space-y-4">
      <h3 className="font-black text-base text-slate-900">Información y consentimiento general:</h3>
      <p><strong>1. Naturaleza y Propósito del Procedimiento:</strong><br/>He sido informado(a) sobre la naturaleza, el propósito y la forma en que se realizará el procedimiento endoscópico propuesto.</p>
      <p><strong>2. Riesgos y Complicaciones:</strong><br/>El Dr. Víctor Manrique me ha explicado los riesgos, complicaciones y molestias más frecuentes y relevantes que podrían surgir durante o después del procedimiento.</p>
      <p><strong>3. Alternativas de Tratamiento:</strong><br/>Se me han informado sobre las alternativas de tratamiento disponibles para mi condición.</p>
      <p><strong>4. Situaciones Imprevistas:</strong><br/>Entiendo que durante el procedimiento pueden surgir situaciones imprevistas que requieran procedimientos adicionales.</p>
      <p><strong>5. Oportunidad de Preguntas:</strong><br/>He tenido la oportunidad de hacer todas las preguntas y han sido aclaradas satisfactoriamente.</p>
      <p><strong>6. Derecho a Revocar el Consentimiento:</strong><br/>Tengo el derecho de revocar este consentimiento en cualquier momento antes de que se inicie.</p>
      <p><strong>7. Consentimiento Voluntario:</strong><br/>Doy mi consentimiento libre y voluntariamente para que se me realice el procedimiento descrito.</p>
    </div>
  );

  const AnesthesiaConsentText = ({ isMinor, patientName, patientCedula, guardianName, guardianCedula, treatment }) => {
    const authName = isMinor ? (guardianName || '____________________') : (patientName || '____________________');
    const authCedula = isMinor ? (guardianCedula || '__________') : (patientCedula || '__________');
    const targetPatient = isMinor ? `el(la) paciente ${patientName || '____________________'}` : 'mí';

    return (
      <div className="bg-slate-50 p-6 rounded-2xl border-2 border-indigo-100 mt-6">
        <h2 className="text-xl font-bold text-indigo-900 pb-2 mb-4 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 p-2 rounded-full flex items-center justify-center"><Syringe className="w-5 h-5" /></span> 
          Consentimiento de Anestesia y Sedación
        </h2>
        <div className="bg-white p-5 rounded-xl border border-indigo-100 h-64 overflow-y-auto mb-4 shadow-inner text-sm text-slate-700 space-y-4">
          <p>
            Yo, <strong>{authName}</strong> identificado(a) con la cédula de identidad No.: <strong>{authCedula}</strong> por la presente autorizo a los anestesiólogos del Departamento de Anestesiología del Edif. CENTRO UNO a realizar en {targetPatient} el procedimiento anestésico adecuado para la siguiente intervención quirúrgica: <strong>{treatment || '____________________'}</strong>
          </p>
          <p>
            El Doctor <strong>Víctor Manrique</strong> me ha explicado la naturaleza y propósito del acto anestésico; también me ha informado de las ventajas, complicaciones, molestias y riesgos que puedan producirse, así como las posibles alternativas de los diferentes métodos anestésicos. Se me ha dado la oportunidad de hacer preguntas y han sido contestadas satisfactoriamente.
          </p>
          <p>
            Entiendo que en el curso de los procedimientos anestésicos puedan presentarse situaciones imprevistas que requieran procedimientos adicionales. Por lo tanto, autorizo la realización de estos procedimientos si el anestesiólogo arriba mencionado o sus asistentes lo juzgan necesario.
          </p>
          <p>
            Reconozco que me ha informado que el acto anestésico, practicado con los debidos cuidados, puede producir efectos colaterales tales como dolor de cabeza, mareo, náuseas, vómito, inflamación del sitio de la venopunción, dolor de garganta, escoriaciones o lesiones en piel, en los dientes, en mucosas, y lesiones por la(s) posición(es) necesaria(s) para realizar la cirugía, además de otras complicaciones asociadas al procedimiento y a las patologías previas.
          </p>
          <p>
            Certifico que he leído y comprendido perfectamente lo anterior y todos los espacios en blanco han sido completados antes de mi firma y me encuentro en capacidad de expresar mi libre albedrío y conozco mi derecho a rechazar el tratamiento o revocar este consentimiento.
          </p>
        </div>
        <label className="flex items-start gap-4 p-4 bg-white border border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-50 transition shadow-sm">
          <input type="checkbox" checked={acceptedAnesthesiaTerms} onChange={e => setAcceptedAnesthesiaTerms(e.target.checked)} className="w-6 h-6 mt-1 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600" />
          <span className="text-base font-bold text-indigo-900">Otorgo mi consentimiento expreso para la administración de anestesia/sedación.</span>
        </label>
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
        <h1 className="text-4xl font-black text-slate-800 mb-4">¡Registro Exitoso!</h1>
        <p className="text-xl text-slate-600 mb-8 max-w-lg">Su consentimiento ha sido guardado de forma segura en su historia clínica.</p>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
          <p className="text-lg font-bold text-[#0056b3]">Por favor, devuelva esta tablet al personal de recepción.</p>
        </div>
        <button onClick={() => window.location.reload()} className="mt-12 text-sm text-slate-400 hover:text-slate-600">Recargar formulario ahora</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 min-h-[80vh] flex flex-col">
        
        <div className="bg-[#0056b3] p-6 md:p-8 text-center text-white relative flex-shrink-0">
          {viewMode !== 'home' && (
            <button onClick={() => setViewMode('home')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-blue-700 rounded-full transition text-blue-100">
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          <img src={logo} alt="Dr. Víctor Logo" className="h-10 md:h-12 mx-auto mb-3 brightness-0 invert" /> {/* */}
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Kiosco de Registro</h1>
        </div>

        <div className="flex-1">
          {viewMode === 'home' && (
            <div className="p-8 md:p-16 flex flex-col items-center justify-center h-full space-y-8">
              <h2 className="text-2xl font-bold text-slate-700 mb-4">¿Es su primera vez con el Dr. Víctor?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <button onClick={() => setViewMode('new')} className="group flex flex-col items-center p-10 border-2 border-gray-200 rounded-3xl hover:border-[#0056b3] hover:bg-blue-50 transition shadow-sm">
                  <UserPlus className="w-16 h-16 text-[#0056b3] mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-2xl font-black text-slate-800">Soy Paciente Nuevo</span>
                  <span className="text-slate-500 mt-2 text-center text-sm">Crear mi historia clínica desde cero.</span>
                </button>
                <button onClick={() => setViewMode('existing')} className="group flex flex-col items-center p-10 border-2 border-gray-200 rounded-3xl hover:border-[#0056b3] hover:bg-blue-50 transition shadow-sm">
                  <UserCheck className="w-16 h-16 text-[#0056b3] mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-2xl font-black text-slate-800">Ya soy Paciente</span>
                  <span className="text-slate-500 mt-2 text-center text-sm">Ya he venido antes a consulta.</span>
                </button>
              </div>
            </div>
          )}

          {viewMode === 'existing' && (
            <div className="p-8 md:p-16 flex flex-col items-center justify-center h-full">
              <div className="w-full max-w-md bg-slate-50 p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
                <Search className="w-12 h-12 text-[#0056b3] mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Búsqueda Rápida</h2>
                <p className="text-slate-500 mb-8 text-sm">Ingrese su número de cédula para encontrar su ficha médica y firmar su consentimiento de hoy.</p>
                <form onSubmit={handleSearch} className="space-y-4">
                  <input type="text" required value={searchCedula} onChange={e => setSearchCedula(e.target.value)} placeholder="Ej: 15300400" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-center text-2xl font-bold tracking-widest bg-white" />
                  <button type="submit" disabled={isSearching} className="w-full py-4 bg-[#0056b3] text-white text-lg font-black rounded-xl hover:bg-blue-700 transition shadow-md flex justify-center items-center gap-2 disabled:opacity-70">
                    {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
                    {isSearching ? 'Buscando...' : 'Buscar mi Ficha'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {viewMode === 'existing-consent' && existingPatient && (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col items-center justify-center">
              <div className="w-full max-w-3xl">
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Ficha Encontrada</p>
                    <h2 className="text-2xl font-black text-slate-800">Hola, {existingPatient.name}</h2>
                    <p className="text-slate-500 font-mono mt-1">C.I: {existingPatient.cedula}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-2">¿Qué procedimiento se realizará el día de hoy? *</label>
                  <select required value={newTreatmentSelected} onChange={e => setNewTreatmentSelected(e.target.value)} className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-white font-bold text-[#0056b3]">
                    <option value="">Seleccione el procedimiento...</option>
                    {treatmentsList.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {requiresConsent && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 pb-2 mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-[#0056b3] w-8 h-8 rounded-full flex items-center justify-center text-sm">📝</span> 
                    Consentimiento del Procedimiento
                  </h2>
                  <GeneralConsentText />

                  {isMinorExisting && (
                    <div className="mb-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl shadow-sm">
                      <h3 className="text-amber-800 font-bold mb-3 uppercase tracking-wide text-sm">⚠️ Autorización de Representante Legal</h3>
                      <p className="text-base text-amber-900 leading-relaxed font-medium">
                        "Yo, <input type="text" required placeholder="Nombre del Representante" className="border-b-2 border-amber-400 bg-transparent outline-none px-2 py-1 font-bold text-slate-900 placeholder-amber-700/50 w-64" value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})} />, identificado(a) con la cédula de identidad <input type="text" required placeholder="Nro. Cédula" className="border-b-2 border-amber-400 bg-transparent outline-none px-2 py-1 font-bold text-slate-900 placeholder-amber-700/50 w-32" value={formData.guardian_cedula} onChange={e => setFormData({...formData, guardian_cedula: e.target.value})} />, autorizo al Dr. Víctor Manrique a realizar a el(la) paciente <span className="font-bold underline decoration-amber-400 decoration-2">{existingPatient.name}</span> el procedimiento aquí estipulado."
                      </p>
                    </div>
                  )}

                  <label className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition shadow-sm">
                    <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="w-6 h-6 mt-1 text-[#0056b3] rounded border-gray-300 focus:ring-[#0056b3]" />
                    <span className="text-base font-bold text-slate-800">He leído la información y otorgo mi consentimiento general.</span>
                  </label>
                </div>
                )}

                {requiresAnesthesia && (
                  <AnesthesiaConsentText 
                    isMinor={isMinorExisting} 
                    patientName={existingPatient.name} patientCedula={existingPatient.cedula}
                    guardianName={formData.guardian_name} guardianCedula={formData.guardian_cedula}
                    treatment={newTreatmentSelected}
                  />
                )}

                <div className="mt-8 text-center">
                  <button type="submit" disabled={isSubmitting || !selectedProcedure || (requiresConsent && !acceptedTerms) || (requiresAnesthesia && !acceptedAnesthesiaTerms)} className="w-full md:w-auto md:px-16 py-5 bg-[#0056b3] text-white text-xl font-black rounded-2xl hover:bg-blue-700 transition shadow-lg inline-flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <CheckCircle2 className="w-8 h-8" />}
                    {isSubmitting ? 'Guardando...' : 'Firmar y Finalizar'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {viewMode === 'new' && (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
                  <span className="bg-blue-100 text-[#0056b3] w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 
                  Datos Personales y Procedimiento
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Procedimiento a realizar *</label>
                    <select required value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-blue-50/50 font-bold text-[#0056b3]">
                      <option value="">Seleccione el procedimiento...</option>
                      {treatmentsList.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo *</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Cédula o Pasaporte *</label><input type="text" required value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Teléfono *</label><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Edad *</label><input type="number" required value={formData.edad} onChange={e => setFormData({...formData, edad: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50" /></div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sexo *</label>
                      <select required value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50">
                        <option value="">Seleccione</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Estado</label>
                      <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50">
                        <option value="">Seleccione</option>{VZLA_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Dirección Exacta</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50" /></div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
                  <span className="bg-blue-100 text-[#0056b3] w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 
                  Perfil Físico y Clínico
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Peso (kg) *</label><input type="number" step="0.1" required value={formData.initial_weight} onChange={e => setFormData({...formData, initial_weight: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50" /></div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Estatura (m) *</label>
                    <input type="text" required value={formData.height} onChange={e => { let val = e.target.value.replace(/[^0-9]/g, ''); if (val.length > 1) val = val.slice(0, 1) + '.' + val.slice(1, 3); setFormData({...formData, height: val}); }} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50 font-mono" placeholder="Ej: 1.70" maxLength={4} />
                  </div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Índice Masa Corporal</label><input type="text" readOnly value={formData.bmi} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-100 font-bold" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Fuma?</label><select value={formData.smokes} onChange={e => setFormData({...formData, smokes: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl"><option value="">Seleccione</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Es asmático?</label><select value={formData.asthmatic} onChange={e => setFormData({...formData, asthmatic: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl"><option value="">Seleccione</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Alergia a meds?</label><select value={formData.allergic} onChange={e => setFormData({...formData, allergic: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl"><option value="">Seleccione</option><option value="Si">Sí</option><option value="No">No</option></select></div>
                </div>
                {formData.allergic === 'Si' && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-red-600 mb-2">¿A cuáles medicamentos es alérgico?</label>
                    <input type="text" required value={formData.allergies_detail} onChange={e => setFormData({...formData, allergies_detail: e.target.value})} className="w-full p-4 border-2 border-red-300 rounded-xl bg-red-50" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Antecedentes Médicos</label>
                  <textarea rows="3" value={formData.medical_history} onChange={e => setFormData({...formData, medical_history: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-slate-50"></textarea>
                </div>
              </section>

              {requiresConsent && (
              <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 pb-2 mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-[#0056b3] w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span> 
                  Información y Consentimiento
                </h2>
                <GeneralConsentText />
                
                {isMinorNew && (
                  <div className="mb-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl shadow-sm">
                    <h3 className="text-amber-800 font-bold mb-3 uppercase tracking-wide text-sm flex items-center gap-2">⚠️ Autorización de Representante Legal</h3>
                    <p className="text-base text-amber-900 leading-relaxed font-medium">
                      "Yo, <input type="text" required placeholder="Nombre del Representante" className="border-b-2 border-amber-400 bg-transparent outline-none px-2 py-1 font-bold text-slate-900 placeholder-amber-700/50 w-64" value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})} />, identificado(a) con la cédula de identidad <input type="text" required placeholder="Nro. Cédula" className="border-b-2 border-amber-400 bg-transparent outline-none px-2 py-1 font-bold text-slate-900 placeholder-amber-700/50 w-32" value={formData.guardian_cedula} onChange={e => setFormData({...formData, guardian_cedula: e.target.value})} />, autorizo al Dr. Víctor Manrique a realizar a el(la) paciente <span className="font-bold underline decoration-amber-400 decoration-2">{formData.name || '____________________'}</span> el procedimiento aquí estipulado."
                    </p>
                  </div>
                )}

                <label className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition shadow-sm">
                  <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="w-6 h-6 mt-1 text-[#0056b3] rounded border-gray-300 focus:ring-[#0056b3]" />
                  <span className="text-base font-bold text-slate-800">He leído la información y otorgo mi consentimiento general.</span>
                </label>
              </section>
              )}

              {requiresAnesthesia && (
                <AnesthesiaConsentText 
                  isMinor={isMinorNew} 
                  patientName={formData.name} patientCedula={formData.cedula}
                  guardianName={formData.guardian_name} guardianCedula={formData.guardian_cedula}
                  treatment={formData.treatment}
                />
              )}

              <div className="pt-6 border-t border-slate-200 text-center">
                <button type="submit" disabled={isSubmitting || !selectedProcedure || (requiresConsent && !acceptedTerms) || (requiresAnesthesia && !acceptedAnesthesiaTerms)} className="w-full md:w-auto md:px-16 py-5 bg-[#0056b3] text-white text-xl font-black rounded-2xl hover:bg-blue-700 transition shadow-lg inline-flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <CheckCircle2 className="w-8 h-8" />}
                  {isSubmitting ? 'Procesando...' : 'Finalizar Registro y Aceptar'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
