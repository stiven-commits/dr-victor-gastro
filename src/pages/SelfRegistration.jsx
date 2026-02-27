import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import logo from '../assets/logo-dr-victor-horizontal-300x66.png';

const API_KEY = 'Bearer v2ew5w8mAq3';
const POST_URL = 'https://victorbot.sosmarketing.agency/webhook/create-lead';
const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];
const TREATMENTS = ['Evaluación / Consulta', 'Endoscopia Digestiva Superior', 'Colonoscopia', 'Colocación de Balón Gástrico', 'Retiro de Balón Gástrico', 'Ecoendoscopia', 'Polipectomía', 'Otro'];

export default function SelfRegistration() {
  const [formData, setFormData] = useState({
    name: '', cedula: '', phone: '', email: '', edad: '', sexo: '',
    state: '', address: '', treatment: '',
    initial_weight: '', height: '', bmi: '',
    smokes: '', asthmatic: '', allergic: '', allergies_detail: '',
    medical_history: '',
    guardian_name: '', guardian_cedula: '' // Nuevos campos para menores
  });
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Ocultar la Navbar y el Footer web para que parezca una App nativa
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
  // Calcular IMC automáticamente
  useEffect(() => {
    const weight = parseFloat(formData.initial_weight);
    const heightM = parseFloat(formData.height); // Ya viene en metros (ej. 1.75)
    if (weight > 0 && heightM > 0) {
      const bmiValue = (weight / (heightM * heightM)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi: bmiValue }));
    } else {
      setFormData(prev => ({ ...prev, bmi: '' }));
    }
  }, [formData.initial_weight, formData.height]);

  // Lógica de menor de edad
  const ageNum = parseInt(formData.edad);
  const isMinor = !isNaN(ageNum) && ageNum < 18;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("Debe leer y aceptar el consentimiento informado para continuar.");
      return;
    }
    if (isMinor && (!formData.guardian_name || !formData.guardian_cedula)) {
      alert("Al ser el paciente menor de edad, los datos del representante son obligatorios.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Crear el sello legal de consentimiento
      const consentDate = new Date().toLocaleString('es-VE');
      const consenterName = isMinor 
        ? `${formData.guardian_name} (C.I: ${formData.guardian_cedula}) como representante legal del menor` 
        : `${formData.name} (C.I: ${formData.cedula})`;
      
      const consentSignature = `\n\n===============================\nFIRMA DIGITAL DE CONSENTIMIENTO\n===============================\nAceptado por: ${consenterName}\nFecha y Hora: ${consentDate}\nProcedimiento Autorizado: ${formData.treatment}\nDeclaración: Entiende los riesgos y complicaciones potenciales, y otorga su consentimiento voluntario.`;

      // 2. Adjuntarlo a los antecedentes médicos para que se guarde sin alterar la base de datos
      const finalMedicalHistory = (formData.medical_history || 'Sin antecedentes registrados.') + consentSignature;

      const payload = {
        ...formData,
        medical_history: finalMedicalHistory,
        is_patient: true,
        username: 'Auto Registro Tablet'
      };

      await fetch(POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify(payload)
      });

      setIsSuccess(true);
      setTimeout(() => { window.location.reload(); }, 10000);
    } catch (error) {
      console.error('Error en autoregistro:', error);
      alert('Hubo un error al enviar sus datos. Por favor, avise en recepción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
        <h1 className="text-4xl font-black text-slate-800 mb-4">¡Registro Exitoso!</h1>
        <p className="text-xl text-slate-600 mb-8 max-w-lg">Sus datos y su consentimiento han sido guardados de forma segura en su historia clínica.</p>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
          <p className="text-lg font-bold text-[#0056b3]">Por favor, devuelva esta tablet al personal de recepción.</p>
        </div>
        <button onClick={() => window.location.reload()} className="mt-12 text-sm text-slate-400 hover:text-slate-600">Recargar formulario ahora</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
        
        <div className="bg-[#0056b3] p-8 text-center text-white">
          <img src={logo} alt="Dr. Víctor Logo" className="h-12 mx-auto mb-4 brightness-0 invert" />
          <h1 className="text-3xl font-black tracking-tight">Registro de Paciente</h1>
          <p className="text-blue-100 mt-2 text-lg">Por favor, complete sus datos para la historia clínica.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* SECCIÓN 1: Datos Personales */}
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
                  {TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo *</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Cédula o Pasaporte *</label><input type="text" required value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Teléfono *</label><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50" /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Edad *</label><input type="number" required value={formData.edad} onChange={e => setFormData({...formData, edad: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50" /></div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sexo *</label>
                  <select required value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50">
                    <option value="">Seleccione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Estado</label>
                  <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50">
                    <option value="">Seleccione</option>{VZLA_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Dirección Exacta</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50" /></div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: Datos Físicos y Clínicos */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-[#0056b3] w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 
              Perfil Físico y Clínico
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Peso (kg) *</label><input type="number" step="0.1" required value={formData.initial_weight} onChange={e => setFormData({...formData, initial_weight: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50" /></div>
                <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Estatura (m) *</label>
                    <input 
                        type="text" 
                        required 
                        value={formData.height} 
                        onChange={e => {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length > 1) val = val.slice(0, 1) + '.' + val.slice(1, 3);
                        setFormData({...formData, height: val});
                        }} 
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50 font-mono" 
                        placeholder="Ej: 1.70" 
                        maxLength={4} 
                    />
                </div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Índice Masa Corporal</label><input type="text" readOnly value={formData.bmi} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-100 text-lg font-bold text-slate-600" placeholder="Auto-calculado" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">¿Fuma?</label>
                <select value={formData.smokes} onChange={e => setFormData({...formData, smokes: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50">
                  <option value="">Seleccione</option><option value="Si">Sí</option><option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">¿Es asmático?</label>
                <select value={formData.asthmatic} onChange={e => setFormData({...formData, asthmatic: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50">
                  <option value="">Seleccione</option><option value="Si">Sí</option><option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">¿Alergia a medicamentos?</label>
                <select value={formData.allergic} onChange={e => setFormData({...formData, allergic: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50">
                  <option value="">Seleccione</option><option value="Si">Sí</option><option value="No">No</option>
                </select>
              </div>
            </div>

            {formData.allergic === 'Si' && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-red-600 mb-2">¿A cuáles medicamentos es alérgico?</label>
                <input type="text" required value={formData.allergies_detail} onChange={e => setFormData({...formData, allergies_detail: e.target.value})} className="w-full p-4 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 text-lg bg-red-50" placeholder="Especifique los medicamentos..." />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Antecedentes Médicos (Cirugías, enfermedades...)</label>
              <textarea rows="3" value={formData.medical_history} onChange={e => setFormData({...formData, medical_history: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0056b3] text-lg bg-slate-50"></textarea>
            </div>
          </section>

          {/* SECCIÓN 3: Consentimiento Informado */}
          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 pb-2 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-[#0056b3] w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span> 
              Información y Consentimiento
            </h2>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 h-72 overflow-y-auto mb-6 shadow-inner text-sm text-slate-700 space-y-4">
              <h3 className="font-black text-base text-slate-900">Información y consentimiento:</h3>
              <p><strong>1. Naturaleza y Propósito del Procedimiento:</strong><br/>He sido informado(a) sobre la naturaleza, el propósito y la forma en que se realizará el procedimiento endoscópico propuesto.</p>
              <p><strong>2. Riesgos y Complicaciones:</strong><br/>El Dr. Víctor Manrique me ha explicado los riesgos, complicaciones y molestias más frecuentes y relevantes que podrían surgir durante o después del procedimiento. Entiendo que, aunque son poco comunes, existen riesgos como sangrado, perforación, infecciones y reacciones adversas a la sedación o anestesia (si se utiliza). Se me ha proporcionado información detallada sobre estas complicaciones, la cual he leído y comprendido (ver información al reverso de esta hoja).</p>
              <p><strong>3. Alternativas de Tratamiento:</strong><br/>Se me han informado sobre las alternativas de tratamiento disponibles para mi condición, incluyendo sus riesgos y beneficios.</p>
              <p><strong>4. Situaciones Imprevistas:</strong><br/>Entiendo que durante el procedimiento pueden surgir situaciones imprevistas que requieran la realización de procedimientos adicionales si el médico tratante lo considera necesario para mi bienestar.</p>
              <p><strong>5. Oportunidad de Preguntas:</strong><br/>He tenido la oportunidad de hacer todas las preguntas que he considerado necesarias sobre el procedimiento, los riesgos, los beneficios y las alternativas, y todas mis dudas han sido aclaradas de manera satisfactoria.</p>
              <p><strong>6. Derecho a Revocar el Consentimiento:</strong><br/>Entiendo que tengo el derecho de revocar este consentimiento en cualquier momento antes de que se inicie el procedimiento.</p>
              <p><strong>7. Consentimiento Voluntario:</strong><br/>Declaro que he leído y comprendido completamente la información proporcionada en este documento y que doy mi consentimiento libre y voluntariamente para que se me realice el procedimiento endoscópico descrito.</p>
              
              <hr className="my-6 border-slate-300" />
              
              <h3 className="font-black text-base text-slate-900">Complicaciones potenciales de la endoscopia digestiva:</h3>
              <p><strong>ENDOSCOPIA DIGESTIVA SUPERIOR (GASTROSCOPIA)</strong><br/>Aunque existen pocos estudios prospectivos de calidad se considera que el porcentaje de complicaciones es muy bajo (0,13%), con un índice de mortalidad del 0,004%. Las principales complicaciones son cardiopulmonares y relacionadas con la analgesia, perforación, sangrado y de tipo infeccioso. También se han descrito efectos menores y transitorios, tales como: dolor abdominal autolimitado, fiebre, vómito, distensión abdominal, dificultad deglutoria y flebitis periférica.</p>
              <p><strong>COMPLICACIONES DE LA ANALGESIA / CARDIOPULMONARES</strong><br/>Se estima que acontecen en uno de cada 1000 exploraciones con un espectro de presentación muy amplio que oscila desde hipoxemia transitoria hasta casos de fallecimiento. Las principales complicaciones cardiopulmonares relacionadas con analgesia son: hipoxemia, obstrucción de la vía aérea, aspiración, hipotensión, cuadros vasovagales, arritmia e infarto de miocardio.</p>
              <p><strong>INFECCIOSAS</strong><br/>Aunque el porcentaje de bacteriemia descrito es variable, el riesgo de padecer endocarditis es muy bajo excepto en las dilataciones de estenosis, tumores, osteofitos de varices esofágicas.<br/>Perforación (0,0003%). Se asocia a una mortalidad elevada. Es más usual en el esófago cervical y se relaciona con divertículo de Zenker, estenosis, tumores, osteofitos anteriores. La dilatación de la estenosis por cáusticos (17%), acalasia y tumores implica un riesgo elevado de perforación.</p>
              <p><strong>HEMORRAGIA</strong><br/>El riesgo de sufrir esta complicación es muy bajo y casi siempre se asocia con coagulopatías (trastorno de la coagulación).</p>
              <p><strong>ENDOSCOPIA DIGESTIVA INFERIOR (COLONOSCOPIA)</strong><br/>La colonoscopia se asocia a un índice reseñable de complicaciones (0,2%), sobre todo cuando se aplican métodos terapéuticos; a pesar de una técnica cuidadosa tiene una mortalidad del 0,07%. En conjunto se estima que se produce una complicación grave (perforación o hematoma) en uno de cada 1000 procedimientos de colonoscopia. Las complicaciones más frecuentes son: reacciones adversas a los fármacos sobre todo hipoxemia, hemorragia y perforación. La experiencia del endoscopista, la cuidadosa realización de la técnica y la adecuada monitorización del paciente son factores que previenen los riesgos inherentes a la técnica.</p>
              <p><strong>PERFORACIÓN</strong><br/>Las principales causas son mecánicas y por electrocauterio. Son factores predisponentes la dificultad para explorar el colon sigmoides y transverso, el sexo femenino, la extirpación de lesiones en ciego y colon ascendente. El porcentaje descrito oscila entre 0,1 y 0,3% y es ligeramente mayor en las polipectomías (extracción de pólipos).</p>
              <p><strong>HEMORRAGIA</strong><br/>El porcentaje es de 0,2 - 0,6%. El riesgo es más elevado en el caso de la polipectomía y sobre todo con la extirpación de pólipos mayores de 2 cm. El sangrado puede detectarse durante la exploración o de forma diferida. En la mayoría de las ocasiones se soluciona con procedimiento endoscópico.</p>
            </div>

            {/* AUTORIZACIÓN PARA MENORES DE EDAD (Aparece dinámicamente) */}
            {isMinor && (
              <div className="mb-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl shadow-sm">
                <h3 className="text-amber-800 font-bold mb-3 uppercase tracking-wide text-sm flex items-center gap-2">
                  ⚠️ Autorización de Representante Legal
                </h3>
                <p className="text-base text-amber-900 leading-relaxed font-medium">
                  "Yo, <input type="text" required placeholder="Nombre del Representante" className="border-b-2 border-amber-400 bg-transparent outline-none px-2 py-1 font-bold text-slate-900 placeholder-amber-700/50 w-64" value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})} />, identificado(a) con la cédula de identidad <input type="text" required placeholder="Nro. Cédula" className="border-b-2 border-amber-400 bg-transparent outline-none px-2 py-1 font-bold text-slate-900 placeholder-amber-700/50 w-32" value={formData.guardian_cedula} onChange={e => setFormData({...formData, guardian_cedula: e.target.value})} />, autorizo al Dr. Víctor Manrique a realizar a el(la) paciente <span className="font-bold underline decoration-amber-400 decoration-2">{formData.name || '____________________'}</span> el procedimiento aquí estipulado."
                </p>
              </div>
            )}

            <label className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition">
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="w-6 h-6 mt-1 text-[#0056b3] rounded border-gray-300 focus:ring-[#0056b3]" />
              <span className="text-base font-bold text-slate-800">
                He leído detenidamente la información, entiendo los riesgos y complicaciones potenciales, y otorgo mi consentimiento voluntario para proceder.
              </span>
            </label>
          </section>

          {/* Botón de Envío */}
          <div className="pt-6 border-t border-slate-200">
            <button type="submit" disabled={isSubmitting || !acceptedTerms || !formData.treatment} className="w-full md:w-auto md:px-16 py-5 bg-[#0056b3] text-white text-xl font-black rounded-2xl hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mx-auto">
              {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <CheckCircle2 className="w-8 h-8" />}
              {isSubmitting ? 'Procesando...' : 'Finalizar Registro y Aceptar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

