import React, { useState, useEffect } from 'react';
import { 
  User, ProductionRecord, MasterData, MainTab, 
  PurchaseRecord, StockOutRecord, PrestationProdRecord, PrestationEtuvageRecord 
} from './types.ts';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import RecordForm from './components/RecordForm.tsx';
import History from './components/History.tsx';
import AiInsights from './components/AiInsights.tsx';
import Login from './components/Login.tsx';
import Management from './components/Management.tsx';
import PurchaseModule from './components/PurchaseModule.tsx';
import StockModule from './components/StockModule.tsx';
import PrestationProdModule from './components/PrestationProdModule.tsx';
import PrestationEtuvageModule from './components/PrestationEtuvageModule.tsx';
import LotTraceability from './components/LotTraceability.tsx';

export const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_MASTER: MasterData = {
  products: ['Tomate Roma', 'Tomate Cerise', 'Poivron', 'Concombre'],
  clients: ['Local Market', 'Export FR', 'Export DE'],
  packagings: ['Caisse 10kg', 'Caisse 5kg', 'Plateau'],
  suppliers: ['AgriPlus', 'Sidi Bel Abbes', 'Local Farmer'],
  purchaseCategories: ['Intrants', 'Emballages', 'Maintenance'],
  serviceTypes: ['Triage', 'Calibrage', 'Conditionnement']
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('prod_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('prod_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<MainTab>('production');
  const [productionSubTab, setProductionSubTab] = useState<'dash' | 'form' | 'history' | 'trace'>('dash');

  const [records, setRecords] = useState<ProductionRecord[]>(() => {
    const saved = localStorage.getItem('prod_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem('prod_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockOuts, setStockOuts] = useState<StockOutRecord[]>(() => {
    const saved = localStorage.getItem('prod_stock_outs');
    return saved ? JSON.parse(saved) : [];
  });

  const [prestationsProd, setPrestationsProd] = useState<PrestationProdRecord[]>(() => {
    const saved = localStorage.getItem('prod_prestation_prod');
    return saved ? JSON.parse(saved) : [];
  });

  const [prestationsEtuvage, setPrestationsEtuvage] = useState<PrestationEtuvageRecord[]>(() => {
    const saved = localStorage.getItem('prod_prestation_etuvage');
    return saved ? JSON.parse(saved) : [];
  });

  const [masterData, setMasterData] = useState<MasterData>(() => {
    const saved = localStorage.getItem('prod_master_data');
    return saved ? JSON.parse(saved) : DEFAULT_MASTER;
  });

  useEffect(() => {
    localStorage.setItem('prod_users', JSON.stringify(users));
    localStorage.setItem('prod_records', JSON.stringify(records));
    localStorage.setItem('prod_purchases', JSON.stringify(purchases));
    localStorage.setItem('prod_stock_outs', JSON.stringify(stockOuts));
    localStorage.setItem('prod_prestation_prod', JSON.stringify(prestationsProd));
    localStorage.setItem('prod_prestation_etuvage', JSON.stringify(prestationsEtuvage));
    localStorage.setItem('prod_master_data', JSON.stringify(masterData));
    if (user) localStorage.setItem('prod_current_user', JSON.stringify(user));
    else localStorage.removeItem('prod_current_user');
  }, [user, users, records, purchases, stockOuts, prestationsProd, prestationsEtuvage, masterData]);

  if (!user) {
    return (
      <Login 
        existingUsers={users} 
        onLogin={setUser} 
        onRegisterAdmin={(u) => { setUsers([...users, u]); setUser(u); }} 
      />
    );
  }

  const renderProduction = () => (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
        {[
          { id: 'dash', label: 'Dashboard' },
          { id: 'form', label: 'Saisie' },
          { id: 'history', label: 'Journal' },
          { id: 'trace', label: 'Traçabilité' }
        ].map((t) => (
          <button 
            key={t.id}
            onClick={() => setProductionSubTab(t.id as any)}
            className={`flex-1 min-w-[80px] py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${productionSubTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {productionSubTab === 'dash' && <Dashboard records={records} isAdmin={user.role === 'ADMIN'} />}
      {productionSubTab === 'form' && (
        <RecordForm 
          masterData={masterData} 
          onSubmit={(data) => {
            const newRecord = { ...data, id: generateId(), timestamp: Date.now() };
            setRecords([newRecord as ProductionRecord, ...records]);
            setProductionSubTab('dash');
          }} 
        />
      )}
      {productionSubTab === 'history' && (
        <History 
          records={records} 
          isAdmin={user.role === 'ADMIN'} 
          onEdit={(r) => { /* Implement edit if needed */ }} 
          onDelete={(id) => setRecords(records.filter(r => r.id !== id))} 
        />
      )}
      {productionSubTab === 'trace' && <LotTraceability records={records} purchases={purchases} />}
    </div>
  );

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={() => setUser(null)}
    >
      {activeTab === 'production' && renderProduction()}
      
      {activeTab === 'prestation_prod' && (
        <PrestationProdModule 
          records={prestationsProd} 
          masterData={masterData}
          isAdmin={user.role === 'ADMIN'}
          onAdd={(d) => setPrestationsProd([{...d, id: generateId(), timestamp: Date.now()}, ...prestationsProd])}
          onUpdate={(id, d) => setPrestationsProd(prestationsProd.map(r => r.id === id ? {...r, ...d} : r))}
          onDelete={(id) => setPrestationsProd(prestationsProd.filter(r => r.id !== id))}
        />
      )}

      {activeTab === 'prestation_etuvage' && (
        <PrestationEtuvageModule 
          records={prestationsEtuvage} 
          masterData={masterData}
          isAdmin={user.role === 'ADMIN'}
          onAdd={(d) => setPrestationsEtuvage([{...d, id: generateId(), timestamp: Date.now()}, ...prestationsEtuvage])}
          onUpdate={(id, d) => setPrestationsEtuvage(prestationsEtuvage.map(r => r.id === id ? {...r, ...d} : r))}
          onDelete={(id) => setPrestationsEtuvage(prestationsEtuvage.filter(r => r.id !== id))}
        />
      )}

      {activeTab === 'stock' && (
        <StockModule 
          purchases={purchases}
          stockOuts={stockOuts}
          masterData={masterData}
          isAdmin={user.role === 'ADMIN'}
          onAddPurchase={(d) => setPurchases([{...d, id: generateId(), timestamp: Date.now()}, ...purchases])}
          onAddStockOut={(d) => setStockOuts([{...d, id: generateId(), timestamp: Date.now()}, ...stockOuts])}
          onUpdatePurchase={(id, d) => setPurchases(purchases.map(r => r.id === id ? {...r, ...d} : r))}
          onUpdateStockOut={(id, d) => setStockOuts(stockOuts.map(r => r.id === id ? {...r, ...d} : r))}
          onDeletePurchase={(id) => setPurchases(purchases.filter(r => r.id !== id))}
          onDeleteStockOut={(id) => setStockOuts(stockOuts.filter(s => s.id !== id))}
        />
      )}

      {activeTab === 'insights' && <AiInsights records={records} isAdmin={user.role === 'ADMIN'} />}

      {activeTab === 'management' && (
        <Management 
          data={masterData} 
          users={users} 
          onUpdate={setMasterData}
          onAddUser={(u) => setUsers([...users, u])}
          onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
          onUpdatePermissions={(id, tabs) => setUsers(users.map(u => u.id === id ? {...u, allowedTabs: tabs} : u))}
        />
      )}
    </Layout>
  );
}