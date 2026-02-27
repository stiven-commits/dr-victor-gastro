import { useEffect, useState } from 'react';
import { Search, CreditCard, X, Loader2 } from 'lucide-react';

const API_KEY = 'Bearer v2ew5w8mAq3';
const GET_URL = 'https://victorbot.sosmarketing.agency/webhook/api-finances';
const POST_URL = 'https://victorbot.sosmarketing.agency/webhook/api-add-payment';

const getStatus = (row) => row?.payment_status || row?.status || 'Pendiente';
const getPatientName = (row) => row?.patient_name || row?.name || 'N/A';
const getCedula = (row) => row?.cedula || row?.patient_cedula || 'N/A';
const getTreatment = (row) => row?.treatment_name || row?.treatment || 'N/A';
const getAgreed = (row) => Number(row?.agreed_price_usd ?? row?.total_price_usd ?? row?.agreed_amount_usd ?? 0);
const getPaid = (row) => Number(row?.paid_amount_usd ?? row?.total_paid_usd ?? row?.paid_usd ?? 0);
const getBalance = (row) => {
  const directBalance = row?.balance_usd ?? row?.pending_amount_usd;
  if (directBalance !== undefined && directBalance !== null) return Number(directBalance);
  return Math.max(0, getAgreed(row) - getPaid(row));
};
const getLeadTreatmentId = (row) => row?.lead_treatment_id || row?.id;

const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;

const getStatusBadge = (status) => {
  if (status === 'Pagado') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'Parcial') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-rose-100 text-rose-700 border-rose-200';
};

