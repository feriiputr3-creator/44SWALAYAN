import React, { useEffect } from 'react';
import { Product } from '../types';

interface BAPOPrintProps {
  products: Product[];
  entries: Record<string, { actualStock: string }>;
  examiner: string;
  supervisor: string;
  notes: string;
  onClose: () => void;
}

export function BAPOPrint({ products, entries, examiner, supervisor, notes, onClose }: BAPOPrintProps) {
  useEffect(() => {
    // Auto print trigger could go here, but let user click print browser dialog to be safe.
    document.title = `BAPO_44SWALAYAN_${new Date().toISOString().split('T')[0]}`;
    return () => { document.title = '44SWALAYAN App'; }
  }, []);

  const opnameItems = products.filter(p => entries[p.id] && entries[p.id].actualStock !== '');

  return (
    <div className="fixed inset-0 bg-white z-[100] overflow-y-auto print:static print:bg-transparent">
      
      {/* Non-printable header for actions */}
      <div className="sticky top-0 bg-slate-800 text-white p-4 flex justify-between items-center print:hidden shadow-md">
        <h3 className="font-semibold">Pratinjau Cetak BAPO</h3>
        <div className="space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Kembali</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-medium">Cetak Dokumen</button>
        </div>
      </div>

      {/* Printable Area - A4 Size styling applied via tailwind prose or specific widths */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-[20mm] text-black">
        {/* KOP Surat */}
        <div className="border-b-4 border-black pb-4 mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">44SWALAYAN</h1>
          <p className="text-sm mt-1 font-medium">SISTEM INVENTARIS & MANAJEMEN RETAIL TERPADU</p>
          <p className="text-xs text-gray-600">Jl. Contoh Format BAPO No. 44, Kota Anda - Telp: (021) 1234567</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold underline mb-1">BERITA ACARA PEMERIKSAAN OPNAME (BAPO)</h2>
          <p className="text-sm">Nomor: BAPO-{new Date().toISOString().replace(/\D/g,'').slice(0, 14)}</p>
        </div>

        <div className="mb-6 text-sm">
          <p>Pada hari ini tanggal <strong>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>, telah dilakukan perhitungan fisik persediaan barang (Stock Opname) oleh:</p>
          <table className="mt-2 ml-4">
            <tbody>
              <tr><td className="w-40 py-1">Nama Pemeriksa</td><td className="px-2">:</td><td className="font-semibold">{examiner || '___________________'}</td></tr>
              <tr><td className="w-40 py-1">Nama Supervisor</td><td className="px-2">:</td><td className="font-semibold">{supervisor || '___________________'}</td></tr>
            </tbody>
          </table>
          <p className="mt-2">Dengan rincian hasil perhitungan sebagai berikut:</p>
        </div>

        <table className="w-full text-sm border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-gray-100 font-bold">
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2 text-left">SKU / Barcode</th>
              <th className="border border-black p-2 text-left">Nama Produk</th>
              <th className="border border-black p-2 text-center">Sistem</th>
              <th className="border border-black p-2 text-center">Fisik</th>
              <th className="border border-black p-2 text-center">Selisih</th>
              <th className="border border-black p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {opnameItems.length > 0 ? (
              opnameItems.map((p, idx) => {
                const actual = parseInt(entries[p.id].actualStock);
                const diff = actual - p.stock;
                let status = 'Cocok';
                if (diff > 0) status = 'Surplus (+)';
                if (diff < 0) status = 'Defisit (-)';
                
                return (
                  <tr key={p.id}>
                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                    <td className="border border-black p-2 font-mono text-xs">{p.sku}</td>
                    <td className="border border-black p-2">{p.name}</td>
                    <td className="border border-black p-2 text-center">{p.stock}</td>
                    <td className="border border-black p-2 text-center font-bold">{actual}</td>
                    <td className="border border-black p-2 text-center">{diff !== 0 ? diff : '-'}</td>
                    <td className="border border-black p-2 text-center">{status}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="border border-black p-4 text-center italic">Tidak ada rincian opname yang diinput.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mb-12">
          <p className="font-bold text-sm mb-1">Catatan Tambahan:</p>
          <div className="border border-black p-3 min-h-[80px] text-sm whitespace-pre-wrap">
            {notes || '-'}
          </div>
        </div>

        <div className="flex justify-between text-sm text-center px-8 mt-16">
          <div>
            <p className="mb-20">Petugas Pemeriksa,</p>
            <p className="font-bold underline">{examiner || '....................................'}</p>
          </div>
          <div>
            <p className="mb-20">Supervisor / Saksi,</p>
            <p className="font-bold underline">{supervisor || '....................................'}</p>
          </div>
          <div>
            <p className="mb-20">Mengetahui, Kepala Toko</p>
            <p className="font-bold underline">....................................</p>
          </div>
        </div>
      </div>
    </div>
  );
}
