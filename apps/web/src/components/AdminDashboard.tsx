import { useState, type FormEvent } from 'react';
import { Package, ShieldCheck, Store, Plus, CheckCircle, RefreshCw, LogOut } from 'lucide-react';
import { authFetch, useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import type { MsDistributor, MsOutlet, MsProduct, OrderWithDetails } from '@repo/shared';

interface Props {
  orders: OrderWithDetails[];
  products: MsProduct[];
  outlets: MsOutlet[];
  distributors: MsDistributor[];
  onRefreshData: () => void;
  onUpdateOrderStatus: (orderNumber: string, newStatus: string) => void;
}

export function AdminDashboard({
  orders,
  products,
  outlets,
  distributors,
  onRefreshData,
  onUpdateOrderStatus,
}: Props) {
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'masters'>('orders');

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newNamaSku, setNewNamaSku] = useState('');
  const [newHarga, setNewHarga] = useState('');
  const [newImage, setNewImage] = useState('');
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);
  const [prodSuccessMsg, setProdSuccessMsg] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSku || !newNamaSku || !newHarga) return;

    setIsSubmittingProd(true);
    setProdSuccessMsg('');

    try {
      const res = await authFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kodeSKU: newSku.trim().toUpperCase(),
          namaSKU: newNamaSku.trim(),
          hargaJual: parseFloat(newHarga),
          imageURL: newImage.trim() || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setProdSuccessMsg('Produk baru berhasil ditambahkan ke MsProduct.');
        setNewSku('');
        setNewNamaSku('');
        setNewHarga('');
        setNewImage('');
        onRefreshData();
      }
    } catch {
      // Error handled silently
    } finally {
      setIsSubmittingProd(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#236f86] text-white flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Control Panel</h1>
              <p className="text-xs text-slate-500">Kelola pesanan dan master data katalog</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefreshData}
              className="gap-2 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sinkron</span>
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={logout}
              className="gap-2 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#236f86] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua Pesanan ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#236f86] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Master Produk ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('masters')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'masters'
                ? 'bg-[#236f86] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Master Outlet &amp; Distributor
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base">Daftar Seluruh Pesanan</h2>
              <span className="text-xs text-slate-500 font-medium">{orders.length} transaksi</span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Belum ada pesanan yang masuk.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <div key={ord.orderNumber} className="p-4 sm:p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs text-slate-500">({ord.orderDate})</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Pemesan: <strong>{ord.phoneNumber}</strong> ({ord.customerName || 'Customer'}) | Outlet: {ord.outlet?.namaOutlet || ord.kodeOutlet}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ord.items.map((i) => `${i.product?.namaSKU || i.kodeSKU} (${i.qty})`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total Nilai</p>
                        <p className="text-sm font-bold text-[#236f86]">{formatRupiah(ord.totalAmount)}</p>
                      </div>

                      <select
                        value={ord.orderStatus}
                        onChange={(e) => onUpdateOrderStatus(ord.orderNumber, e.target.value)}
                        className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#236f86]"
                      >
                        <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Products */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">Katalog Master SKU Produk</h2>
              <Button
                type="button"
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="gap-2 text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>{showAddProduct ? 'Tutup Form' : 'Tambah SKU Baru'}</span>
              </Button>
            </div>

            {showAddProduct && (
              <form onSubmit={handleCreateProduct} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Tambah Produk Baru ke MsProduct</h3>

                {prodSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{prodSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Kode SKU</label>
                    <Input
                      placeholder="Contoh: SKU-010"
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Produk</label>
                    <Input
                      placeholder="Contoh: Lip Cream Velvet 4g"
                      value={newNamaSku}
                      onChange={(e) => setNewNamaSku(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Harga Jual (Rp)</label>
                    <Input
                      type="number"
                      placeholder="Contoh: 65000"
                      value={newHarga}
                      onChange={(e) => setNewHarga(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">URL Gambar (Opsional)</label>
                    <Input
                      placeholder="https://..."
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingProd || !newSku || !newNamaSku || !newHarga}
                  className="text-xs h-10 px-5"
                >
                  {isSubmittingProd ? 'Menyimpan...' : 'Simpan Produk'}
                </Button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.kodeSKU} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex gap-3 items-center">
                  <img
                    src={p.imageURL}
                    alt={p.namaSKU}
                    className="h-16 w-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{p.kodeSKU}</span>
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{p.namaSKU}</h3>
                    <p className="text-xs font-bold text-[#236f86] mt-0.5">{formatRupiah(p.hargaJual)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Masters */}
        {activeTab === 'masters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-[#236f86]" />
                <h2 className="font-bold text-slate-900 text-base">Master Outlet ({outlets.length})</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {outlets.map((o) => (
                  <div key={o.kodeOutlet} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{o.namaOutlet}</p>
                      <span className="text-slate-400 font-mono">{o.kodeOutlet}</span>
                    </div>
                    <span className="text-slate-500 self-center">Distributor: {o.kodeDistributor}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#236f86]" />
                <h2 className="font-bold text-slate-900 text-base">Master Distributor ({distributors.length})</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {distributors.map((d) => (
                  <div key={d.kodeDistributor} className="py-2.5 flex justify-between text-xs">
                    <p className="font-semibold text-slate-900">{d.namaDistributor}</p>
                    <span className="text-slate-400 font-mono">{d.kodeDistributor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
