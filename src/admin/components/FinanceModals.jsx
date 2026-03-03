import React from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';

const formatUsd = (value) => `$${Number(value || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const getPatientName = (row) => row?.patient_name || row?.name || 'N/A';

const formatNumberInput = (val) => {
  if (!val) return '';
  let cleaned = val.replace(/[^0-9,]/g, '');
  let parts = cleaned.split(',');
  let intPart = parts[0];
  let decPart = parts.length > 1 ? parts[1].substring(0, 2) : null;
  if (intPart.length > 1 && intPart.startsWith('0')) {
    intPart = parseInt(intPart, 10).toString();
    if (intPart === 'NaN') intPart = '0';
  }
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.length > 1 ? `${intPart},${decPart}` : intPart;
};

export function PaymentModal({ isOpen, onClose, record, form, setForm, onSubmit, submitting }) {
  if (!isOpen || !record) return null;
  const balance = parseFloat(record.balance || 0);
  const showBsFields = form.payment_method === 'Pago Móvil' || form.payment_method === 'Transferencia (Bs)' || form.payment_method === 'Punto de Venta';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-[#0056b3] text-white">
          <h3 className="font-bold text-lg">Registrar Pago</h3>
          <button type="button" onClick={onClose} className="hover:text-blue-100 transition"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-600">Paciente: <span className="font-bold text-slate-800">{getPatientName(record)}</span></p>
            <p className="text-sm text-slate-600 mt-1">Deuda Actual: <span className="font-bold text-rose-700">{formatUsd(balance)}</span></p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Monto a Pagar USD</label>
            <input type="text" required value={form.amount_usd} onChange={(e) => setForm({ ...form, amount_usd: formatNumberInput(e.target.value) })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Ej: 1.500,50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Método de Pago</label>
            <select required value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] bg-white">
              <option value="Zelle">Zelle</option>
              <option value="Efectivo USD">Efectivo USD</option>
              <option value="Pago Móvil">Pago Móvil</option>
              <option value="Transferencia (Bs)">Transferencia (Bs)</option>
              <option value="Binance">Binance</option>
              <option value="Punto de Venta">Punto de Venta</option>
            </select>
          </div>
          {form.payment_method !== 'Efectivo USD' && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Referencia</label>
              <input type="text" required value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" />
            </div>
          )}
          {showBsFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold mb-1 text-slate-700">Tasa BCV</label><input type="text" required value={form.exchange_rate_bcv} onChange={(e) => setForm({ ...form, exchange_rate_bcv: formatNumberInput(e.target.value) })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Ej: 36,50" /></div>
              <div><label className="block text-sm font-semibold mb-1 text-slate-700">Monto Bs</label><input type="text" value={form.amount_bs} readOnly className="w-full p-2.5 border border-gray-200 rounded-lg bg-slate-50 text-slate-700 font-mono font-bold" placeholder="0,00" /></div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition" disabled={submitting}>Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-[#0056b3] text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition inline-flex items-center gap-2 disabled:opacity-70" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {submitting ? 'Confirmando...' : 'Confirmar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdjustModal({ isOpen, onClose, record, form, setForm, onSubmit, submitting }) {
  if (!isOpen || !record) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-slate-800 text-white">
          <h3 className="font-bold">Ajustar Precio</h3>
          <button type="button" onClick={onClose} className="hover:text-red-400 transition"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
            <p className="text-slate-600 mb-1">Paciente: <span className="font-bold text-slate-800">{getPatientName(record)}</span></p>
            <p className="text-slate-600">Tratamiento: <span className="font-bold text-slate-800">{record.treatment_name}</span></p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Tipo de Ajuste</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] bg-white font-semibold">
              <option value="discount">📉 Aplicar Descuento (-)</option>
              <option value="extra">📈 Cargo Extra / Recargo (+)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Monto del Ajuste (USD)</label>
            <input type="text" required value={form.amount_usd} onChange={(e) => setForm({ ...form, amount_usd: formatNumberInput(e.target.value) })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" placeholder="Ej: 50,00" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition" disabled={submitting}>Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 shadow-sm transition inline-flex items-center gap-2 disabled:opacity-70" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DetailsModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;
  const agreed = parseFloat(record.agreed_price || 0);
  const base = parseFloat(record.base_price || agreed);
  const diff = agreed - base;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col max-h-full">
        <div className="flex items-center justify-between p-4 bg-slate-800 text-white">
          <div><h3 className="font-bold text-lg">Historial de Pagos</h3><p className="text-xs text-slate-300">{getPatientName(record)} - {record.treatment_name}</p></div>
          <button type="button" onClick={onClose} className="hover:text-red-400 p-1 transition"><X size={20} /></button>
        </div>
        <div className="p-5 overflow-y-auto bg-slate-50/50 flex-1 space-y-3">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen de Facturación</h4>
            <div className="grid grid-cols-3 gap-2">
              <div><span className="block text-slate-500 text-[11px]">Precio Base</span><span className="font-bold text-sm text-slate-700">{formatUsd(base)}</span></div>
              <div><span className="block text-slate-500 text-[11px]">Ajustes</span><span className={`font-bold text-sm ${diff > 0 ? 'text-amber-600' : 'text-blue-600'}`}>{diff !== 0 ? (diff > 0 ? '+' : '') + formatUsd(Math.abs(diff)) : '$0,00'}</span></div>
              <div><span className="block text-slate-500 text-[11px]">Total a Pagar</span><span className="font-bold text-sm text-[#0056b3]">{formatUsd(agreed)}</span></div>
            </div>
          </div>
          {(!record.payments_history || record.payments_history.length === 0) ? (
            <p className="text-center text-slate-400 py-10 text-sm">No hay pagos registrados.</p>
          ) : (
            record.payments_history.map(payment => (
              <div key={payment.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
                  <div><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Fecha de pago</span><span className="text-sm font-semibold text-slate-700">{new Date(payment.payment_date).toLocaleString('es-VE')}</span></div>
                  <div className="text-right"><span className="text-lg font-mono font-bold text-green-600">{formatUsd(payment.amount_usd)}</span><span className="block text-[10px] text-slate-400 mt-0.5">Por: {payment.registered_by}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-400 block">Método</span><span className="font-semibold text-slate-700">{payment.payment_method}</span></div>
                  <div><span className="text-xs text-slate-400 block">Referencia</span><span className="font-mono text-slate-700">{payment.reference_number || 'N/A'}</span></div>
                  {payment.amount_bs && (<><div><span className="text-xs text-slate-400 block">Tasa BCV</span><span className="font-mono text-slate-700">Bs. {payment.exchange_rate_bcv}</span></div><div><span className="text-xs text-slate-400 block">Monto Total Bs</span><span className="font-mono font-bold text-slate-800">Bs. {parseFloat(payment.amount_bs || 0).toLocaleString('es-VE')}</span></div></>)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}