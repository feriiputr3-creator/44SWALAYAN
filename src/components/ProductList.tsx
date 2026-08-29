import React, { useState } from 'react';
import { Product, Category, Unit, MutationType, generateId, calculateExpiredStatus, ExpiredStatus, WorkspaceData } from '../types';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, ArrowRightLeft, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProductListProps {
  products: Product[];
  updateData: (updater: (prev: WorkspaceData) => WorkspaceData) => void;
}

const CATEGORIES: Category[] = ['Makanan', 'Minuman', 'Susu', 'Bumbu', 'Frozen', 'Obat', 'Lainnya'];
const UNITS: Unit[] = ['Pcs', 'Botol', 'Karton', 'Pack', 'Kg', 'Gram'];

export function ProductList({ products, updateData }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ExpiredStatus | 'ALL'>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickActionProduct, setQuickActionProduct] = useState<{product: Product, type: 'RETURN' | 'DISPOSE' | 'ADJUST'} | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', category: 'Makanan', location: '', stock: 0, unit: 'Pcs',
    batchNo: '', expiredDate: '', buyPrice: 0, sellPrice: 0
  });

  const [qaQty, setQaQty] = useState(0);
  const [qaNote, setQaNote] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const status = calculateExpiredStatus(p.expiredDate);
    const matchesFilter = filterStatus === 'ALL' || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingProduct) {
      updateData(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === editingProduct.id ? { ...p, ...formData, lastUpdated: now } as Product : p)
      }));
    } else {
      const newProduct: Product = {
        ...(formData as Product),
        id: generateId(),
        lastUpdated: now
      };
      
      updateData(prev => ({
        ...prev,
        products: [...prev.products, newProduct],
        mutationLogs: [...prev.mutationLogs, {
          id: generateId(),
          productId: newProduct.id,
          productName: newProduct.name,
          type: 'IN',
          qtyChange: newProduct.stock,
          finalStock: newProduct.stock,
          date: now,
          note: 'Barang Masuk Awal'
        }]
      }));
    }
    
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '', sku: '', category: 'Makanan', location: '', stock: 0, unit: 'Pcs',
      batchNo: '', expiredDate: '', buyPrice: 0, sellPrice: 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Yakin ingin menghapus produk ini?')) {
      updateData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));
    }
  };

  const handleQuickAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickActionProduct) return;
    
    const { product, type } = quickActionProduct;
    let newStock = product.stock;
    let qtyChange = qaQty;
    
    if (type === 'RETURN' || type === 'DISPOSE') {
      newStock -= qaQty;
      qtyChange = -qaQty; // Negative change for log
    } else if (type === 'ADJUST') {
      newStock = qaQty; // Set to exact amount
      qtyChange = qaQty - product.stock;
    }
    
    if (newStock < 0) {
      alert("Stok tidak boleh negatif!");
      return;
    }

    const now = new Date().toISOString();

    updateData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? { ...p, stock: newStock, lastUpdated: now } : p),
      mutationLogs: [...prev.mutationLogs, {
        id: generateId(),
        productId: product.id,
        productName: product.name,
        type: type,
        qtyChange: qtyChange,
        finalStock: newStock,
        date: now,
        note: qaNote || (type === 'RETURN' ? 'Retur Supplier' : type === 'DISPOSE' ? 'Pemusnahan' : 'Koreksi Manual')
      }]
    }));

    setQuickActionProduct(null);
    setQaQty(0);
    setQaNote('');
  };

  const getStatusColor = (status: ExpiredStatus) => {
    switch(status) {
      case 'EXPIRED': return 'bg-red-100 text-red-700 border-red-200';
      case 'CRITICAL': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'WARNING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'SAFE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Data Produk</h2>
        <button 
          onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Barang Masuk
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau SKU..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="ALL">Semua Status Expired</option>
          <option value="SAFE">Aman (&gt; 30 Hari)</option>
          <option value="WARNING">Peringatan (≤ 30 Hari)</option>
          <option value="CRITICAL">Kritis (≤ 7 Hari)</option>
          <option value="EXPIRED">Sudah Expired</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold whitespace-nowrap">Nama & SKU</th>
                <th className="p-4 font-semibold whitespace-nowrap">Kategori & Rak</th>
                <th className="p-4 font-semibold whitespace-nowrap text-right">Stok</th>
                <th className="p-4 font-semibold whitespace-nowrap">Expired</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const status = calculateExpiredStatus(p.expiredDate);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{p.sku}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-slate-700">{p.category}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.location}</p>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <p className="font-medium text-slate-800">{p.stock}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.unit}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", getStatusColor(status))}>
                        {p.expiredDate}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button 
                          title="Koreksi Cepat"
                          onClick={() => setQuickActionProduct({product: p, type: 'ADJUST'})}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          title="Retur Supplier"
                          onClick={() => setQuickActionProduct({product: p, type: 'RETURN'})}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button 
                          title="Pemusnahan (Rusak/Expired)"
                          onClick={() => setQuickActionProduct({product: p, type: 'DISPOSE'})}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        <button 
                          title="Edit Master"
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingProduct ? 'Edit Produk' : 'Input Barang Masuk'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Barcode *</label>
                  <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori *</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi Rak *</label>
                  <input required type="text" placeholder="Misal: Rak A1" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal/Masuk *</label>
                    <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value as Unit})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Batch</label>
                  <input type="text" value={formData.batchNo} onChange={e => setFormData({...formData, batchNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Expired *</label>
                  <input required type="date" value={formData.expiredDate} onChange={e => setFormData({...formData, expiredDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="hidden md:block"></div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli</label>
                  <input type="number" value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual</label>
                  <input type="number" value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                {editingProduct && (
                   <button type="button" onClick={() => { handleDelete(editingProduct.id); setIsModalOpen(false); }} className="text-red-600 px-4 py-2 hover:bg-red-50 rounded-lg">
                     Hapus
                   </button>
                )}
                <div className="flex-1"></div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Batal</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Action Modal */}
      {quickActionProduct && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                {quickActionProduct.type === 'RETURN' && <><ArrowRightLeft className="w-5 h-5 mr-2 text-orange-600" /> Retur ke Supplier</>}
                {quickActionProduct.type === 'DISPOSE' && <><Trash2 className="w-5 h-5 mr-2 text-red-600" /> Pemusnahan Barang</>}
                {quickActionProduct.type === 'ADJUST' && <><Edit2 className="w-5 h-5 mr-2 text-indigo-600" /> Koreksi Stok Cepat</>}
              </h3>
              <button onClick={() => setQuickActionProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleQuickAction} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-4">
                <p className="font-medium text-slate-800">{quickActionProduct.product.name}</p>
                <p className="text-sm text-slate-500">Stok Saat Ini: <strong>{quickActionProduct.product.stock}</strong> {quickActionProduct.product.unit}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {quickActionProduct.type === 'ADJUST' ? 'Set Stok Menjadi' : 'Jumlah Barang'}
                </label>
                <input 
                  required 
                  type="number" 
                  min="0"
                  max={quickActionProduct.type !== 'ADJUST' ? quickActionProduct.product.stock : undefined}
                  value={qaQty || ''} 
                  onChange={e => setQaQty(parseInt(e.target.value) || 0)} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan / Alasan</label>
                <textarea 
                  required
                  value={qaNote} 
                  onChange={e => setQaNote(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 h-24 resize-none" 
                  placeholder={quickActionProduct.type === 'RETURN' ? 'Misal: Barang rusak saat pengiriman' : 'Misal: Kemasan bocor, expired'}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setQuickActionProduct(null)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Batal</button>
                <button type="submit" className={cn(
                  "text-white px-6 py-2 rounded-lg font-medium",
                  quickActionProduct.type === 'RETURN' ? "bg-orange-600 hover:bg-orange-700" :
                  quickActionProduct.type === 'DISPOSE' ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
                )}>
                  Proses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
