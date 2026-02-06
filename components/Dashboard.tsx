
import React, { useMemo } from 'react';
import { ProductionRecord } from '../types.ts';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  XAxis, YAxis, ComposedChart, Bar, Line, Legend 
} from 'recharts';

interface DashboardProps {
  records: ProductionRecord[];
  isAdmin: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = useMemo(() => records.filter(r => r.date === today), [records, today]);

  const metrics = useMemo(() => {
    const totalKg = todayRecords.reduce((s, r) => s + (r.totalWeightKg || 0), 0);
    const totalEmp = todayRecords.reduce((s, r) => s + (r.employeeCount || 0), 0);
    const totalWaste = todayRecords.reduce((s, r) => s + (r.wasteKg || 0), 0);
    
    // Calculate previous day for comparison (simple trend)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    const yKg = records.filter(r => r.date === yStr).reduce((s, r) => s + r.totalWeightKg, 0);
    
    return { 
      kg: totalKg.toLocaleString('fr-FR', { maximumFractionDigits: 1 }), 
      emp: totalEmp, 
      waste: totalWaste.toLocaleString('fr-FR', { maximumFractionDigits: 1 }),
      yield: totalEmp > 0 ? (totalKg / totalEmp).toFixed(1) : '0',
      trend: totalKg >= yKg ? 'up' : 'down'
    };
  }, [todayRecords, records]);

  // Advanced chart data: correlating Production vs Employees
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];
    
    // Group by date
    const grouped = records.reduce((acc, r) => {
      if (!acc[r.date]) acc[r.date] = { date: r.date, weight: 0, employees: 0, count: 0 };
      acc[r.date].weight += r.totalWeightKg;
      acc[r.date].employees += r.employeeCount; // Sum of employees across all lots this day
      acc[r.date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10) // Last 10 days
      .map((d: any) => ({
        name: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        Production: d.weight,
        Effectif: d.employees, // Total man-days or sum of teams
      }));
  }, [records]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero Card */}
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Production du Jour</p>
              <h2 className="text-5xl font-black tracking-tight">{metrics.kg} <span className="text-lg font-medium opacity-50">kg</span></h2>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metrics.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <span className="text-xl font-bold">{metrics.trend === 'up' ? '↗' : '↘'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Effectif Total</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{metrics.emp}</span>
                <span className="text-[10px] opacity-60">Pers.</span>
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
              <p className="text-[9px] font-bold text-emerald-400 uppercase mb-1">Productivité</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-300">{metrics.yield}</span>
                <span className="text-[10px] opacity-60">kg/p</span>
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
              <p className="text-[9px] font-bold text-red-400 uppercase mb-1">Pertes</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-red-300">{metrics.waste}</span>
                <span className="text-[10px] opacity-60">kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Chart */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Performance & Effectif</h3>
            <p className="text-[10px] text-slate-400 font-medium">Production vs Nombre d'employés (10 derniers jours)</p>
          </div>
        </div>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis yAxisId="left" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis yAxisId="right" orientation="right" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                <Bar yAxisId="left" dataKey="Production" name="Production (Kg)" barSize={12} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="Effectif" name="Employés" stroke="#f59e0b" strokeWidth={3} dot={{r: 3, fill:'#f59e0b', strokeWidth:0}} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <span className="text-2xl mb-2">📊</span>
              <p className="text-xs">Pas assez de données pour le graphique</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
