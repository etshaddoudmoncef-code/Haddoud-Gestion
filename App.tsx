
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
  products: ['Tomate Roma', 'Tomate Cerise', 'Poivron Rouge', 'Poivron Vert', 'Concombre'],
  clients: ['Marché de Gros', 'Superette Center', 'Export France', 'Export Dubaï'],
  packagings: ['Caisse 10kg', 'Caisse 5kg', 'Plateau', 'Vrac'],
  suppliers: ['AgriPlus', 'Sidi Bel Abbes Semences', 'Local Farmer'],
  purchaseCategories: ['Intrants', 'Emballages', 'Maintenance', 'Semences'],
  serviceTypes: ['Triage', 'Calibrage', 'Conditionnement', 'Lavage']
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

  const generateTestData = () => {
    if(!confirm("Générer des données de test pour la semaine ?")) return;
    
    const newRecords: ProductionRecord[] = [];
    const products = masterData.products;
    const clients = masterData.clients;

    // Generate data for last 7 days to show trend
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 1 to 3 records per day
      const dailyCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < dailyCount; j++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        // Logic: More employees = roughly more weight
        const emp = Math.floor(Math.random() * 10) + 5; // 5 to 15 employees
        const productivity = 50 + Math.random() * 30; // 50 to 80 kg per person
        const totalW = Math.floor(emp * productivity);
        
        newRecords.push({
          id: generateId(),
          date: dateStr,
          lotNumber: `LOT-${date.getMonth()+1}${date.getDate()}-${j+1}`,
          clientName: clients[Math.floor(Math.random() * clients.length)],
          productName: prod,
          employeeCount: emp,
          totalWeightKg: totalW,
          wasteKg: Math.floor(totalW * (0.02 + Math.random() * 0.05)), // 2-7% waste
          infestationRate: Math.floor(Math.random() * 5),
          timestamp: date.getTime() + j
        });
      }
    }

    setRecords([...newRecords, ...records]);
    alert(`${newRecords.length} enregistrements de production générés.`);
    setActiveTab('production');
    setProductionSubTab('dash');
  };

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
          onGenerateTestData={generateTestData}
        />
      )}
    </Layout>
  );
}
