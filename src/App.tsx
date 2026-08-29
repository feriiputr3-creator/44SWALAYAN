import React, { useState } from 'react';
import { useSwalayanData } from './hooks/useSwalayanData';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { StockOpname } from './components/StockOpname';
import { MutationHistory } from './components/MutationHistory';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  ClipboardCheck, 
  History, 
  CheckCircle,
  CloudOff, 
  RefreshCw,
  Menu,
  X
} from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const { data, updateData, isLoadedFromCloud, isSyncing, syncError, lastSyncTime } = useSwalayanData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'products', label: 'Master Produk', icon: <Package className="w-5 h-5" /> },
    { id: 'opname', label: 'Stok Opname', icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: 'mutations', label: 'Log Mutasi', icon: <History className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard products={data.products} setTab={setActiveTab} updateData={updateData} />;
      case 'products': return <ProductList products={data.products} updateData={updateData} />;
      case 'opname': return <StockOpname products={data.products} updateData={updateData} />;
      case 'mutations': return <MutationHistory logs={data.mutationLogs} />;
      default: return <Dashboard products={data.products} setTab={setActiveTab} updateData={updateData} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white shadow-sm z-20 sticky top-0 shrink-0 border-b border-slate-200">
        <div className="px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-2">
          {/* Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 md:w-12 md:h-12 bg-[#00A97F] rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm cursor-pointer hover:bg-[#008f6b] transition-colors">
              <Store className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-black text-base md:text-xl text-slate-800 tracking-tighter">44SWALAYAN</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center bg-white border border-slate-200 rounded-full p-1.5 shadow-sm">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-full transition-colors cursor-pointer text-sm font-bold",
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {React.cloneElement(tab.icon, { className: cn("w-4 h-4", activeTab === tab.id ? "text-indigo-400" : "") })}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Sync Badge / Time */}
            <div className="hidden xl:flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-full border border-slate-200 text-slate-700" title={lastSyncTime ? `Last synced: ${lastSyncTime.toLocaleTimeString('id-ID')}` : 'Offline'}>
              {isSyncing ? (
                 <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
              ) : syncError ? (
                 <CloudOff className="w-4 h-4 text-red-500" />
              ) : (
                 <CheckCircle className="w-4 h-4 text-[#00A97F]" />
              )}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  {lastSyncTime ? lastSyncTime.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : 'Syncing'}
                </span>
                <span className="text-[9px] text-slate-500 leading-tight uppercase font-bold tracking-wider">
                  {lastSyncTime ? lastSyncTime.toLocaleDateString('id-ID', {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'}) : ''}
                </span>
              </div>
            </div>
            
            {/* Buttons */}
            <button className="flex items-center justify-center gap-1.5 bg-[#00A97F] text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm shadow-md hover:bg-[#008f6b] transition-colors" onClick={() => setActiveTab('products')}>
              <span className="text-sm md:text-lg leading-none">+</span> Tambah
            </button>
          </div>
        </div>

        {/* Mobile Nav (Scrollable) */}
        <nav className="lg:hidden flex overflow-x-auto px-4 py-3 gap-2 border-t border-slate-100 [&::-webkit-scrollbar]:hidden bg-white" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-colors cursor-pointer text-sm font-bold whitespace-nowrap shrink-0",
                activeTab === tab.id 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {React.cloneElement(tab.icon, { className: cn("w-4 h-4", activeTab === tab.id ? "text-indigo-400" : "") })}
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Page Title & Warnings */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-semibold text-slate-800">
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
          
          {!isLoadedFromCloud && (
            <span className="flex items-center text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-sm font-medium">
               <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> 
               <span className="hidden sm:inline">Memuat data Cloud...</span>
            </span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
