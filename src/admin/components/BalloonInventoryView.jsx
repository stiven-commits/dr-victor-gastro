import React, { useState, useEffect } from 'react';
import { Package, Plus, History, ArrowDownCircle, ArrowUpCircle, Loader2, X, Trash2, AlertTriangle, Filter } from 'lucide-react';

const API_KEY = 'Bearer v2ew5w8mAq3';
const GET_INVENTORY_URL = 'https://victorbot.sosmarketing.agency/webhook/api-balloon-inventory';
const POST_STOCK_URL = 'https://victorbot.sosmarketing.agency/webhook/api-add-balloon-stock';
const DELETE_LOG_URL = 'https://victorbot.sosmarketing.agency/webhook/api-delete-balloon-log';

const BALLOON_BRANDS = [
  { id: 'allurion', name: 'Allurion', duration: '4 Meses', color: 'blue' },
  { id: 'ovalsilhouette', name: 'OvalSilhouette', duration: '6 Meses', color: 'purple' },
  { id: 'spatz3', name: 'Spatz3', duration: '1 Año', color: 'amber' }
];

export default function BalloonInventoryView() {
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Compra
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ brand_id: 'allurion', quantity: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  // Estados para Filtros
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GET_INVENTORY_URL}?t=${new Date().getTime()}`, { 
        headers: { 'Authorization': API_KEY } 
      });
      const text = await res.text();
      if (!text || text.trim() === "") return;

      let data = JSON.parse(text);
      if (Array.isArray(data)) data = data.length > 0 ? data[0] : {};

      const normalizeToArray = (item) => (!item ? [] : Array.isArray(item) ? item : [item]);
      
      setInventory(normalizeToArray(data.summary));
      
      const rawLogs = normalizeToArray(data.logs);
      const uniqueLogs = [...new Map(rawLogs.map(item => [item['id'], item])).values()];
      setHistory(uniqueLogs);
      
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(POST_STOCK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: API_KEY },
        body: JSON.stringify({
          ...form,
          type: 'entry',
          registered_by: JSON.parse(localStorage.getItem('currentUser') || '{}').username || 'Admin'
        })
      });
      setIsModalOpen(false);
      fetchInventory();
      setForm({ brand_id: 'allurion', quantity: '', notes: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de borrar este registro? El stock se recalculará automáticamente.")) return;
    
    try {
      await fetch(DELETE_LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: API_KEY },
        body: JSON.stringify({ id })
      });
      fetchInventory();
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("No se pudo eliminar el registro");
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesBrand = filterBrand === 'all' || item.brand_id === filterBrand;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesBrand && matchesType;
  });

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-slate-500">Control de stock físico de dispositivos gástricos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#0056b3] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-900/10">
          <Plus size={20} /> Registrar Compra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BALLOON_BRANDS.map((brand) => {
          const brandData = inventory.find(i => i?.brand_id === brand.id);
          const stock = brandData?.current_stock ? parseInt(brandData.current_stock) : 0;
          const isLowStock = stock < 5;

          const bgClass = isLowStock ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100';
          const iconBg = isLowStock ? 'bg-red-100 text-red-600' : `bg-${brand.color}-100 text-${brand.color}-700`;
          const textClass = isLowStock ? 'text-red-700' : 'text-slate-800';

          return (
            <div key={brand.id} className={`${bgClass} p-6 rounded-2xl border shadow-sm flex items-center gap-5 transition-all hover:shadow-md relative overflow-hidden`}>
              {isLowStock && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 font-bold rounded-bl-lg">STOCK BAJO</div>}
              
              <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
                {isLowStock ? <AlertTriangle size={28} /> : <Package size={28} />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{brand.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${textClass}`}>{stock}</span>
                  <span className="text-sm font-medium text-slate-400">unid.</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Duración: {brand.duration}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 self-start md:self-center">
            <History size={18} /> Historial de Movimientos
          </h3>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Filter size={14} className="text-slate-400"/>
              <select className="text-sm font-bold text-slate-600 bg-transparent outline-none cursor-pointer" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
                <option value="all">Todas las Marcas</option>
                {BALLOON_BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Filter size={14} className="text-slate-400"/>
              <select className="text-sm font-bold text-slate-600 bg-transparent outline-none cursor-pointer" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">Todos los Tipos</option>
                <option value="entry">Entradas (Compras)</option>
                <option value="exit">Salidas (Pacientes)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Marca</th>
                <th className="px-6 py-4 font-semibold">Cant.</th>
                <th className="px-6 py-4 font-semibold">Detalle / Paciente</th>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 text-slate-400 flex flex-col items-center gap-2"><Loader2 className="animate-spin text-blue-500"/> Cargando datos...</td></tr>
              ) : filteredHistory.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No se encontraron movimientos con estos filtros.</td></tr>
              ) : (
                filteredHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/30 transition group">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(log.created_at).toLocaleString('es-VE', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4">
                      {log.type === 'entry' ? 
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold flex w-fit items-center gap-1"><ArrowUpCircle size={12} /> Entrada</span> : 
                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-bold flex w-fit items-center gap-1"><ArrowDownCircle size={12} /> Salida</span>
                      }
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{BALLOON_BRANDS.find((b) => b.id === log.brand_id)?.name || log.brand_id}</td>
                    <td className="px-6 py-4 font-mono font-bold text-base text-slate-800">{log.quantity}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={log.patient_name || log.notes}>
                      {log.patient_name ? <span className="font-semibold text-slate-700">{log.patient_name}</span> : log.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{log.registered_by}</td>
                    
                    {/* BOTÓN DE ACCIÓN CORREGIDO: Más contraste y siempre visible */}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar movimiento (revertir stock)"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Plus size={18}/> Nueva Compra</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded-lg transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Marca del Dispositivo</label>
                <div className="relative">
                  <select className="w-full p-3 pl-10 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
                    {BALLOON_BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.duration})</option>)}
                  </select>
                  <Package className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cantidad</label>
                <input required type="number" min="1" className="w-full p-3 border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Notas de Referencia</label>
                <textarea className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="3" placeholder="Ej: Factura #1234 - Proveedor X"></textarea>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-[#0056b3] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition shadow-lg shadow-blue-900/10 disabled:opacity-70 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="animate-spin" /> : 'Confirmar Ingreso al Inventario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
