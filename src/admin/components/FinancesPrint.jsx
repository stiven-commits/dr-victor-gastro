import React from 'react';

const formatUsd = (value) => `$${Number(value || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinancesPrint({ payments, totalIncome, totalCredit = 0, incomeByMethod, incomeByTreatment, dateRange, currentUser, logo }) {
  // Agrupar por paciente
  const groupedByPatient = payments.reduce((acc, pay) => {
    const key = `${pay.patient_name}-${pay.cedula}`;
    if (!acc[key]) {
      acc[key] = { name: pay.patient_name, cedula: pay.cedula, items: [], total: 0 };
    }
    acc[key].items.push(pay);
    acc[key].total += parseFloat(pay.amount_usd);
    return acc;
  }, {});

  const sortedGroups = Object.values(groupedByPatient).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="print-area hidden bg-white text-black font-sans p-8">
      <style>{`
        @media print {
          @page { size: letter landscape; margin: 5mm; }
          body { background: white !important; margin: 0; padding: 0; }
          aside, header, .no-print { display: none !important; }
          .print-area { display: block !important; width: 100%; position: absolute; top: 0; left: 0; }
          .page-break { page-break-inside: avoid; }
        }
      `}</style>

      {/* ENCABEZADO */}
      <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4">
        <div>
          <img src={logo} alt="Logo" className="h-10 w-auto mb-2" />
          <h1 className="text-lg font-black uppercase tracking-widest text-slate-900">Resumen de Caja Diario</h1>
          <h2 className="text-sm font-bold text-slate-600 mt-0.5">Dr. VÃ­ctor - GastroenterologÃ­a ClÃ­nica</h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-600">Periodo: {dateRange.start || 'Inicio'} al {dateRange.end || 'Hoy'}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Impreso: {new Date().toLocaleString('es-VE')}</p>
          <p className="text-[10px] text-slate-500">Por: {currentUser.username}</p>
        </div>
      </div>

      {/* TABLA AGRUPADA */}
      <div className="space-y-6 mb-6">
        {sortedGroups.length === 0 ? (<p className="text-center italic text-slate-500 py-10">No hay movimientos.</p>) : sortedGroups.map((group, idx) => (
          <div key={idx} className="page-break">
            <div className="bg-slate-100 px-2 py-1 border-l-4 border-slate-800 flex justify-between items-center mb-1">
              <h3 className="font-bold text-xs uppercase text-slate-800">{group.name} <span className="font-normal text-slate-500 ml-2">({group.cedula || 'Sin CI'})</span></h3>
            </div>
            <table className="w-full text-left text-[10px] border-collapse mb-2">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase tracking-tight">
                  <th className="p-1 w-16">Hora</th><th className="p-1">Tratamiento</th><th className="p-1 w-20">MÃ©todo</th><th className="p-1">Referencia</th><th className="p-1 text-right w-20">Total Proc.</th><th className="p-1 text-right w-20">AbonÃ³</th><th className="p-1 text-right w-20 bg-slate-50">Restaba</th><th className="p-1 text-right w-20 bg-emerald-50">Crédito</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map(p => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="p-1">{new Date(p.payment_date).toLocaleTimeString('es-VE', {hour:'2-digit', minute:'2-digit'})}</td>
                    <td className="p-1 font-medium">{p.treatment_name}</td>
                    <td className="p-1">{p.payment_method}</td>
                    <td className="p-1 font-mono text-[9px]">{p.reference_number || '-'}</td>
                    <td className="p-1 text-right text-slate-400">{formatUsd(p.total_treatment_cost)}</td>
                    <td className="p-1 text-right font-bold text-slate-800">{formatUsd(p.amount_usd)}</td>
                    <td className="p-1 text-right font-bold text-slate-600 bg-slate-50">{formatUsd(p.historical_balance)}</td><td className="p-1 text-right font-bold text-emerald-700 bg-emerald-50">{formatUsd(p.historical_credit || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* DESGLOSE FINAL */}
      <div className="grid grid-cols-3 gap-6 mb-6 border-t-2 border-slate-800 pt-4 page-break-inside-avoid">
        <div><h3 className="font-bold text-[11px] uppercase mb-2 text-slate-800">Desglose por MÃ©todo</h3><div className="space-y-1">{Object.entries(incomeByMethod).map(([method, amount]) => (<div key={method} className="flex justify-between text-[10px] border-b border-dashed border-gray-200 pb-1"><span>{method}</span><span className="font-bold">{formatUsd(amount)}</span></div>))}</div></div>
        <div><h3 className="font-bold text-[11px] uppercase mb-2 text-slate-800">Resumen Procedimientos</h3><div className="space-y-1">{Object.entries(incomeByTreatment).map(([treatment, data]) => (<div key={treatment} className="flex justify-between text-[10px] border-b border-dashed border-gray-200 pb-1"><span className="truncate pr-2">{treatment} <strong>(x{data.countSet.size})</strong></span><span className="font-bold">{formatUsd(data.amount)}</span></div>))}</div></div>
        <div className="flex flex-col justify-end items-end"><div className="bg-slate-100 p-3 rounded-lg w-56 text-right border border-slate-200"><p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Ingreso Total</p><p className="text-xl font-black text-slate-900">{formatUsd(totalIncome)}</p><p className="text-[10px] uppercase font-bold text-emerald-700 mt-2 mb-0.5">Crédito Total</p><p className="text-sm font-black text-emerald-700">{formatUsd(totalCredit)}</p></div></div>
      </div>

      <div className="border-t border-slate-300 pt-3 mt-6 page-break-inside-avoid">
        <p className="font-bold text-[11px] mb-4 text-slate-800">Observaciones Generales:</p>
        <div className="w-full border-b border-slate-400 mb-6"></div>
        <div className="w-full border-b border-slate-400 mb-8"></div>
        <div className="flex justify-center mt-12 pt-6"><div className="text-center w-56"><div className="border-b border-slate-800 mb-2"></div><p className="font-bold text-[11px] text-slate-800">Recibido / Firma del Doctor</p><p className="text-[9px] text-slate-500 mt-1">Dr. VÃ­ctor</p></div></div>
      </div>
    </div>
  );
}
