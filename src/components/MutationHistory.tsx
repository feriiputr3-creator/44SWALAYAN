import React from 'react';
import { MutationLog } from '../types';
import { ArrowDownLeft, ArrowUpRight, FileSpreadsheet, RefreshCcw, Trash2, Edit2 } from 'lucide-react';

interface MutationHistoryProps {
  logs: MutationLog[];
}

export function MutationHistory({ logs }: MutationHistoryProps) {
  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowDownLeft className="w-5 h-5 text-emerald-500" />;
      case 'OUT': return <ArrowUpRight className="w-5 h-5 text-indigo-500" />;
      case 'ADJUST': return <RefreshCcw className="w-5 h-5 text-amber-500" />;
      case 'RETURN': return <ArrowUpRight className="w-5 h-5 text-orange-500" />;
      case 'DISPOSE': return <Trash2 className="w-5 h-5 text-red-500" />;
      default: return <Edit2 className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-emerald-50 border-emerald-100';
      case 'OUT': return 'bg-indigo-50 border-indigo-100';
      case 'ADJUST': return 'bg-amber-50 border-amber-100';
      case 'RETURN': return 'bg-orange-50 border-orange-100';
      case 'DISPOSE': return 'bg-red-50 border-red-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'IN': return 'Barang Masuk';
      case 'OUT': return 'Penjualan / Keluar';
      case 'ADJUST': return 'Koreksi Opname';
      case 'RETURN': return 'Retur Supplier';
      case 'DISPOSE': return 'Pemusnahan';
      default: return type;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Waktu', 'Tipe Mutasi', 'Nama Produk', 'Perubahan Qty', 'Stok Akhir', 'Catatan'];
    const rows = sortedLogs.map(log => [
      new Date(log.date).toLocaleString('id-ID'),
      getTypeLabel(log.type),
      log.productName,
      log.qtyChange > 0 ? `+${log.qtyChange}` : log.qtyChange,
      log.finalStock,
      `"${log.note.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mutasi_44SWALAYAN_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyWA = () => {
    const today = new Date().toLocaleDateString('id-ID');
    const logsToday = sortedLogs.filter(l => new Date(l.date).toLocaleDateString('id-ID') === today);
    
    let text = `*REKAP MUTASI 44SWALAYAN (${today})*\n\n`;
    logsToday.slice(0, 15).forEach(log => {
      text += `- [${getTypeLabel(log.type)}] ${log.productName}: ${log.qtyChange > 0 ? '+' : ''}${log.qtyChange} (Stok: ${log.finalStock})\n  Catatan: ${log.note}\n\n`;
    });
    
    if (logsToday.length > 15) {
      text += `...dan ${logsToday.length - 15} mutasi lainnya.\n`;
    }
    
    if (logsToday.length === 0) {
      text += "Belum ada mutasi hari ini.";
    }

    navigator.clipboard.writeText(text).then(() => {
      alert("Format laporan harian berhasil disalin! Silakan paste di WhatsApp.");
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Mutasi Stok</h2>
          <p className="text-slate-500 text-sm mt-1">Log aktivitas barang masuk, keluar, opname, dan retur.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleCopyWA}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
          >
            Salin WA
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center justify-center transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Unduh CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Timeline Line */}
        <div className="absolute left-8 sm:left-12 top-0 bottom-0 w-px bg-slate-100 z-0 hidden sm:block"></div>
        
        <div className="divide-y divide-slate-100">
          {sortedLogs.map(log => (
            <div key={log.id} className="p-4 sm:p-6 flex items-start gap-4 sm:gap-6 relative z-10 hover:bg-slate-50/50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${getBgColor(log.type)}`}>
                {getIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                  <h4 className="font-semibold text-slate-800 text-base truncate">
                    {log.productName}
                  </h4>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                    {new Date(log.date).toLocaleString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-2">
                  <span className="font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs">
                    {getTypeLabel(log.type)}
                  </span>
                  <span className="text-slate-600">
                    Perubahan: <strong className={log.qtyChange > 0 ? 'text-emerald-600' : log.qtyChange < 0 ? 'text-red-600' : ''}>
                      {log.qtyChange > 0 ? '+' : ''}{log.qtyChange}
                    </strong>
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600">
                    Stok Akhir: <strong>{log.finalStock}</strong>
                  </span>
                </div>
                
                <p className="text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-md border border-slate-100 italic">
                  "{log.note}"
                </p>
              </div>
            </div>
          ))}
          
          {sortedLogs.length === 0 && (
             <div className="p-12 text-center text-slate-500">
               <RefreshCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
               <p>Belum ada riwayat mutasi tercatat.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
