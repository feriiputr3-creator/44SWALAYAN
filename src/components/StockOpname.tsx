import React, { useState } from 'react';
import { Product, WorkspaceData, generateId } from '../types';
import { ClipboardCheck, Printer, Save, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { BAPOPrint } from './BAPOPrint';

interface StockOpnameProps {
  products: Product[];
  updateData: (updater: (prev: WorkspaceData) => WorkspaceData) => void;
}

interface OpnameEntry {
  productId: string;
  actualStock: string; // Keep as string for empty state
  systemStock?: string; // Optional because we fall back to p.stock
}

export function StockOpname({ products, updateData }: StockOpnameProps) {
  const [entries, setEntries] = useState<Record<string, OpnameEntry>>({});
  const [isPrintMode, setIsPrintMode] = useState(false);
  
  // Form Info
  const [examiner, setExaminer] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [notes, setNotes] = useState('');

  const handleStockChange = (productId: string, value: string) => {
    setEntries(prev => ({
      ...prev,
      [productId]: { ...prev[productId], productId, actualStock: value }
    }));
  };

  const handleSystemStockChange = (productId: string, value: string) => {
    setEntries(prev => ({
      ...prev,
      [productId]: { ...prev[productId], productId, systemStock: value, actualStock: prev[productId]?.actualStock ?? '' }
    }));
  };

  const handleApplyOpname = () => {
    if (!examiner || !supervisor) {
      alert("Nama pemeriksa dan supervisor wajib diisi untuk legalitas!");
      return;
    }

    if (Object.keys(entries).length === 0) {
      alert("Belum ada data fisik yang diinput!");
      return;
    }

    if(window.confirm('Terapkan hasil opname ini ke Master Stok? Tindakan ini tidak dapat dibatalkan.')) {
      const now = new Date().toISOString();
      const newMutations: any[] = [];
      
      updateData(prev => {
        const nextProducts = prev.products.map(p => {
          const entry = entries[p.id];
          if (!entry || entry.actualStock === '') return p;
          
          const actualVal = parseInt(entry.actualStock);
          const diff = actualVal - p.stock;
          
          if (diff !== 0) {
            newMutations.push({
              id: generateId(),
              productId: p.id,
              productName: p.name,
              type: 'ADJUST',
              qtyChange: diff,
              finalStock: actualVal,
              date: now,
              note: `Opname by ${examiner} - ${notes}`
            });
          }
          
          return { ...p, stock: actualVal, lastUpdated: now };
        });

        return {
          ...prev,
          products: nextProducts,
          mutationLogs: [...prev.mutationLogs, ...newMutations]
        };
      });

      alert("Stok berhasil diperbarui berdasarkan hasil Opname.");
      setEntries({}); // Reset form
    }
  };

  if (isPrintMode) {
    return (
      <BAPOPrint 
        products={products}
        entries={entries}
        examiner={examiner}
        supervisor={supervisor}
        notes={notes}
        onClose={() => setIsPrintMode(false)}
      />
    );
  }

  // Sort by Location then Name for logical walk path during Opname
  const sortedProducts = [...products].sort((a, b) => {
    if (a.location < b.location) return -1;
    if (a.location > b.location) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <ClipboardCheck className="w-6 h-6 mr-2 text-indigo-600" />
            Stok Opname Mandiri
          </h2>
          <p className="text-slate-500 text-sm mt-1">Input stok fisik aktual di lapangan. Kolom sistem dikosongkan untuk objektivitas.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsPrintMode(true)}
            className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 flex items-center justify-center transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak BAPO
          </button>
          <button 
            onClick={handleApplyOpname}
            className="flex-1 sm:flex-none bg-[#00A97F] hover:bg-[#008f6b] text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Terapkan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center"><FileText className="w-4 h-4 mr-2"/> Legalitas Petugas</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nama Petugas Pemeriksa</label>
              <input type="text" value={examiner} onChange={e => setExaminer(e.target.value)} className="w-full px-3 py-1.5 border rounded-md focus:ring-1 focus:ring-indigo-500" placeholder="Nama pemeriksa di lapangan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nama Supervisor / Saksi</label>
              <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} className="w-full px-3 py-1.5 border rounded-md focus:ring-1 focus:ring-indigo-500" placeholder="Nama saksi" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-semibold text-slate-800 mb-3">Catatan Lapangan</h3>
           <textarea 
             value={notes} 
             onChange={e => setNotes(e.target.value)} 
             className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 h-24 resize-none" 
             placeholder="Tuliskan temuan atau keterangan tambahan di sini..." 
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mr-2 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Instruksi:</strong> Berjalanlah menyusuri rak. Isi kolom <strong>Fisik Aktual</strong> sesuai dengan barang yang Anda lihat. Jika kosong, biarkan inputan kosong.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold w-12 text-center whitespace-nowrap">No</th>
                <th className="p-4 font-semibold whitespace-nowrap">Rak & Barang</th>
                <th className="p-4 font-semibold w-32 text-center bg-slate-100 whitespace-nowrap">Stok Sistem</th>
                <th className="p-4 font-semibold w-40 text-center bg-indigo-50 text-indigo-700 border-l border-r border-indigo-100 whitespace-nowrap">Fisik Aktual</th>
                <th className="p-4 font-semibold w-32 text-center whitespace-nowrap">Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProducts.map((p, idx) => {
                const entry = entries[p.id];
                const actualStr = entry?.actualStock ?? '';
                const actualVal = actualStr !== '' ? parseInt(actualStr) : null;
                const sysStr = entry?.systemStock ?? p.stock.toString();
                const sysVal = sysStr !== '' ? parseInt(sysStr) : 0;
                
                let diffStr = '-';
                let diffColor = 'text-slate-400';
                
                if (actualVal !== null) {
                  const diff = actualVal - sysVal;
                  if (diff > 0) {
                    diffStr = `+${diff} (Surplus)`;
                    diffColor = 'text-[#00A97F] font-bold';
                  } else if (diff < 0) {
                    diffStr = `${diff} (Defisit)`;
                    diffColor = 'text-red-600 font-bold';
                  } else {
                    diffStr = 'Cocok';
                    diffColor = 'text-slate-500 font-bold';
                  }
                }

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-center text-slate-400 text-sm whitespace-nowrap">{idx + 1}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit mb-1">{p.location}</span>
                        <span className="font-medium text-slate-800">{p.name}</span>
                        <span className="text-xs text-slate-500 font-mono mt-0.5">{p.sku} | {p.unit}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center bg-slate-50">
                      <input 
                        type="number"
                        min="0"
                        value={entry?.systemStock ?? p.stock.toString()}
                        onChange={(e) => handleSystemStockChange(p.id, e.target.value)}
                        className="w-full text-center text-lg font-medium px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-400 focus:border-slate-400 bg-white shadow-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-4 bg-[#00A97F]/5 border-l border-r border-[#00A97F]/10">
                      <input 
                        type="number"
                        min="0"
                        value={actualStr}
                        onChange={(e) => handleStockChange(p.id, e.target.value)}
                        className="w-full text-center text-lg font-bold px-3 py-2 border border-[#00A97F]/30 rounded-md focus:ring-2 focus:ring-[#00A97F] focus:border-[#00A97F] shadow-inner"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                       <span className={cn("text-sm", diffColor)}>{diffStr}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
