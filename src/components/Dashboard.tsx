import React from 'react';
import { Product, MutationLog, ExpiredStatus, calculateExpiredStatus, formatRupiah, generateId, WorkspaceData } from '../types';
import { Package, AlertTriangle, CheckCircle, Clock, Trash2, Edit, RefreshCw, Database, ClipboardCheck } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  setTab: (tab: string) => void;
  updateData: (updater: (prev: WorkspaceData) => WorkspaceData) => void;
}

export function Dashboard({ products, setTab, updateData }: DashboardProps) {
  const expiredCounts = products.reduce(
    (acc, prod) => {
      const status = calculateExpiredStatus(prod.expiredDate);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { EXPIRED: 0, CRITICAL: 0, WARNING: 0, SAFE: 0 } as Record<ExpiredStatus, number>
  );

  const lowStockCount = products.filter(p => p.stock < 10).length;

  if (products.length === 0) {
    const handleLoadDummy = () => {
      const now = new Date();
      const formatYMD = (d: Date) => d.toISOString().split('T')[0];
      
      const dummies: Product[] = [
        { id: generateId(), name: 'Susu UHT Full Cream 1L', sku: '8991234567890', category: 'Susu', location: 'Chiller 2 - B1', stock: 24, unit: 'Pcs', batchNo: 'B-001', expiredDate: formatYMD(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)), buyPrice: 15000, sellPrice: 18000, lastUpdated: now.toISOString() }, 
        { id: generateId(), name: 'Mie Instan Goreng', sku: '8991234567911', category: 'Makanan', location: 'Rak A1 - L3', stock: 5, unit: 'Karton', batchNo: 'B-002', expiredDate: formatYMD(new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)), buyPrice: 95000, sellPrice: 110000, lastUpdated: now.toISOString() },
        { id: generateId(), name: 'Kecap Manis Refill 520ml', sku: '8991234567554', category: 'Bumbu', location: 'Rak B4 - L1', stock: 12, unit: 'Pcs', batchNo: 'B-003', expiredDate: formatYMD(new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000)), buyPrice: 18000, sellPrice: 22000, lastUpdated: now.toISOString() },
        { id: generateId(), name: 'Roti Tawar Serbaguna', sku: '8991234567222', category: 'Makanan', location: 'Etalase Depan', stock: 8, unit: 'Pcs', batchNo: 'B-004', expiredDate: formatYMD(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)), buyPrice: 12000, sellPrice: 15000, lastUpdated: now.toISOString() },
        { id: generateId(), name: 'Sereal Cokelat 300g', sku: '8991234567333', category: 'Makanan', location: 'Rak A2 - L2', stock: 45, unit: 'Pcs', batchNo: 'B-005', expiredDate: formatYMD(new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)), buyPrice: 25000, sellPrice: 32000, lastUpdated: now.toISOString() },
        { id: generateId(), name: 'Air Mineral 600ml', sku: '8991234567111', category: 'Minuman', location: 'Chiller 1', stock: 120, unit: 'Botol', batchNo: 'B-006', expiredDate: formatYMD(new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)), buyPrice: 2500, sellPrice: 4000, lastUpdated: now.toISOString() },
        { id: generateId(), name: 'Minyak Goreng 2L', sku: '8991234567444', category: 'Bumbu', location: 'Rak C1', stock: 30, unit: 'Pcs', batchNo: 'B-007', expiredDate: formatYMD(new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000)), buyPrice: 32000, sellPrice: 35000, lastUpdated: now.toISOString() },
        { id: generateId(), name: 'Yogurt Strawberry 150ml', sku: '8991234567777', category: 'Minuman', location: 'Chiller 2', stock: 15, unit: 'Botol', batchNo: 'B-008', expiredDate: formatYMD(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)), buyPrice: 7000, sellPrice: 9500, lastUpdated: now.toISOString() },
        { id: generateId(), name: 'Sabun Mandi Cair 450ml', sku: '8991234567888', category: 'Lainnya', location: 'Rak D2', stock: 22, unit: 'Pcs', batchNo: 'B-009', expiredDate: formatYMD(new Date(now.getTime() + 600 * 24 * 60 * 60 * 1000)), buyPrice: 18000, sellPrice: 24000, lastUpdated: now.toISOString() },
        { id: generateId(), name: 'Beras Premium 5Kg', sku: '8991234567999', category: 'Makanan', location: 'Area Depan', stock: 50, unit: 'Pcs', batchNo: 'B-010', expiredDate: formatYMD(new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)), buyPrice: 65000, sellPrice: 72000, lastUpdated: now.toISOString() },
      ];

      const dummyLogs: MutationLog[] = dummies.map(p => ({
        id: generateId(),
        productId: p.id,
        productName: p.name,
        type: 'IN',
        qtyChange: p.stock,
        finalStock: p.stock,
        date: now.toISOString(),
        note: 'Stok awal (Auto-generated demo data)'
      }));

      updateData(prev => ({
        ...prev,
        products: [...prev.products, ...dummies],
        mutationLogs: [...prev.mutationLogs, ...dummyLogs]
      }));
    };

    return (
      <div className="flex flex-col items-center justify-center p-6 md:p-12 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm min-h-[60vh]">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <Database className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 text-center">Sistem Masih Kosong</h3>
        <p className="text-slate-500 text-center max-w-lg mb-8 text-sm md:text-lg">
          Anda belum memiliki data produk di sistem. Untuk melihat tampilan aplikasi secara penuh (termasuk fitur pengingat expired), silakan muat data contoh.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={handleLoadDummy}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 md:px-8 py-3 rounded-xl font-bold transition-colors flex items-center justify-center shadow-lg shadow-indigo-200 text-sm md:text-lg"
          >
            <Database className="w-5 h-5 mr-2" />
            Muat Data Dummy
          </button>
          <button 
            onClick={() => setTab('products')}
            className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-6 md:px-8 py-3 rounded-xl font-bold transition-colors text-sm md:text-lg"
          >
            Input Manual
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section: Hero & Total */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Hero Banner */}
        <div className="lg:col-span-8 bg-[#0F172A] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-lg">
          {/* Badges */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8 z-10 relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#00A97F] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full opacity-80"></span> LIVE MONITORING
              </span>
              <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-700">
                FEFO Aktif
              </span>
            </div>
            <span className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-xs font-bold border border-red-500/30 flex items-center gap-1.5">
              <span className="text-sm">🔥</span> {expiredCounts.EXPIRED + expiredCounts.CRITICAL} Produk Perlu Tindakan
            </span>
          </div>

          {/* Text Content */}
          <div className="z-10 relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Pengawasan Kedaluwarsa & Stok Fisik
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              Toko mendeteksi <span className="text-[#00A97F] font-bold">{(products.length > 0 ? ((expiredCounts.SAFE / products.length) * 100).toFixed(0) : 0)}%</span> barang dalam kondisi aman. Segera prioritaskan pemajangan barang terdekat tanggal expired untuk mencegah kerugian.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3 z-10 relative">
            <button className="bg-transparent text-red-400 border border-red-500/30 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-red-500/10 transition-colors">
              <AlertTriangle className="w-4 h-4" /> Filter Kritis & Expired ({expiredCounts.EXPIRED + expiredCounts.CRITICAL})
            </button>
            <button className="bg-[#00A97F] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#008f6b] transition-colors" onClick={() => setTab('products')}>
              Tampilkan Semua ({products.length})
            </button>
          </div>
          
          {/* Decorative background shape */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-gradient-to-br from-[#00A97F]/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Right: Total Fisik */}
        <div className="lg:col-span-4 bg-white border-2 border-[#00A97F] rounded-3xl p-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-sm font-extrabold text-[#00A97F] tracking-widest">TOTAL FISIK INVENTARIS</h3>
              <div className="w-10 h-10 bg-[#00A97F] rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-6xl font-black text-slate-900 tracking-tighter">{products.length}</span>
              <span className="text-xl font-bold text-slate-400">Unit</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="bg-[#00A97F]/10 text-[#00A97F] px-3 py-1 rounded-md text-xs font-bold">
                {products.length} SKU Terdaftar
              </span>
              <span className="text-slate-500 text-xs font-bold">
                {lowStockCount} Menipis
              </span>
            </div>
          </div>

          <button 
            onClick={() => setTab('opname')}
            className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-bold mt-8 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <ClipboardCheck className="w-5 h-5" />
            Mulai Sesi Stok Opname
          </button>
        </div>
      </div>

      {/* 5-Card Metric Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Expired */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-extrabold text-red-600 tracking-widest uppercase">Expired</span>
            <span className="text-red-600 bg-red-50 p-1.5 rounded-full border border-red-100">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-4xl font-black text-slate-900 block mb-1">{expiredCounts.EXPIRED}</span>
            <span className="text-[10px] font-bold text-red-500">Sudah Lewat</span>
          </div>
        </div>

        {/* Kritis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-extrabold text-orange-500 tracking-widest uppercase">Kritis (H-7)</span>
            <span className="text-orange-500 bg-orange-50 p-1.5 rounded-full border border-orange-100">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-4xl font-black text-slate-900 block mb-1">{expiredCounts.CRITICAL}</span>
            <span className="text-[10px] font-bold text-orange-500">Sisa 1-7 Hari</span>
          </div>
        </div>

        {/* Waspada */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-extrabold text-yellow-600 tracking-widest uppercase">Waspada (H-30)</span>
            <span className="text-yellow-600 bg-yellow-50 p-1.5 rounded-full border border-yellow-100">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-4xl font-black text-slate-900 block mb-1">{expiredCounts.WARNING}</span>
            <span className="text-[10px] font-bold text-yellow-600">Sisa 8-30 Hari</span>
          </div>
        </div>

        {/* Aman */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-extrabold text-[#00A97F] tracking-widest uppercase">Stok Aman</span>
            <span className="text-[#00A97F] bg-[#00A97F]/10 p-1.5 rounded-full border border-[#00A97F]/20">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-4xl font-black text-slate-900 block mb-1">{expiredCounts.SAFE}</span>
            <span className="text-[10px] font-bold text-[#00A97F]">&gt; 30 Hari Simpan</span>
          </div>
        </div>

        {/* Menipis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-extrabold text-orange-600 tracking-widest uppercase">Stok Menipis</span>
            <span className="text-orange-600 bg-orange-50 p-1.5 rounded-full border border-orange-100">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-4xl font-black text-slate-900 block mb-1">{lowStockCount}</span>
            <span className="text-[10px] font-bold text-orange-500">Perlu Restock</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-indigo-500" />
            Pantauan Stok Kritis & Kadaluarsa
          </h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors" onClick={() => setTab('products')}>
              Lihat Semua
            </button>
            <button className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors underline underline-offset-4" onClick={() => setTab('opname')}>
              Buka Stok Opname
            </button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest sticky top-0">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Produk & Barcode</th>
                <th className="px-6 py-4 whitespace-nowrap">Kategori</th>
                <th className="px-6 py-4 whitespace-nowrap">Lokasi Rak</th>
                <th className="px-6 py-4 whitespace-nowrap">Stok</th>
                <th className="px-6 py-4 whitespace-nowrap">Expired Date</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {products
                .filter(p => ['EXPIRED', 'CRITICAL', 'WARNING'].includes(calculateExpiredStatus(p.expiredDate)) || p.stock < 10)
                .sort((a, b) => new Date(a.expiredDate).getTime() - new Date(b.expiredDate).getTime())
                .map(p => {
                  const status = calculateExpiredStatus(p.expiredDate);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.sku}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-bold">{p.category}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">{p.location}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">
                        {p.stock < 10 ? <span className="text-red-600">{p.stock} {p.unit}</span> : `${p.stock} ${p.unit}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{p.expiredDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                          status === 'EXPIRED' ? 'bg-red-100 text-red-700 border-red-200' :
                          status === 'CRITICAL' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          status === 'WARNING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada data produk. Stok aman.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Opname Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-indigo-900 text-white p-4 rounded-2xl shadow-lg gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-700 rounded-lg">
            <RefreshCw className="w-6 h-6 text-indigo-100" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Live Opname Status</p>
            <p className="text-sm">Siap untuk melakukan perhitungan stok aktual</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTab('opname')}
            className="bg-white text-indigo-900 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
          >
            Mulai Opname
          </button>
        </div>
      </div>
    </div>
  );
}
