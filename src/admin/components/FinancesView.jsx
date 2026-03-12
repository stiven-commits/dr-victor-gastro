import { useEffect, useState } from 'react';
import { Search, CreditCard, Loader2, ChevronLeft, ChevronRight, Calendar, Printer, RotateCcw, Clock } from 'lucide-react';
import FinancesPrint from './FinancesPrint';
import { PaymentModal, AdjustModal, DetailsModal, ReverseModal } from './FinanceModals';
import logoDr from '../../assets/logo-dr-victor-horizontal-2.png';

const API_KEY = 'Bearer v2ew5w8mAq3';
const GET_URL = 'https://victorbot.sosmarketing.agency/webhook/api-finances';
const POST_URL = 'https://victorbot.sosmarketing.agency/webhook/api-add-payment';
const ADJUST_URL = 'https://victorbot.sosmarketing.agency/webhook/api-adjust-price';
const VZLA_STATES = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];

const getStatus = (row) => {
  if (row?.payments_history && row.payments_history.length > 0) {
    const lastPayment = [...row.payments_history].sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))[0];
    if (lastPayment && lastPayment.payment_method === 'Reverso') return 'Reverso';
  }
  return row?.payment_status || row?.status || 'Pendiente';
};

const getPatientName = (row) => row?.patient_name || row?.name || 'N/A';
const getCedula = (row) => row?.cedula || row?.patient_cedula || 'N/A';
const getLeadTreatmentId = (row) => row?.lead_treatment_id || row?.id;
const formatUsd = (value) => `$${Number(value || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatusBadge = (status) => {
  if (status === 'Pagado') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'Parcial') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (status === 'Reverso') return 'bg-purple-100 text-purple-700 border-purple-200';
  return 'bg-rose-100 text-rose-700 border-rose-200';
};

const parseLocaleNumber = (val) => {
  if (!val) return NaN;
  return parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
};

// Soporta números del backend en formato "1234.56" o "1.234,56"
const parseMoneyValue = (val) => {
  if (val === null || val === undefined || val === '') return NaN;
  if (typeof val === 'number') return Number.isFinite(val) ? val : NaN;

  const str = String(val).trim();
  if (!str) return NaN;

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    return parseFloat(str.replace(/\./g, '').replace(',', '.'));
  }
  if (hasComma) {
    return parseFloat(str.replace(',', '.'));
  }
  return parseFloat(str);
};

const formatNumberInput = (val) => {
  if (!val) return '';
  let cleaned = val.replace(/[^0-9,]/g, '');
  let parts = cleaned.split(',');
  let intPart = parts[0];
  let decPart = parts.length > 1 ? parts[1].substring(0, 2) : null;
  if (intPart.length > 1 && intPart.startsWith('0')) intPart = parseInt(intPart, 10).toString();
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.length > 1 ? `${intPart},${decPart}` : intPart;
};

const getLocalDateStr = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper para formato de fecha en inputs
const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function FinancesView() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const canEdit = currentUser?.role === 'admin' || (currentUser?.permissions && currentUser.permissions['finances'] === 'edit');

  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterState, setFilterState] = useState('Todos');

  // --- LÓGICA DE FECHAS PERSISTENTES ---
  const today = new Date();
  const firstDayDefault = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayDefault = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  // Leemos del localStorage o usamos el default
  const [startDate, setStartDate] = useState(() => localStorage.getItem('finance_startDate') || firstDayDefault);
  const [endDate, setEndDate] = useState(() => localStorage.getItem('finance_endDate') || lastDayDefault);

  // Guardamos en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('finance_startDate', startDate);
    localStorage.setItem('finance_endDate', endDate);
  }, [startDate, endDate]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // --- FUNCIONES DE BOTONES RÁPIDOS ---
  const setToday = () => {
    const t = getFormattedDate(new Date());
    setStartDate(t);
    setEndDate(t);
  };

  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = getFormattedDate(d);
    setStartDate(y);
    setEndDate(y);
  };

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [paymentForm, setPaymentForm] = useState({ amount_usd: '', payment_method: 'Zelle', reference_number: '', exchange_rate_bcv: '', amount_bs: '' });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ type: 'discount', amount_usd: '' });
  const [submittingAdjust, setSubmittingAdjust] = useState(false);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState(null);

  // Estados Reverso
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [reverseForm, setReverseForm] = useState({ amount_usd: '', reference_number: '' });
  const [submittingReverse, setSubmittingReverse] = useState(false);

  const fetchFinances = async () => {
    setLoading(true);
    try {
      const response = await fetch(GET_URL, { method: 'GET', headers: { 'Authorization': API_KEY, 'Accept': 'application/json' } });
      const text = await response.text();
      if (!text) { setFinances([]); return; }
      const data = JSON.parse(text);
      const normalizedData = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [];
      setFinances(normalizedData);
    } catch (error) { console.error('Error cargando finanzas:', error); setFinances([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchFinances(); }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterState, startDate, endDate]);

  const handleOpenPaymentModal = (record) => {
    setSelectedRecord(record);
    setPaymentForm({ amount_usd: '', payment_method: 'Zelle', reference_number: '', exchange_rate_bcv: '', amount_bs: '' });
    setIsModalOpen(true);
  };

  const handleClosePaymentModal = () => { setIsModalOpen(false); setSelectedRecord(null); };

  const handleToggleRecordSelection = (record, checked) => {
    const id = getLeadTreatmentId(record);
    if (!id) return;

    if (!checked) {
      setSelectedRecords((prev) => prev.filter((r) => getLeadTreatmentId(r) !== id));
      return;
    }

    if (selectedRecords.length > 0) {
      const baseCedula = getCedula(selectedRecords[0]);
      const currentCedula = getCedula(record);
      if (String(baseCedula) !== String(currentCedula)) {
        alert('Solo puedes seleccionar procedimientos del mismo paciente para pago grupal.');
        return;
      }
    }

    setSelectedRecords((prev) => {
      if (prev.some((r) => getLeadTreatmentId(r) === id)) return prev;
      return [...prev, record];
    });
  };
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord && selectedRecords.length === 0) return;
    const parsedUsd = parseLocaleNumber(paymentForm.amount_usd);
    if (Number.isNaN(parsedUsd) || parsedUsd <= 0) return alert('Monto inválido');

    setSubmittingPayment(true);

    try {
      const regBy = currentUser?.name || currentUser?.username || 'Sistema';
      // Para registrar pagos el backend espera el ID real del tratamiento del paciente.
      const getPaymentTargetId = (row) => row?.lead_treatment_id ?? null;
      const commonPayload = {
        payment_method: paymentForm.payment_method || 'Zelle',
        reference_number: (paymentForm.payment_method === 'Efectivo USD' ? 'Efectivo' : (paymentForm.reference_number || '')),
        exchange_rate_bcv: paymentForm.exchange_rate_bcv ? parseLocaleNumber(paymentForm.exchange_rate_bcv) : null,
        registered_by: regBy
      };

      if (selectedRecords.length > 1) {
        let remaining = parsedUsd;
        const totalBs = paymentForm.amount_bs ? parseLocaleNumber(paymentForm.amount_bs) : null;
        const targets = [...selectedRecords];
        let appliedCount = 0;

        for (const rec of targets) {
          if (remaining <= 0) break;
          const balance = parseMoneyValue(rec.balance);
          if (Number.isNaN(balance) || balance <= 0) continue;
          const leadTreatmentId = getPaymentTargetId(rec);
          if (!leadTreatmentId) continue;

          const allocated = Math.min(remaining, balance);
          if (allocated <= 0) continue;

          const payload = {
            lead_treatment_id: leadTreatmentId,
            amount_usd: allocated,
            amount_bs: totalBs && parsedUsd > 0 ? (totalBs * (allocated / parsedUsd)) : null,
            ...commonPayload
          };

          const response = await fetch(POST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: API_KEY, Accept: 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            throw new Error(errorBody || `Error en respuesta del servidor (${response.status})`);
          }

          remaining -= allocated;
          appliedCount += 1;
        }

        if (appliedCount === 0) {
          throw new Error('No hay tratamientos válidos para aplicar el pago (sin deuda o sin ID).');
        }

        if (remaining > 0.01) {
          const creditTarget = targets.find((r) => getPaymentTargetId(r));
          if (!creditTarget) {
            throw new Error('No se encontró un tratamiento destino para registrar el crédito excedente.');
          }

          const creditPayload = {
            lead_treatment_id: getPaymentTargetId(creditTarget),
            amount_usd: remaining,
            amount_bs: totalBs && parsedUsd > 0 ? (totalBs * (remaining / parsedUsd)) : null,
            ...commonPayload
          };

          const creditResponse = await fetch(POST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: API_KEY, Accept: 'application/json' },
            body: JSON.stringify(creditPayload)
          });
          if (!creditResponse.ok) {
            const errorBody = await creditResponse.text().catch(() => '');
            throw new Error(errorBody || `Error en respuesta del servidor (${creditResponse.status})`);
          }

          alert(`Se registró un crédito a favor por ${formatUsd(remaining)}.`);
        }
      } else {
        const target = selectedRecords.length === 1 ? selectedRecords[0] : selectedRecord;
        const targetId = getPaymentTargetId(target);
        const targetBalance = parseMoneyValue(target?.balance);
        if (!targetId) return alert('No se encontró el ID del tratamiento (lead_treatment_id) para registrar el pago.');

        const payload = {
          lead_treatment_id: targetId,
          amount_usd: parsedUsd,
          amount_bs: paymentForm.amount_bs ? parseLocaleNumber(paymentForm.amount_bs) : null,
          ...commonPayload
        };

        const response = await fetch(POST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: API_KEY, Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new Error(errorBody || `Error en respuesta del servidor (${response.status})`);
        }

        if (!Number.isNaN(targetBalance) && targetBalance > 0 && parsedUsd > targetBalance + 0.01) {
          alert(`Pago registrado con crédito a favor de ${formatUsd(parsedUsd - targetBalance)}.`);
        }
      }

      setIsModalOpen(false);
      setSelectedRecords([]);
      fetchFinances();
    } catch (error) {
      const msg = error?.message || 'Error desconocido';
      console.error('Error al procesar pago:', msg, error);
      alert(`Hubo un error al registrar el pago: ${msg}`);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleOpenReverseModal = (record) => {
    setSelectedRecord(record);
    const paidStr = parseFloat(record.amount_paid || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setReverseForm({ amount_usd: paidStr, reference_number: '' });
    setIsReverseModalOpen(true);
  };

  const handleReverseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    const parsedAmount = parseLocaleNumber(reverseForm.amount_usd);
    const maxReversible = parseFloat(selectedRecord.amount_paid || 0);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return alert('Monto inválido');
    if (parsedAmount > maxReversible + 0.01) return alert(`No puedes reversar más de lo pagado ($${maxReversible})`);

    setSubmittingReverse(true);
    try {
      const regBy = currentUser?.name || currentUser?.username || 'Sistema';
      
      const payload = {
        lead_treatment_id: getLeadTreatmentId(selectedRecord) || null,
        amount_usd: -Math.abs(parsedAmount),
        payment_method: 'Reverso',
        reference_number: reverseForm.reference_number || 'Devolución',
        exchange_rate_bcv: null,
        amount_bs: null,
        registered_by: regBy
      };

      await fetch(POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: API_KEY, Accept: 'application/json' },
        body: JSON.stringify(payload)
      });

      setIsReverseModalOpen(false);
      fetchFinances();
    } catch (error) { console.error('Error en reverso:', error); } finally { setSubmittingReverse(false); }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    const parsedAmount = parseLocaleNumber(adjustForm.amount_usd);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return alert('Monto inválido');
    setSubmittingAdjust(true);
    try {
      await fetch(ADJUST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify({
          lead_treatment_id: getLeadTreatmentId(selectedRecord) || null,
          adjustment: adjustForm.type === 'discount' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount)
        })
      });
      setIsAdjustModalOpen(false);
      fetchFinances();
    } catch (error) { console.error(error); } finally { setSubmittingAdjust(false); }
  };

  const filteredFinances = finances.filter((row) => {
    const status = getStatus(row);
    const matchesStatus = filterStatus === 'Todos' || status === filterStatus;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || getPatientName(row).toLowerCase().includes(term) || getCedula(row).toLowerCase().includes(term);
    const matchesState = filterState === 'Todos' || row.state === filterState;
    let matchesDate = true;
    if (startDate || endDate) {
      const payments = row.payments_history || [];
      const hasPaymentInPeriod = payments.some(p => {
        const pDate = getLocalDateStr(p.payment_date);
        return (!startDate || pDate >= startDate) && (!endDate || pDate <= endDate);
      });
      let createdInPeriod = false;
      if (row.created_at) {
        const cDate = getLocalDateStr(row.created_at);
        createdInPeriod = (!startDate || cDate >= startDate) && (!endDate || cDate <= endDate);
      }
      matchesDate = hasPaymentInPeriod || createdInPeriod;
    }
    return matchesStatus && matchesSearch && matchesState && matchesDate;
  });

  let incomeByMethod = {};
  let incomeByTreatment = {};
  let totalPeriodIncome = 0;
  let totalPendingBalance = 0;
  let totalCreditBalance = 0;
  let periodPayments = [];

  filteredFinances.forEach(item => {
    const currentBalance = parseMoneyValue(item.balance) || 0;
    if (currentBalance > 0) totalPendingBalance += currentBalance;
    if (currentBalance < 0) totalCreditBalance += Math.abs(currentBalance);
    const totalCost = parseFloat(item.agreed_price || item.agreed_price_usd || 0);
    const sortedPayments = [...(item.payments_history || [])].sort((a,b) => new Date(a.payment_date) - new Date(b.payment_date));
    let accumulatedPaid = 0;

    sortedPayments.forEach(p => {
      const amt = parseFloat(p.amount_usd || 0);
      accumulatedPaid += amt;
      const historicalBalance = totalCost - accumulatedPaid;
      const pDate = getLocalDateStr(p.payment_date);
      if ((!startDate || pDate >= startDate) && (!endDate || pDate <= endDate)) {
        totalPeriodIncome += amt;
        const method = p.payment_method || 'Otro';
        incomeByMethod[method] = (incomeByMethod[method] || 0) + amt;
        const tName = item.treatment_name || 'Otro';
        if (!incomeByTreatment[tName]) incomeByTreatment[tName] = { amount: 0, countSet: new Set() };
        incomeByTreatment[tName].amount += amt;
        incomeByTreatment[tName].countSet.add(getLeadTreatmentId(item));
        
        periodPayments.push({ 
          ...p, 
          patient_name: item.patient_name, 
          cedula: item.cedula, 
          treatment_name: item.treatment_name, 
          total_treatment_cost: totalCost,
          historical_balance: historicalBalance > 0 ? historicalBalance : 0,
          historical_credit: historicalBalance < 0 ? Math.abs(historicalBalance) : 0
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
      <div className="p-4 md:p-6 no-print">
        {/* Filtros CON BOTONES RÁPIDOS */}
        <div className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <div className="flex items-center gap-2 text-[#0056b3] font-bold text-sm">
              <Calendar className="w-4 h-4"/> Rango de Fechas:
            </div>
            <div className="flex gap-2">
              <button onClick={setToday} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition border border-blue-100 flex items-center gap-1">
                <Clock className="w-3 h-3"/> Hoy
              </button>
              <button onClick={setYesterday} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition border border-slate-200">
                Ayer
              </button>
            </div>
          </div>
          
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0056b3] w-full md:w-auto" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0056b3] w-full md:w-auto" />
          
          <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-sm text-slate-400 hover:text-red-500 font-medium px-2 py-2 transition">
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button onClick={() => window.print()} className="ml-auto bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition shadow-sm flex items-center gap-2 text-sm whitespace-nowrap">
            <Printer className="w-4 h-4" /> Imprimir Resumen
          </button>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-48">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ingresos por Método</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {Object.entries(incomeByMethod).map(([method, amount]) => (
                <div key={method} className="flex justify-between text-sm"><span className="font-medium text-slate-600">{method}</span><span className="font-bold text-slate-800">${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-bold text-[#0056b3]"><span>TOTAL</span><span>${totalPeriodIncome.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-48">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ingresos por Procedimiento</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {Object.entries(incomeByTreatment).map(([treatment, data]) => (
                <div key={treatment} className="flex justify-between text-sm"><span className="font-medium text-slate-600 truncate mr-2" title={treatment}>{treatment} <span className="text-[#0056b3] font-bold ml-1">(x{data.countSet.size})</span></span><span className="font-bold text-slate-800">${data.amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
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

        {/* Buscador y Tabla */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative md:col-span-1"><Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o cédula..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0056b3]" /></div>
          
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full py-2.5 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer">
            <option value="Todos">Edo. Pago: Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Parcial">Parcial</option>
            <option value="Pagado">Pagado</option>
            <option value="Reverso">Reverso</option>
          </select>

          <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="w-full py-2.5 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0056b3] bg-white cursor-pointer"><option value="Todos">Locación: Todas</option>{VZLA_STATES.map(st => <option key={st} value={st}>{st}</option>)}</select>
        </div>
        {selectedRecords.length > 1 && (
          <div className="mb-4 flex items-center justify-end">
            <button
              type="button"
              onClick={() => handleOpenPaymentModal(selectedRecords[0])}
              className="bg-[#0056b3] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
            >
              Registrar Pago Grupal
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          {loading ? <div className="text-center py-20 text-slate-500">Cargando finanzas...</div> : (
            <table className="w-full min-w-[980px] text-sm text-left">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center">Sel.</th>
                  <th className="px-4 py-3 font-semibold">Paciente</th><th className="px-4 py-3 font-semibold">Tratamiento</th><th className="px-4 py-3 font-semibold">Precio Acordado</th><th className="px-4 py-3 font-semibold">Ajustes</th><th className="px-4 py-3 font-semibold">Pagado</th><th className="px-4 py-3 font-semibold">Saldo Pendiente</th><th className="px-4 py-3 font-semibold">Crédito</th><th className="px-4 py-3 font-semibold">Estado</th><th className="px-4 py-3 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedFinances.length === 0 ? <tr><td colSpan="10" className="px-4 py-10 text-center text-slate-400">No hay registros financieros para mostrar.</td></tr> : paginatedFinances.map((item, idx) => {
                  const status = getStatus(item);
                  const balance = parseMoneyValue(item.balance);
                  const pending = balance > 0 ? balance : 0;
                  const credit = balance < 0 ? Math.abs(balance) : 0;
                  const adjustment = parseFloat(item.agreed_price || 0) - parseFloat(item.base_price || item.agreed_price || 0);
                  const selected = selectedRecords.some((r) => getLeadTreatmentId(r) === getLeadTreatmentId(item));
                  return (
                    <tr key={getLeadTreatmentId(item) || idx} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 align-top text-center">
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={balance <= 0}
                          onChange={(e) => handleToggleRecordSelection(item, e.target.checked)}
                          className="w-4 h-4 accent-[#0056b3] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 align-top"><div className="font-semibold text-slate-800">{item.patient_name}</div><div className="text-xs text-slate-500 mt-0.5 font-mono">CI: {item.cedula || 'N/A'}</div></td>
                      <td className="px-4 py-3 align-top text-slate-700">{item.treatment_name}</td>
                      <td className="px-4 py-3 align-top font-semibold text-slate-800">$<span className="font-mono">{parseFloat(item.agreed_price || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></td>
                      <td className="px-4 py-3 align-top font-semibold">{adjustment !== 0 ? <span className={`font-mono px-2 py-0.5 rounded-full text-[11px] border ${adjustment > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{adjustment > 0 ? '+' : ''}{adjustment.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span> : <span className="text-slate-300">-</span>}</td>
                      <td className="px-4 py-3 align-top font-semibold">$<span className="font-mono text-green-600">{parseFloat(item.amount_paid || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></td>
                      <td className="px-4 py-3 align-top font-semibold">$<span className="font-mono text-red-500">{pending.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></td>
                      <td className="px-4 py-3 align-top font-semibold">$<span className="font-mono text-emerald-600">{credit.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></td>
                      <td className="px-4 py-3 align-top"><span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${getStatusBadge(status)}`}>{status}</span></td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {canEdit && status !== 'Pagado' && status !== 'Reverso' && <button onClick={() => { setSelectedRecord(item); setAdjustForm({ type: 'discount', amount_usd: '' }); setIsAdjustModalOpen(true); }} className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-200">Ajuste</button>}
                          
                          {parseFloat(item.amount_paid || 0) > 0 && (
                            <>
                              <button onClick={() => { setDetailsRecord(item); setIsDetailsModalOpen(true); }} className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-200">Detalles</button>
                              {canEdit && <button onClick={() => handleOpenReverseModal(item)} className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1" title="Reversar Pago">Reversar</button>}
                            </>
                          )}
                          
                          {canEdit && balance > 0 && <button onClick={() => { setSelectedRecords([]); handleOpenPaymentModal({ ...item, balance: parseMoneyValue(item.balance) || 0 }); }} className="bg-[#0056b3] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700">Pagar</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
      </div>

      {/* MODALES: PROPS RESTAURADAS CORRECTAMENTE */}
      <PaymentModal isOpen={isModalOpen} onClose={handleClosePaymentModal} record={selectedRecord} records={selectedRecords} form={paymentForm} setForm={setPaymentForm} onSubmit={handlePaymentSubmit} submitting={submittingPayment} formatInput={formatNumberInput} />
      <AdjustModal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} record={selectedRecord} form={adjustForm} setForm={setAdjustForm} onSubmit={handleAdjustSubmit} submitting={submittingAdjust} formatInput={formatNumberInput} />
      <DetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} record={detailsRecord} />
      <ReverseModal isOpen={isReverseModalOpen} onClose={() => setIsReverseModalOpen(false)} record={selectedRecord} form={reverseForm} setForm={setReverseForm} onSubmit={handleReverseSubmit} submitting={submittingReverse} formatInput={formatNumberInput} />

      <FinancesPrint payments={periodPayments} totalIncome={totalPeriodIncome} totalCredit={totalCreditBalance} incomeByMethod={incomeByMethod} incomeByTreatment={incomeByTreatment} dateRange={{ start: startDate, end: endDate }} currentUser={currentUser} logo={logoDr} />
    </div>
  );
}