export default function FinancesView() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount_usd: '',
    payment_method: 'Zelle',
    reference_number: '',
    exchange_rate_bcv: '',
    amount_bs: ''
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchFinances = async () => {
    setLoading(true);
    try {
      const response = await fetch(GET_URL, {
        method: 'GET',
        headers: { 'Authorization': API_KEY, 'Accept': 'application/json' }
      });
      
      const text = await response.text();
      if (!text) {
        setFinances([]);
        return;
      }
      
      const data = JSON.parse(text);
      const normalizedData = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [];
      setFinances(normalizedData);
    } catch (error) {
      console.error("Error cargando finanzas:", error);
      setFinances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  useEffect(() => {
    const usd = parseFloat(paymentForm.amount_usd);
    const bcv = parseFloat(paymentForm.exchange_rate_bcv);

    if (!Number.isNaN(usd) && usd > 0 && !Number.isNaN(bcv) && bcv > 0) {
      setPaymentForm((prev) => ({ ...prev, amount_bs: (usd * bcv).toFixed(2) }));
    } else {
      setPaymentForm((prev) => ({ ...prev, amount_bs: '' }));
    }
  }, [paymentForm.amount_usd, paymentForm.exchange_rate_bcv]);

  const handleOpenPaymentModal = (record) => {
    setSelectedRecord(record);
    setPaymentForm({
      amount_usd: '',
      payment_method: 'Zelle',
      reference_number: '',
      exchange_rate_bcv: '',
      amount_bs: ''
    });
    setIsModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setPaymentForm({
      amount_usd: '',
      payment_method: 'Zelle',
      reference_number: '',
      exchange_rate_bcv: '',
      amount_bs: ''
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setSubmittingPayment(true);
    try {
      const payload = {
        lead_treatment_id: selectedRecord.lead_treatment_id,
        amount_usd: parseFloat(paymentForm.amount_usd),
        payment_method: paymentForm.payment_method,
        reference_number: paymentForm.reference_number || 'No aplica',
        exchange_rate_bcv: paymentForm.exchange_rate_bcv ? parseFloat(paymentForm.exchange_rate_bcv) : null,
        amount_bs: paymentForm.amount_bs ? parseFloat(paymentForm.amount_bs) : null,
        registered_by: currentUser.name || currentUser.username || 'Admin'
      };

      await fetch(POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: API_KEY,
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      handleClosePaymentModal();
      fetchFinances();
    } catch (error) {
      console.error('Error registrando pago:', error);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const filteredFinances = finances.filter((row) => {
    const status = getStatus(row);
    const matchesStatus = filterStatus === 'Todos' || status === filterStatus;

    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      getPatientName(row).toLowerCase().includes(term) ||
      getCedula(row).toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const selectedBalance = parseFloat(selectedRecord?.balance || 0);
  const showBsFields = paymentForm.payment_method === 'Pago Móvil' || paymentForm.payment_method === 'Transferencia (Bs)';

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-5">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-52 py-2.5 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] bg-white"
        >
          <option value="Todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Parcial">Parcial</option>
          <option value="Pagado">Pagado</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando finanzas...
          </div>
        ) : (
          <table className="w-full min-w-[980px] text-sm text-left">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Paciente</th>
                <th className="px-4 py-3 font-semibold">Tratamiento</th>
                <th className="px-4 py-3 font-semibold">Precio Acordado</th>
                <th className="px-4 py-3 font-semibold">Pagado</th>
                <th className="px-4 py-3 font-semibold">Saldo Pendiente</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFinances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-400">
                    No hay registros financieros para mostrar.
                  </td>
                </tr>
              ) : (
                filteredFinances.map((item, idx) => {
                  const status = item.payment_status || 'Pendiente';
                  const balance = parseFloat(item.balance || 0);

                  return (
                    <tr key={getLeadTreatmentId(item) || idx} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-800">{item.patient_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">CI: {item.cedula || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700">{item.treatment_name}</td>
                      <td className="px-4 py-3 align-top font-semibold text-slate-800">$<span className="font-mono">{parseFloat(item.agreed_price || 0).toLocaleString('en-US')}</span></td>
                      <td className="px-4 py-3 align-top font-semibold">$<span className="font-mono text-green-600">{parseFloat(item.amount_paid || 0).toLocaleString('en-US')}</span></td>
                      <td className="px-4 py-3 align-top font-semibold">$<span className="font-mono text-red-500">{parseFloat(item.balance || 0).toLocaleString('en-US')}</span></td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${getStatusBadge(status)}`}>
                          {item.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-center">
                        {balance > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal({ ...item, balance: parseFloat(item.balance || 0) })}
                            className="inline-flex items-center gap-2 bg-[#0056b3] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                          >
                            <CreditCard className="w-4 h-4" /> Registrar Pago
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Sin acciones</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-[#0056b3] text-white">
              <h3 className="font-bold text-lg">Registrar Pago</h3>
              <button type="button" onClick={handleClosePaymentModal} className="hover:text-blue-100 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-600">Paciente: <span className="font-bold text-slate-800">{getPatientName(selectedRecord)}</span></p>
                <p className="text-sm text-slate-600 mt-1">Deuda Actual: <span className="font-bold text-rose-700">{formatUsd(selectedBalance)}</span></p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Monto a Pagar USD</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedRecord?.balance || 0}
                  required
                  value={paymentForm.amount_usd}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount_usd: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Método de Pago</label>
                <select
                  required
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] bg-white"
                >
                  <option value="Zelle">Zelle</option>
                  <option value="Efectivo USD">Efectivo USD</option>
                  <option value="Pago Móvil">Pago Móvil</option>
                  <option value="Transferencia (Bs)">Transferencia (Bs)</option>
                  <option value="Binance">Binance</option>
                  <option value="Punto de Venta">Punto de Venta</option>
                </select>
              </div>

              {paymentForm.payment_method !== 'Efectivo USD' && (
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Referencia</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.reference_number}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]"
                  />
                </div>
              )}

              {showBsFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">Tasa BCV</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={paymentForm.exchange_rate_bcv}
                      onChange={(e) => setPaymentForm({ ...paymentForm, exchange_rate_bcv: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">Monto Bs</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentForm.amount_bs}
                      readOnly
                      className="w-full p-2.5 border border-gray-200 rounded-lg bg-slate-50 text-slate-700"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClosePaymentModal}
                  className="px-5 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition"
                  disabled={submittingPayment}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0056b3] text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition inline-flex items-center gap-2 disabled:opacity-70"
                  disabled={submittingPayment}
                >
                  {submittingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submittingPayment ? 'Confirmando...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

