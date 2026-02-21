import { Search, CircleDot, Filter } from 'lucide-react';

export default function Filters({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, filterTreatment, setFilterTreatment, uniqueTreatments }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="relative md:col-span-2">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <input type="text" placeholder="Buscar por nombre, teléfono, cédula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3]" />
      </div>
      <div className="relative">
        <CircleDot className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
          <option value="Todos">Estatus: Todos</option>
          <option value="Por Contactar">🔔 Por Contactar</option>
          <option value="Contactados">✅ Contactados</option>
          <option value="Solo Leads">🎯 Solo Leads</option>
          <option value="Solo Pacientes">⭐ Solo Pacientes</option>
        </select>
      </div>
      <div className="relative">
        <Filter className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <select value={filterTreatment} onChange={(e) => setFilterTreatment(e.target.value)} className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
          {uniqueTreatments.map(t => <option key={t} value={t}>{t === 'Todos' ? 'Tratamiento: Todos' : t}</option>)}
        </select>
      </div>
    </div>
  );
}