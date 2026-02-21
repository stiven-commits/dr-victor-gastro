export default function MetricsCards({ loading, totalLeads, uncontactedCount, activePatients }) {
  return (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
      <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-[#0056b3]">
        <p className="text-sm font-medium text-slate-500">Total Leads</p>
        <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : totalLeads}</p>
      </div>
      <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-orange-500">
        <p className="text-sm font-medium text-slate-500">Por Contactar</p>
        <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : uncontactedCount}</p>
      </div>
      <div className="p-6 bg-white border-l-4 shadow-sm rounded-2xl border-purple-500">
        <p className="text-sm font-medium text-slate-500">Pacientes Activos</p>
        <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '-' : activePatients}</p>
      </div>
    </div>
  );
}