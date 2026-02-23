import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { TREATMENT_OPTIONS } from '../utils/helpers';

export function PatientModal({ isOpen, onClose, medicalData, setMedicalData, handleHeightChange, handleSavePatient, leadName }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
        <div className="flex justify-between items-center bg-[#0056b3] p-4 text-white"><h3 className="font-bold">Datos Clínicos del Paciente</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={handleSavePatient} className="p-6 space-y-4 overflow-y-auto">
          <p className="text-sm text-slate-600 mb-2">Ingresa los datos base para iniciar la ficha clínica de <strong className="font-bold text-slate-800">{leadName}</strong>.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Cédula</label><input type="text" value={medicalData.cedula} onChange={(e) => setMedicalData({...medicalData, cedula: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none" placeholder="Ej: V-12345678" /></div>
            <div><label className="block text-sm font-semibold mb-1">Edad</label><input type="number" value={medicalData.edad} onChange={(e) => setMedicalData({...medicalData, edad: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none" placeholder="Años" min="1" max="120" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Sexo</label>
              <select value={medicalData.sexo} onChange={(e) => setMedicalData({...medicalData, sexo: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none bg-white">
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div><label className="block text-sm font-semibold mb-1">Estatura (m)</label><input type="text" required value={medicalData.height} onChange={handleHeightChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none font-mono" placeholder="Ej: 1.75" maxLength={4} /></div>
          </div>

          <div><label className="block text-sm font-semibold mb-1">Peso Inicial (kg)</label><input type="number" step="0.01" required value={medicalData.weight} onChange={(e) => setMedicalData({...medicalData, weight: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none" placeholder="Ej: 85.5" /></div>

          <div>
            <label className="block text-sm font-semibold mb-1">Antecedentes Médicos</label>
            <textarea value={medicalData.medical_history} onChange={(e) => setMedicalData({...medicalData, medical_history: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none resize-none" rows="3" placeholder="Alergias, cirugías previas, enfermedades crónicas..."></textarea>
          </div>

          <div className="pt-2 mt-2"><button type="submit" className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition shadow-sm">Confirmar e Iniciar Ficha</button></div>
        </form>
      </div>
    </div>
  );
}

export function EditLeadModal({ isOpen, onClose, editFormData, setEditFormData, handleSaveEdit, leadToEdit, setDeleteModalOpen }) {
  if (!isOpen || !leadToEdit) return null;

  const handleHeight = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 1) val = val.slice(0, 1) + '.' + val.slice(1, 3);
    setEditFormData({...editFormData, height: val});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
        
        <div className={`flex justify-between items-center p-4 text-white ${leadToEdit.is_patient ? 'bg-purple-700' : 'bg-slate-800'}`}>
          <h3 className="font-bold text-lg">{leadToEdit.is_patient ? '⭐ Editar Paciente' : '🎯 Editar Lead'}</h3>
          <button type="button" onClick={onClose} className="hover:text-gray-200 transition"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Nombre</label><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} /></div>
            <div><label className="block text-sm font-semibold mb-1">Teléfono</label><input type="text" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} /></div>
            <div><label className="block text-sm font-semibold mb-1">Correo Electrónico</label><input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} placeholder="Opcional" className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Cédula</label><input type="text" value={editFormData.cedula} onChange={(e) => setEditFormData({...editFormData, cedula: e.target.value})} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} placeholder="V-12345678"/></div>
            <div><label className="block text-sm font-semibold mb-1">Edad</label><input type="number" value={editFormData.edad} onChange={(e) => setEditFormData({...editFormData, edad: e.target.value})} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${leadToEdit.is_patient ? 'focus:ring-purple-700' : 'focus:ring-slate-800'}`} placeholder="Años" min="1" max="120"/></div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tratamientos de Interés</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border">
              {TREATMENT_OPTIONS.map(t => (
                <label key={t} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" className={`rounded ${leadToEdit.is_patient ? 'text-purple-700 focus:ring-purple-700' : 'text-slate-800 focus:ring-slate-800'}`} checked={editFormData.treatments.includes(t)} onChange={(e) => e.target.checked ? setEditFormData({...editFormData, treatments: [...editFormData.treatments, t]}) : setEditFormData({...editFormData, treatments: editFormData.treatments.filter(item => item !== t)})} /> {t}
                </label>
              ))}
            </div>
          </div>

          {leadToEdit.is_patient && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-700">Sexo</label>
                  <select value={editFormData.sexo} onChange={(e) => setEditFormData({...editFormData, sexo: e.target.value})} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">Peso Inicial (kg)</label><input type="number" step="0.01" value={editFormData.initial_weight} onChange={(e) => setEditFormData({...editFormData, initial_weight: e.target.value})} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400" /></div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">Estatura (m)</label><input type="text" value={editFormData.height} onChange={handleHeight} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 font-mono" maxLength={4} /></div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-purple-700">Antecedentes Médicos</label>
                <textarea value={editFormData.medical_history} onChange={(e) => setEditFormData({...editFormData, medical_history: e.target.value})} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 resize-none" rows="3" placeholder="Alergias, cirugías previas, enfermedades crónicas..."></textarea>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
            <button type="button" onClick={() => setDeleteModalOpen(true)} className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-lg transition flex items-center gap-2">
              🗑️ Eliminar
            </button>
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

export function AddManualModal({ isOpen, onClose, newManualData, setNewManualData, handleCreateManual }) {
  if (!isOpen) return null;

  const handleHeight = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 1) val = val.slice(0, 1) + '.' + val.slice(1, 3);
    setNewManualData({...newManualData, height: val});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
        <div className="flex justify-between items-center bg-[#0056b3] p-4 text-white">
          <h3 className="font-bold">Añadir Registro Manual</h3>
          <button type="button" onClick={onClose} className="hover:text-red-200 transition"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleCreateManual} className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <input type="checkbox" id="isPatientToggle" checked={newManualData.is_patient} onChange={(e) => setNewManualData({...newManualData, is_patient: e.target.checked})} className="w-5 h-5 text-[#0056b3] rounded focus:ring-[#0056b3] cursor-pointer" />
            <label htmlFor="isPatientToggle" className="font-bold text-[#0056b3] cursor-pointer">
              {newManualData.is_patient ? "⭐ Guardar como Paciente Clínico" : "🎯 Guardar solo como Lead (Prospecto)"}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Nombre Completo *</label><input required type="text" value={newManualData.name} onChange={(e) => setNewManualData({...newManualData, name: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
            <div><label className="block text-sm font-semibold mb-1">Teléfono *</label><input required type="text" value={newManualData.phone} onChange={(e) => setNewManualData({...newManualData, phone: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
            <div><label className="block text-sm font-semibold mb-1">Correo (Email)</label><input type="email" value={newManualData.email} onChange={(e) => setNewManualData({...newManualData, email: e.target.value})} placeholder="Opcional" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Cédula</label><input type="text" value={newManualData.cedula} onChange={(e) => setNewManualData({...newManualData, cedula: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="V-12345678" /></div>
            <div><label className="block text-sm font-semibold mb-1">Edad</label><input type="number" value={newManualData.edad} onChange={(e) => setNewManualData({...newManualData, edad: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Años" min="1" max="120" /></div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tratamientos de Interés</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border">
              {TREATMENT_OPTIONS.map(t => (
                <label key={t} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" className="rounded text-[#0056b3] focus:ring-[#0056b3]" checked={newManualData.treatments.includes(t)} onChange={(e) => e.target.checked ? setNewManualData({...newManualData, treatments: [...newManualData.treatments, t]}) : setNewManualData({...newManualData, treatments: newManualData.treatments.filter(item => item !== t)})} /> {t}
                </label>
              ))}
            </div>
          </div>

          {newManualData.is_patient && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-purple-700">Sexo</label>
                  <select value={newManualData.sexo} onChange={(e) => setNewManualData({...newManualData, sexo: e.target.value})} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">Peso Inicial (kg)</label><input type="number" step="0.01" required={newManualData.is_patient} value={newManualData.weight} onChange={(e) => setNewManualData({...newManualData, weight: e.target.value})} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400" placeholder="Ej: 85.5" /></div>
                <div><label className="block text-sm font-semibold mb-1 text-purple-700">Estatura (m)</label><input type="text" required={newManualData.is_patient} value={newManualData.height} onChange={handleHeight} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 font-mono" placeholder="Ej: 1.75" maxLength={4} /></div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-purple-700">Antecedentes Médicos</label>
                <textarea value={newManualData.medical_history} onChange={(e) => setNewManualData({...newManualData, medical_history: e.target.value})} className="w-full p-2.5 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 resize-none" rows="3" placeholder="Alergias, cirugías previas, enfermedades crónicas..."></textarea>
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
