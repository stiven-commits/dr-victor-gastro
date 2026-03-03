import React, { useState, useEffect } from 'react';
import { Package, Plus, History, ArrowDownCircle, ArrowUpCircle, Loader2, X } from 'lucide-react';

const API_KEY = 'Bearer v2ew5w8mAq3';
const GET_INVENTORY_URL = 'https://victorbot.sosmarketing.agency/webhook/api-balloon-inventory';
const POST_STOCK_URL = 'https://victorbot.sosmarketing.agency/webhook/api-add-balloon-stock';

const BALLOON_BRANDS = [
  { id: 'allurion', name: 'Allurion', duration: '4 Meses', color: 'bg-blue-100 text-blue-700' },
  { id: 'ovalsilhouette', name: 'OvalSilhouette', duration: '6 Meses', color: 'bg-purple-100 text-purple-700' },
  { id: 'spatz3', name: 'Spatz3', duration: '1 Año', color: 'bg-amber-100 text-amber-700' }
];

export default function BalloonInventoryView() {
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ brand_id: 'allurion', quantity: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(GET_INVENTORY_URL, { headers: { 'Authorization': API_KEY } });
      
      // SOLUCIÓN: Leer como texto primero y verificar si está vacío
      const text = await res.text();
      if (!text || text.trim() === "") {
        console.warn("La API devolvió una respuesta vacía.");
        setInventory([]);
        setHistory([]);
        return;
      }

      const data = JSON.parse(text);
      setInventory(data.summary || []);
      setHistory(data.logs || []);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

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

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Inventario de Balones</h2>
          <p className="text-slate-500">Control de stock físico de dispositivos gástricos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0056b3] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg"
        >
          <Plus size={20} /> Registrar Compra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BALLOON_BRANDS.map((brand) => {
          const stock = inventory.find((i) => i.brand_id === brand.id)?.current_stock || 0;
          return (
            <div key={brand.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${brand.color} flex items-center justify-center`}>
                <Package size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {brand.name} ({brand.duration})
                </p>
                <p className="text-3xl font-black text-slate-800">
                  {stock} <span className="text-sm font-medium text-slate-400">unid.</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 bg-slate-50/50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <History size={18} /> Historial de Movimientos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Marca</th>
                <th className="px-6 py-4">Cantidad</th>
                <th className="px-6 py-4">Paciente / Nota</th>
                <th className="px-6 py-4">Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">Cargando...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">No hay movimientos registrados</td>
                </tr>
              ) : (
                history.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.created_at).toLocaleString('es-VE')}</td>
                    <td className="px-6 py-4">
                      {log.type === 'entry' ? (
                        <span className="text-green-600 font-bold flex items-center gap-1"><ArrowUpCircle size={14} /> Entrada</span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1"><ArrowDownCircle size={14} /> Salida</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{BALLOON_BRANDS.find((b) => b.id === log.brand_id)?.name || log.brand_id}</td>
                    <td className="px-6 py-4 font-mono font-bold text-lg">{log.quantity}</td>
                    <td className="px-6 py-4 text-slate-500">{log.patient_name || log.notes || '-'}</td>
                    <td className="px-6 py-4 text-xs">{log.registered_by}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">Registrar Compra (Entrada)</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Marca de Balón</label>
                <select
                  className="w-full p-3 border rounded-xl outline-none"
                  value={form.brand_id}
                  onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                >
                  {BALLOON_BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.duration})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Cantidad comprada</label>
                <input
                  required
                  type="number"
                  className="w-full p-3 border rounded-xl outline-none"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="Ej: 5"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Notas (Proveedor, factura...)</label>
                <textarea
                  className="w-full p-3 border rounded-xl outline-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows="2"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0056b3] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
              >
                {submitting ? <Loader2 className="animate-spin" /> : 'Confirmar Entrada'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
