import { Search } from 'lucide-react';
const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];

export default function Filters({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, filterTreatment, setFilterTreatment, dbTreatments = [], filterState, setFilterState }) {
return (
<div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
  <div className="relative md:col-span-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar..."
      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white"
    />
  </div>
  <div className="relative md:col-span-1">
    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
      <option value="Todos">Estatus: Todos</option>
      <option value="Por Contactar">Por Contactar</option>
      <option value="Contactados">Contactados</option>
      <option value="Solo Leads">Solo Leads</option>
      <option value="Solo Pacientes">Solo Pacientes</option>
    </select>
  </div>
  <div className="relative md:col-span-1">
    <select value={filterTreatment} onChange={(e) => setFilterTreatment(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
      <option value="Todos">Procedimiento: Todos</option>
      {dbTreatments.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
    </select>
  </div>
  <div className="relative md:col-span-1">
    <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
      <option value="Todos">Locación: Todas</option>
      {VZLA_STATES.map(st => <option key={st} value={st}>{st}</option>)}
    </select>
  </div>
</div>
);
}
