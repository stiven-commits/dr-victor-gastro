import { X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { TREATMENT_OPTIONS } from '../utils/helpers';

export function PatientModal({ isOpen, onClose, medicalData, setMedicalData, handleHeightChange, handleSavePatient, leadName }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center bg-[#0056b3] p-4 text-white"><h3 className="font-bold">Datos Clínicos del Paciente</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={handleSavePatient} className="p-6 space-y-4">
          <p className="text-sm text-slate-600 mb-2">Ingresa los datos base para iniciar la ficha clínica de <strong className="font-bold text-slate-800">{leadName}</strong>.</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Cédula</label><input type="text" value={medicalData.cedula} onChange={(e) => setMedicalData({...medicalData, cedula: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none" placeholder="Ej: V-12345678" /></div>
            <div><label className="block text-sm font-semibold mb-1">Edad</label><input type="number" value={medicalData.edad} onChange={(e) => setMedicalData({...medicalData, edad: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none" placeholder="Años" min="1" max="120" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Peso Inicial (kg)</label><input type="number" step="0.01" required value={medicalData.weight} onChange={(e) => setMedicalData({...medicalData, weight: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none" placeholder="Ej: 85.5" /></div>
            <div><label className="block text-sm font-semibold mb-1">Estatura (metros)</label><input type="text" required value={medicalData.height} onChange={handleHeightChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#0056b3] outline-none font-mono" placeholder="Ej: 1.75" maxLength={4} /></div>
          </div>
          <div className="pt-2 mt-2"><button type="submit" className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition shadow-sm">Confirmar e Iniciar Ficha</button></div>
        </form>
      </div>
    </div>
  );
}

export function EditLeadModal({ isOpen, onClose, editFormData, setEditFormData, handleSaveEdit }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center bg-slate-800 p-4 text-white"><h3 className="font-bold">Editar Lead</h3><button onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Nombre</label><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-slate-800" /></div>
            <div><label className="block text-sm font-semibold mb-1">Teléfono</label><input type="text" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-slate-800" /></div>
          </div>
          <div><label className="block text-sm font-semibold mb-2">Tratamientos de Interés</label><div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border">{TREATMENT_OPTIONS.map(t => (<label key={t} className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" className="rounded text-slate-800 focus:ring-slate-800" checked={editFormData.treatments.includes(t)} onChange={(e) => e.target.checked ? setEditFormData({...editFormData, treatments: [...editFormData.treatments, t]}) : setEditFormData({...editFormData, treatments: editFormData.treatments.filter(item => item !== t)})} /> {t}</label>))}</div></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 shadow-sm">Guardar Cambios</button>
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