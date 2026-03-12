import React, { useEffect } from 'react';
import { X, CreditCard, Loader2, RotateCcw } from 'lucide-react';

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

const parseLocaleNumber = (val) => {
  if (!val) return NaN;
  return parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
};

export function PaymentModal({ isOpen, onClose, record, records = [], form, setForm, onSubmit, submitting }) {
  const activeRecords = records.length > 0 ? records : (record ? [record] : []);
  if (!isOpen || activeRecords.length === 0) return null;
  const baseRecord = activeRecords[0];
  const balance = activeRecords.reduce((acc, r) => acc + parseFloat(r.balance || 0), 0);
  const isGroupPayment = activeRecords.length > 1;
  const showBsFields = form.payment_method === 'Pago Móvil' || form.payment_method === 'Transferencia (Bs)' || form.payment_method === 'Punto de Venta';

  // Lógica de cálculo inverso (Bs -> USD)
  const handleBsChange = (newBs) => {
    const bsValue = parseLocaleNumber(newBs);
    const rateValue = parseLocaleNumber(form.exchange_rate_bcv);
    
    let newUsd = form.amount_usd;
    
    // Si tenemos Bs y Tasa, calculamos USD
    if (!Number.isNaN(bsValue) && !Number.isNaN(rateValue) && rateValue > 0) {
      const calculatedUsd = bsValue / rateValue;
      newUsd = calculatedUsd.toFixed(2).replace('.', ',');
    }

    setForm({ ...form, amount_bs: newBs, amount_usd: formatNumberInput(newUsd) });
  };

  const handleRateChange = (newRate) => {
    // Al cambiar tasa en métodos en Bs, mantenemos fijo el monto en Bs
    // y solo recalculamos el equivalente en USD.
    const rateValue = parseLocaleNumber(newRate);
    const bsValue = parseLocaleNumber(form.amount_bs);

    let updates = { exchange_rate_bcv: newRate };

    if (!Number.isNaN(rateValue) && rateValue > 0) {
      if (!Number.isNaN(bsValue) && bsValue > 0) {
        const calculatedUsd = bsValue / rateValue;
        updates.amount_usd = formatNumberInput(calculatedUsd.toFixed(2).replace('.', ','));
      }
    }
    
    setForm({ ...form, ...updates });
  };

  const handleUsdChange = (newUsd) => {
    const usdValue = parseLocaleNumber(newUsd);
    const rateValue = parseLocaleNumber(form.exchange_rate_bcv);
    
    let newBs = form.amount_bs;

    if (!Number.isNaN(usdValue) && !Number.isNaN(rateValue) && rateValue > 0) {
      const calculatedBs = usdValue * rateValue;
      newBs = formatNumberInput(calculatedBs.toFixed(2).replace('.', ','));
    }

    setForm({ ...form, amount_usd: newUsd, amount_bs: newBs });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-[#0056b3] text-white">
          <h3 className="font-bold text-lg">{isGroupPayment ? 'Registrar Pago Grupal' : 'Registrar Pago'}</h3>
          <button type="button" onClick={onClose} className="hover:text-blue-100 transition"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-600">Paciente: <span className="font-bold text-slate-800">{getPatientName(baseRecord)}</span></p>
            <p className="text-sm text-slate-600 mt-1">{isGroupPayment ? 'Deuda Total Seleccionada' : 'Deuda Actual'}: <span className="font-bold text-rose-700">{formatUsd(balance)}</span></p>
            {isGroupPayment && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-semibold mb-1">Tratamientos seleccionados:</p>
                <ul className="text-xs text-slate-700 list-disc pl-4 space-y-0.5">
                  {activeRecords.map((r) => (
                    <li key={r.lead_treatment_id || r.id}>{r.treatment_name || 'Tratamiento'}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Método de Pago</label>
            <select required value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value, amount_bs: '', exchange_rate_bcv: '' })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] bg-white">
              <option value="Zelle">Zelle</option>
              <option value="Efectivo USD">Efectivo USD</option>
              <option value="Pago Móvil">Pago Móvil</option>
              <option value="Transferencia (Bs)">Transferencia (Bs)</option>
              <option value="Binance">Binance</option>
              <option value="Punto de Venta">Punto de Venta</option>
            </select>
          </div>

          {/* Si es en Bs, mostramos primero Bs y Tasa */}
          {showBsFields ? (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monto en Bolívares</label>
                  <input 
                    type="text" 
                    value={form.amount_bs} 
                    onChange={(e) => handleBsChange(formatNumberInput(e.target.value))} 
                    className="w-full p-2.5 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3] font-bold text-slate-800" 
                    placeholder="Ej: 1.500,00" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tasa de Cambio</label>
                  <input 
                    type="text" 
                    required 
                    value={form.exchange_rate_bcv} 
                    onChange={(e) => handleRateChange(formatNumberInput(e.target.value))} 
                    className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" 
                    placeholder="Ej: 60,50" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Equivalente en USD (Automático)</label>
                <input 
                  type="text" 
                  readOnly 
                  value={form.amount_usd} 
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white text-green-700 font-mono font-bold" 
                />
              </div>
            </div>
          ) : (
            // Si es USD directo (Zelle, Efectivo, Binance)
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Monto a Pagar USD</label>
              <input 
                type="text" 
                required 
                value={form.amount_usd} 
                onChange={(e) => setForm({ ...form, amount_usd: formatNumberInput(e.target.value) })} 
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" 
                placeholder="Ej: 100,00" 
              />
            </div>
          )}

          {form.payment_method !== 'Efectivo USD' && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Referencia / Comprobante</label>
              <input type="text" required value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0056b3]" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition" disabled={submitting}>Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-[#0056b3] text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition inline-flex items-center gap-2 disabled:opacity-70" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {submitting ? 'Guardando...' : 'Registrar Pago'}
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
              <option value="discount">Aplicar Descuento (-)</option>
              <option value="extra">Cargo Extra / Recargo (+)</option>
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

export function ReverseModal({ isOpen, onClose, record, form, setForm, onSubmit, submitting, formatInput }) {
  if (!isOpen || !record) return null;
  const paidAmount = parseFloat(record.amount_paid || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-rose-700 text-white">
          <h3 className="font-bold flex items-center gap-2"><RotateCcw size={20}/> Reversar Pago</h3>
          <button type="button" onClick={onClose} className="hover:text-rose-200 transition"><X size={20} /></button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-sm">
            <p className="text-slate-600 mb-1">Paciente: <span className="font-bold text-slate-800">{getPatientName(record)}</span></p>
            <p className="text-slate-600">Monto disponible para reversar: <span className="font-bold text-rose-700">{formatUsd(paidAmount)}</span></p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Monto a Reversar (USD)</label>
            <input 
              type="text" 
              required 
              value={form.amount_usd} 
              onChange={(e) => setForm({ ...form, amount_usd: formatInput(e.target.value) })} 
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 font-bold text-rose-700" 
              placeholder="Ej: 50,00" 
            />
            <p className="text-[10px] text-slate-400 mt-1">Este monto se restará de lo pagado y aumentará la deuda.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Motivo del Reverso</label>
            <input 
              type="text" 
              required 
              value={form.reference_number} 
              onChange={(e) => setForm({ ...form, reference_number: e.target.value })} 
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
              placeholder="Ej: Cancelación de tratamiento, Devolución..." 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition" disabled={submitting}>Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-rose-700 text-white rounded-lg font-bold hover:bg-rose-800 shadow-sm transition inline-flex items-center gap-2 disabled:opacity-70" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Confirmar Reverso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


