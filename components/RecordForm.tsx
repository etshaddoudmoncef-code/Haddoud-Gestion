
import React, { useState, useEffect } from 'react';
import { ProductionRecord, MasterData } from '../types.ts';

interface Props {
  onSubmit: (record: Omit<ProductionRecord, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  masterData: MasterData;
  initialData?: ProductionRecord;
}

const RecordForm: React.FC<Props> = ({ onSubmit, masterData, initialData }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    lotNumber: '',
    clientName: masterData.clients[0] || '',
    productName: masterData.products[0] || '',
    packaging: masterData.packagings[0] || '',
    employeeCount: 0,
    totalProduction: 0,
    totalWeightKg: 0,
    wasteKg: 0,
    infestationRate: 0
  });

  useEffect(() => {
    if (initialData) setForm({ ...initialData });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lotNumber) return alert("Numéro de Lot requis");
    onSubmit(form);
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 space-y-6 animate-in zoom-in-95 duration-300">
      
      {/* Header Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Informations Générales</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" className={inputClass} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
          </div>
          <div>
            <label className={labelClass}>Numéro de Lot</label>
            <input type="text" className={inputClass + " uppercase text-blue-600"} placeholder="LOT-XXXX" value={form.lotNumber} onChange={e => setForm({...form, lotNumber: e.target.value})} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className={labelClass}>Produit</label>
             <select className={inputClass} value={form.productName} onChange={e => setForm({...form, productName: e.target.value})}>
               {masterData.products.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
          </div>
          <div>
             <label className={labelClass}>Client</label>
             <select className={inputClass} value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})}>
               {masterData.clients.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Resources & Output */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex justify-between">
           <span>Ressources & Production</span>
           <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Indicateurs Clés</span>
        </h3>
        
        {/* Highlighted Employee Section */}
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <label className={labelClass + " text-blue-400"}>Effectif Journalier (Nombre d'employés)</label>
          <div className="flex items-center gap-3">
             <span className="text-xl">👥</span>
             <input type="number" className={inputClass + " bg-white border-blue-200 text-lg"} placeholder="0" value={form.employeeCount || ''} onChange={e => setForm({...form, employeeCount: parseInt(e.target.value) || 0})} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Poids Net (Kg)</label>
            <input type="number" step="0.1" className={inputClass} placeholder="0.00" value={form.totalWeightKg || ''} onChange={e => setForm({...form, totalWeightKg: parseFloat(e.target.value) || 0})} required />
          </div>
          <div>
            <label className={labelClass + " text-red-400"}>Pertes / Déchets (Kg)</label>
            <input type="number" step="0.1" className={inputClass + " text-red-500 bg-red-50 border-red-100"} placeholder="0.00" value={form.wasteKg || ''} onChange={e => setForm({...form, wasteKg: parseFloat(e.target.value) || 0})} required />
          </div>
        </div>
      </div>

      <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[2rem] shadow-xl shadow-slate-200 text-[10px] uppercase tracking-widest active:scale-95 transition-all mt-4">
        {initialData ? 'Mettre à jour' : 'Enregistrer la production'}
      </button>
    </form>
  );
};

export default RecordForm;
