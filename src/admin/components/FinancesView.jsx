import { useEffect, useState } from 'react';
import { Search, CreditCard, X, Loader2, ChevronLeft, ChevronRight, Calendar, Printer } from 'lucide-react';

const API_KEY = 'Bearer v2ew5w8mAq3';
const GET_URL = 'https://victorbot.sosmarketing.agency/webhook/api-finances';
const POST_URL = 'https://victorbot.sosmarketing.agency/webhook/api-add-payment';
const ADJUST_URL = 'https://victorbot.sosmarketing.agency/webhook/api-adjust-price';
const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];

const getStatus = (row) => row?.payment_status || row?.status || 'Pendiente';
const getPatientName = (row) => row?.patient_name || row?.name || 'N/A';
const getCedula = (row) => row?.cedula || row?.patient_cedula || 'N/A';
const getLeadTreatmentId = (row) => row?.lead_treatment_id || row?.id;
const formatUsd = (value) => `$${Number(value || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatusBadge = (status) => {
  if (status === 'Pagado') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'Parcial') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-rose-100 text-rose-700 border-rose-200';
};

const formatNumberInput = (val) => {
  if (!val) return '';
  // Dejar solo números y comas
  let cleaned = val.replace(/[^0-9,]/g, '');
  let parts = cleaned.split(',');
  let intPart = parts[0];
  let decPart = parts.length > 1 ? parts[1].substring(0, 2) : null;
  // Quitar ceros a la izquierda
  if (intPart.length > 1 && intPart.startsWith('0')) {
    intPart = parseInt(intPart, 10).toString();
    if (intPart === 'NaN') intPart = '0';
  }
  // Poner puntos de miles
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.length > 1 ? `${intPart},${decPart}` : intPart;
};
const parseLocaleNumber = (val) => {
  if (!val) return NaN;
  return parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
};

export default function FinancesView() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterState, setFilterState] = useState('Todos');

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

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
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ type: 'discount', amount_usd: '' });
  const [submittingAdjust, setSubmittingAdjust] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState(null);

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
      console.error('Error cargando finanzas:', error);
      setFinances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  useEffect(() => {
    const usd = parseLocaleNumber(paymentForm.amount_usd);
    const bcv = parseLocaleNumber(paymentForm.exchange_rate_bcv);
    if (!Number.isNaN(usd) && usd > 0 && !Number.isNaN(bcv) && bcv > 0) {
      const bsValue = (usd * bcv).toFixed(2);
      const formattedBs = bsValue.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setPaymentForm((prev) => ({ ...prev, amount_bs: formattedBs }));
    } else {
      setPaymentForm((prev) => ({ ...prev, amount_bs: '' }));
    }
  }, [paymentForm.amount_usd, paymentForm.exchange_rate_bcv]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterState, startDate, endDate]);

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
    const parsedUsd = parseLocaleNumber(paymentForm.amount_usd);
    if (Number.isNaN(parsedUsd) || parsedUsd <= 0) {
      alert('Por favor ingrese un monto válido.');
      return;
    }
    setSubmittingPayment(true);
    try {
      const payload = {
        lead_treatment_id: getLeadTreatmentId(selectedRecord),
        amount_usd: parsedUsd,
        payment_method: paymentForm.payment_method,
        reference_number: paymentForm.payment_method === 'Efectivo USD' ? '' : paymentForm.reference_number,
        exchange_rate_bcv: paymentForm.exchange_rate_bcv ? parseLocaleNumber(paymentForm.exchange_rate_bcv) : null,
        amount_bs: paymentForm.amount_bs ? parseLocaleNumber(paymentForm.amount_bs) : null,
        registered_by: currentUser?.name || 'Sistema'
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

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    const parsedAmount = parseLocaleNumber(adjustForm.amount_usd);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingrese un monto válido.');
      return;
    }
    setSubmittingAdjust(true);
    const finalAdjustment = adjustForm.type === 'discount' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
    try {
      await fetch(ADJUST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify({
          lead_treatment_id: getLeadTreatmentId(selectedRecord),
          adjustment: finalAdjustment
        })
      });
      setIsAdjustModalOpen(false);
      setAdjustForm({ type: 'discount', amount_usd: '' });
      fetchFinances();
    } catch (error) {
      console.error('Error ajustando precio:', error);
    } finally {
      setSubmittingAdjust(false);
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

    const matchesState = filterState === 'Todos' || row.state === filterState;
    return matchesStatus && matchesSearch && matchesState;
  });

  let incomeByMethod = {};
  let incomeByTreatment = {}; // Ahora guardará el monto y un Set con los IDs únicos
  let totalPeriodIncome = 0;
  let totalPendingBalance = 0;
  let periodPayments = [];

  finances.forEach(item => {
    totalPendingBalance += parseFloat(item.balance || 0);
    const payments = item.payments_history || [];
    payments.forEach(p => {
      const pDate = new Date(p.payment_date).toISOString().split('T')[0];
      if ((!startDate || pDate >= startDate) && (!endDate || pDate <= endDate)) {
        const amt = parseFloat(p.amount_usd || 0);
        totalPeriodIncome += amt;

        const method = p.payment_method || 'Otro';
        incomeByMethod[method] = (incomeByMethod[method] || 0) + amt;

        const tName = item.treatment_name || 'Otro';
        if (!incomeByTreatment[tName]) {
          incomeByTreatment[tName] = { amount: 0, countSet: new Set() };
        }
        incomeByTreatment[tName].amount += amt;
        incomeByTreatment[tName].countSet.add(getLeadTreatmentId(item)); // Guarda el ID único para no duplicar si hay pagos parciales

        periodPayments.push({
          ...p,
          patient_name: item.patient_name,
          cedula: item.cedula,
          treatment_name: item.treatment_name
        });
      }
    });
  });

  periodPayments.sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));

  const totalPages = Math.ceil(filteredFinances.length / ITEMS_PER_PAGE) || 1;
  const paginatedFinances = filteredFinances.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const selectedBalance = parseFloat(selectedRecord?.balance || 0);
  const showBsFields = paymentForm.payment_method === 'Pago Móvil' || paymentForm.payment_method === 'Transferencia (Bs)';

  return (
    <div className="w-full">
      <style>{`
        @media print {
          @page { size: letter landscape; margin: 8mm; }
          body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          aside, header, .no-print { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; background: white !important; }
          .print-area { display: block !important; width: 100%; }
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>
      {/* --- ZONA WEB NORMAL (Se oculta al imprimir) --- */}
      <div className="p-4 md:p-6 no-print">
      <div className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-[#0056b3] font-bold"><Calendar className="w-5 h-5"/> Rango de Fechas:</div>
        <div><label className="text-xs font-semibold text-slate-500 block mb-1">Desde</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
        <div><label className="text-xs font-semibold text-slate-500 block mb-1">Hasta</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
        <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-sm text-slate-500 hover:text-[#0056b3] font-medium px-2 py-2">Quitar filtro</button>
        <button onClick={() => window.print()} className="ml-auto bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition shadow-sm flex items-center gap-2 text-sm whitespace-nowrap">
          <Printer className="w-4 h-4" /> Imprimir Resumen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-48">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ingresos por Método</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {Object.entries(incomeByMethod).length === 0 ? <p className="text-sm text-slate-400 italic">Sin ingresos en el periodo.</p> : Object.entries(incomeByMethod).map(([method, amount]) => (
              <div key={method} className="flex justify-between text-sm"><span className="font-medium text-slate-600">{method}</span><span className="font-bold text-slate-800">${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-bold text-[#0056b3]"><span>TOTAL</span><span>${totalPeriodIncome.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-48">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ingresos por Procedimiento</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {Object.entries(incomeByTreatment).length === 0 ? <p className="text-sm text-slate-400 italic">Sin ingresos en el periodo.</p> : Object.entries(incomeByTreatment).map(([treatment, data]) => (
              <div key={treatment} className="flex justify-between text-sm">
                <span className="font-medium text-slate-600 truncate mr-2" title={treatment}>
                  {treatment} <span className="text-[#0056b3] font-bold ml-1">(x{data.countSet.size})</span>
                </span>
                <span className="font-bold text-slate-800">${data.amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-bold text-[#0056b3]"><span>TOTAL</span><span>${totalPeriodIncome.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-center text-white h-48 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl"></div>
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ingreso del Periodo</h3>
            <p className="text-3xl font-bold text-green-400">${totalPeriodIncome.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cuentas por Cobrar (Global)</h3>
            <p className="text-xl font-medium text-rose-300">${totalPendingBalance.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0056b3]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full py-2.5 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer"
        >
          <option value="Todos">Edo. Pago: Todos</option>
          <option value="Pendiente">Edo. Pago: Pendiente</option>
          <option value="Parcial">Edo. Pago: Parcial</option>
          <option value="Pagado">Edo. Pago: Pagado</option>
        </select>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="w-full py-2.5 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer"
        >
          <option value="Todos">Locación: Todas</option>
          {VZLA_STATES.map(st => <option key={st} value={st}>{st}</option>)}
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
                <th className="px-4 py-3 font-semibold">Ajustes</th>
                <th className="px-4 py-3 font-semibold">Pagado</th>
                <th className="px-4 py-3 font-semibold">Saldo Pendiente</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedFinances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-400">
                    No hay registros financieros para mostrar.
                  </td>
                </tr>
              ) : (
                paginatedFinances.map((item, idx) => {
                  const status = item.payment_status || 'Pendiente';
                  const balance = parseFloat(item.balance || 0);
                  const basePrice = parseFloat(item.base_price || item.agreed_price || 0);
                  const agreedPrice = parseFloat(item.agreed_price || 0);
                  const adjustment = agreedPrice - basePrice;

                  return (
                    <tr key={getLeadTreatmentId(item) || idx} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-800">{item.patient_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">CI: {item.cedula || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700">{item.treatment_name}</td>
                      <td className="px-4 py-3 align-top font-semibold text-slate-800">$<span className="font-mono">{parseFloat(item.agreed_price || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                      <td className="px-4 py-3 align-top font-semibold">
                        {adjustment !== 0 ? (
                          <span className={`font-mono px-2 py-0.5 rounded-full text-[11px] border ${adjustment > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {adjustment > 0 ? '+' : ''}{adjustment.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-4 py-3 align-top font-semibold">$<span className="font-mono text-green-600">{parseFloat(item.amount_paid || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                      <td className="px-4 py-3 align-top font-semibold">$<span className="font-mono text-red-500">{parseFloat(item.balance || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${getStatusBadge(status)}`}>
                          {item.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {status !== 'Pagado' && (
                            <button type="button" onClick={() => { setSelectedRecord(item); setAdjustForm({ type: 'discount', amount_usd: '' }); setIsAdjustModalOpen(true); }} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition">
                              ⚙️ Ajuste
                            </button>
                          )}
                          {parseFloat(item.amount_paid || 0) > 0 && (
                            <button type="button" onClick={() => { setDetailsRecord(item); setIsDetailsModalOpen(true); }} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition">
                              📋 Detalles
                            </button>
                          )}
                          {balance > 0 && (
                            <button type="button" onClick={() => handleOpenPaymentModal({ ...item, balance: parseFloat(item.balance || 0) })} className="inline-flex items-center gap-1.5 bg-[#0056b3] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition">
                              <CreditCard className="w-4 h-4" /> Pagar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 bg-white border border-t-0 border-gray-100 rounded-b-xl shadow-sm">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="text-sm font-bold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-1"><ChevronLeft size={18}/> Anterior</button>
          <span className="text-sm font-medium text-slate-500">Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="text-sm font-bold text-[#0056b3] disabled:text-slate-300 hover:bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-1">Siguiente <ChevronRight size={18}/></button>
        </div>
      )}

      {isDetailsModalOpen && detailsRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col max-h-full">
            <div className="flex items-center justify-between p-4 bg-slate-800 text-white">
              <div>
                <h3 className="font-bold text-lg">Historial de Pagos</h3>
                <p className="text-xs text-slate-300">{getPatientName(detailsRecord)} - {detailsRecord.treatment_name}</p>
              </div>
              <button type="button" onClick={() => setIsDetailsModalOpen(false)} className="hover:text-red-400 p-1 transition"><X size={20} /></button>
            </div>

            <div className="p-5 overflow-y-auto bg-slate-50/50 flex-1 space-y-3">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen de Facturación</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div><span className="block text-slate-500 text-[11px]">Precio Base</span><span className="font-bold text-sm text-slate-700">${parseFloat(detailsRecord.base_price || detailsRecord.agreed_price || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Ajustes</span>
                    <span className={`font-bold text-sm ${(parseFloat(detailsRecord.agreed_price || 0) - parseFloat(detailsRecord.base_price || detailsRecord.agreed_price || 0)) > 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                      {(parseFloat(detailsRecord.agreed_price || 0) - parseFloat(detailsRecord.base_price || detailsRecord.agreed_price || 0)) !== 0 
                        ? ((parseFloat(detailsRecord.agreed_price || 0) - parseFloat(detailsRecord.base_price || detailsRecord.agreed_price || 0)) > 0 ? '+' : '') + (parseFloat(detailsRecord.agreed_price || 0) - parseFloat(detailsRecord.base_price || detailsRecord.agreed_price || 0)).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                        : '$0,00'}
                    </span>
                  </div>
                  <div><span className="block text-slate-500 text-[11px]">Total a Pagar</span><span className="font-bold text-sm text-[#0056b3]">${parseFloat(detailsRecord.agreed_price || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                </div>
              </div>
              {(!detailsRecord.payments_history || detailsRecord.payments_history.length === 0) ? (
                <p className="text-center text-slate-400 py-10 text-sm">No hay pagos registrados.</p>
              ) : (
                detailsRecord.payments_history.map(payment => (
                  <div key={payment.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                    <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Fecha de pago</span>
                        <span className="text-sm font-semibold text-slate-700">{new Date(payment.payment_date).toLocaleString('es-VE')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-mono font-bold text-green-600">${parseFloat(payment.amount_usd || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Por: {payment.registered_by}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-xs text-slate-400 block">Método</span><span className="font-semibold text-slate-700">{payment.payment_method}</span></div>
                      <div><span className="text-xs text-slate-400 block">Referencia</span><span className="font-mono text-slate-700">{payment.reference_number || 'N/A'}</span></div>
                      {payment.amount_bs && (
                        <>
                          <div><span className="text-xs text-slate-400 block">Tasa BCV</span><span className="font-mono text-slate-700">Bs. {payment.exchange_rate_bcv}</span></div>
                          <div><span className="text-xs text-slate-400 block">Monto Total Bs</span><span className="font-mono font-bold text-slate-800">Bs. {parseFloat(payment.amount_bs || 0).toLocaleString('es-VE')}</span></div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
                  type="text"
                  required
                  value={paymentForm.amount_usd}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount_usd: formatNumberInput(e.target.value) })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]"
                  placeholder="Ej: 1.500,50"
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
                      type="text"
                      required
                      value={paymentForm.exchange_rate_bcv}
                      onChange={(e) => setPaymentForm({ ...paymentForm, exchange_rate_bcv: formatNumberInput(e.target.value) })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]"
                      placeholder="Ej: 36,50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">Monto Bs</label>
                    <input
                      type="text"
                      value={paymentForm.amount_bs}
                      readOnly
                      className="w-full p-2.5 border border-gray-200 rounded-lg bg-slate-50 text-slate-700 font-mono font-bold"
                      placeholder="0,00"
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
      {isAdjustModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-slate-800 text-white">
              <h3 className="font-bold">Ajustar Precio</h3>
              <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="hover:text-red-400 transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                <p className="text-slate-600 mb-1">Paciente: <span className="font-bold text-slate-800">{getPatientName(selectedRecord)}</span></p>
                <p className="text-slate-600">Tratamiento: <span className="font-bold text-slate-800">{selectedRecord.treatment_name}</span></p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Tipo de Ajuste</label>
                <select value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] bg-white font-semibold">
                  <option value="discount">📉 Aplicar Descuento (-)</option>
                  <option value="extra">📈 Cargo Extra / Recargo (+)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Monto del Ajuste (USD)</label>
                <input type="text" required value={adjustForm.amount_usd} onChange={(e) => setAdjustForm({ ...adjustForm, amount_usd: formatNumberInput(e.target.value) })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Ej: 50,00" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition" disabled={submittingAdjust}>Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 shadow-sm transition inline-flex items-center gap-2 disabled:opacity-70" disabled={submittingAdjust}>
                  {submittingAdjust ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Aplicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div> {/* Cierre del no-print wrapper */}
            {/* --- ZONA DE IMPRESIÓN (Se oculta en la web) --- */}
      <div className="hidden print-area bg-white text-black font-sans">
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4">
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest text-slate-900">Resumen de Caja Diario</h1>
            <h2 className="text-sm font-bold text-slate-600 mt-0.5">Dr. Víctor - Gastroenterología Clínica</h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-600">Periodo: {startDate || 'Inicio'} al {endDate || 'Hoy'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Impreso: {new Date().toLocaleString('es-VE', { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
        </div>

        <table className="w-full text-left text-[10px] mb-6 border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-800 uppercase tracking-wider">
              <th className="border-b-2 border-slate-300 p-1.5 font-bold w-16">Hora</th>
              <th className="border-b-2 border-slate-300 p-1.5 font-bold">Paciente</th>
              <th className="border-b-2 border-slate-300 p-1.5 font-bold w-20">C.I</th>
              <th className="border-b-2 border-slate-300 p-1.5 font-bold">Procedimiento</th>
              <th className="border-b-2 border-slate-300 p-1.5 font-bold w-20">Método</th>
              <th className="border-b-2 border-slate-300 p-1.5 font-bold">Referencia / Tasa</th>
              <th className="border-b-2 border-slate-300 p-1.5 font-bold text-right w-24">Monto USD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {periodPayments.length === 0 ? (
              <tr><td colSpan="7" className="text-center p-4 italic text-slate-500">No se registraron cobros en el periodo seleccionado.</td></tr>
            ) : (
              periodPayments.map(p => (
                <tr key={p.id}>
                  <td className="p-1.5">{new Date(p.payment_date).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                  <td className="p-1.5 font-bold">{p.patient_name}</td>
                  <td className="p-1.5 font-mono">{p.cedula || 'N/A'}</td>
                  <td className="p-1.5">{p.treatment_name}</td>
                  <td className="p-1.5">{p.payment_method}</td>
                  <td className="p-1.5 font-mono">
                    {p.reference_number && p.reference_number !== 'No aplica' && p.reference_number !== '' ? <span className="block">Ref: {p.reference_number}</span> : null}
                    {p.amount_bs ? <span className="block text-[9px] text-slate-600 mt-0.5 font-bold">Bs. {parseFloat(p.amount_bs).toLocaleString('es-VE', {minimumFractionDigits:2})} (Tasa: {p.exchange_rate_bcv})</span> : null}
                    {!p.reference_number && !p.amount_bs && p.payment_method === 'Efectivo USD' ? 'Efectivo' : null}
                  </td>
                  <td className="p-1.5 text-right font-bold text-slate-800">${parseFloat(p.amount_usd).toLocaleString('es-VE', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Cuadrícula de 3 columnas para el cierre final */}
        <div className="grid grid-cols-3 gap-6 mb-6 border-t-2 border-slate-800 pt-4 page-break-inside-avoid">
          <div>
            <h3 className="font-bold text-[11px] uppercase mb-2 text-slate-800">Desglose por Método</h3>
            <div className="space-y-1">
              {Object.entries(incomeByMethod).map(([method, amount]) => (
                <div key={method} className="flex justify-between text-[10px] border-b border-dashed border-gray-200 pb-1">
                  <span>{method}</span><span className="font-bold">${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-[11px] uppercase mb-2 text-slate-800">Resumen Procedimientos</h3>
            <div className="space-y-1">
              {Object.entries(incomeByTreatment).map(([treatment, data]) => (
                <div key={treatment} className="flex justify-between text-[10px] border-b border-dashed border-gray-200 pb-1">
                  <span className="truncate pr-2">{treatment} <strong>(x{data.countSet.size})</strong></span>
                  <span className="font-bold">${data.amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-end items-end">
            <div className="bg-slate-100 p-3 rounded-lg w-48 text-right border border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Ingreso Total</p>
              <p className="text-xl font-black text-slate-900">${totalPeriodIncome.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-300 pt-3 mt-6 page-break-inside-avoid">
          <p className="font-bold text-[11px] mb-4 text-slate-800">Observaciones Generales:</p>
          <div className="w-full border-b border-slate-400 mb-6"></div>
          <div className="w-full border-b border-slate-400 mb-8"></div>

          <div className="flex justify-center mt-12 pt-6">
            <div className="text-center w-56">
              <div className="border-b border-slate-800 mb-2"></div>
              <p className="font-bold text-[11px] text-slate-800">Recibido / Firma del Doctor</p>
              <p className="text-[9px] text-slate-500 mt-1">Dr. Víctor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

