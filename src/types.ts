export type Category = 'Makanan' | 'Minuman' | 'Susu' | 'Bumbu' | 'Frozen' | 'Obat' | 'Lainnya';
export type Unit = 'Pcs' | 'Botol' | 'Karton' | 'Pack' | 'Kg' | 'Gram';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  location: string;
  stock: number;
  unit: Unit;
  batchNo: string;
  expiredDate: string; // YYYY-MM-DD
  buyPrice: number;
  sellPrice: number;
  lastUpdated: string;
}

export type MutationType = 'IN' | 'OUT' | 'ADJUST' | 'RETURN' | 'DISPOSE';

export interface MutationLog {
  id: string;
  productId: string;
  productName: string;
  type: MutationType;
  qtyChange: number;
  finalStock: number;
  date: string;
  note: string;
}

export interface WorkspaceData {
  products: Product[];
  mutationLogs: MutationLog[];
}

export type ExpiredStatus = 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'SAFE';

export const calculateExpiredStatus = (expiredDate: string): ExpiredStatus => {
  if (!expiredDate) return 'SAFE';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const exp = new Date(expiredDate);
  exp.setHours(0, 0, 0, 0);
  
  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 7) return 'CRITICAL';
  if (diffDays <= 30) return 'WARNING';
  return 'SAFE';
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const generateId = () => Math.random().toString(36).substring(2, 9);
