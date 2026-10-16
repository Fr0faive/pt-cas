import { useState } from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Store, Truck, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { authFetch, useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.js';
import type { CartItem, MsUserSafe, OrderWithDetails } from '@repo/shared';

interface Props {
  user: MsUserSafe;
  cart: CartItem[];
  onUpdateCartQty: (sku: string, qty: number) => void;
  onClearCart: () => void;
  onBackToProducts: () => void;
  onOrderSavedSuccess: (newOrder: OrderWithDetails) => void;
  onGoToDashboard: () => void;
  onGoToOrderHistory: () => void;
}

export function CartCheckoutView({
  user,
  cart,
  onUpdateCartQty,
  onClearCart,
  onBackToProducts,
  onOrderSavedSuccess,
  onGoToDashboard,
  onGoToOrderHistory,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState<OrderWithDetails | null>(null);
  const { outletName, distributorName } = useAuthStore();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.qty, 0);
  const totalCartPrice = cart.reduce((acc, curr) => acc + curr.qty * curr.product.hargaJual, 0);

  const handleSaveOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        phoneNumber: user.phoneNumber,
        kodeOutlet: user.kodeOutlet || 'OUT-001',
        kodeDistributor: user.kodeDistributor || 'DIST-001',
        items: cart.map((c) => ({
          kodeSKU: c.product.kodeSKU,
          qty: c.qty,
          hargaJual: c.product.hargaJual,
        })),
      };

      const res = await authFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        onClearCart();
        setSuccessOrder(json.data);
        onOrderSavedSuccess(json.data);
      } else {
        setErrorMsg(json.message || 'Gagal menyimpan pesanan.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center space-y-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Pesanan Berhasil Disimpan</h2>
            <p className="text-sm text-slate-500 mt-1">
              Nomor Pesanan: <strong className="text-[#236f86]">{successOrder.orderNumber}</strong>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-left text-sm space-y-2 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span className="font-semibold text-slate-900">{successOrder.orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Outlet:</span>
              <span className="font-semibold text-slate-900">
                {successOrder.outlet?.namaOutlet || outletName || successOrder.kodeOutlet}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Distributor:</span>
              <span className="font-semibold text-slate-900">
                {successOrder.distributor?.namaDistributor || distributorName || successOrder.kodeDistributor}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900">Total Pembayaran:</span>
              <span className="font-bold text-lg text-[#236f86]">
                {formatRupiah(successOrder.totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onGoToDashboard}
              className="flex-1 h-12 rounded-xl text-base"
            >
              Kembali ke Dashboard
            </Button>
            <Button
              type="button"
              onClick={onGoToOrderHistory}
              className="flex-1 h-12 rounded-xl text-base"
            >
              Lihat Riwayat Pesanan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToProducts}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#236f86] hover:text-[#1c5b6e] transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Pilih Produk Lain</span>
          </button>
          <h1 className="text-lg font-bold text-slate-800">Keranjang Belanja</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Keranjang Masih Kosong</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Silakan pilih produk terlebih dahulu untuk menambahkan barang ke keranjang pesanan.
            </p>
            <Button
              type="button"
              onClick={onBackToProducts}
              className="rounded-xl h-11 px-6 text-sm"
            >
              Buka Katalog Produk
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                {cart.map((item) => (
                  <div key={item.product.kodeSKU} className="p-4 sm:p-5 flex gap-4 items-center">
                    <img
                      src={item.product.imageURL}
                      alt={item.product.namaSKU}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        {item.product.kodeSKU}
                      </span>
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                        {item.product.namaSKU}
                      </h3>
                      <p className="text-sm font-bold text-[#236f86] mt-0.5">
                        {formatRupiah(item.product.hargaJual)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(item.product.kodeSKU, item.qty - 1)}
                          className="h-8 w-8 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 border border-slate-200 cursor-pointer"
                          aria-label="Kurangi kuantitas"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-slate-800">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(item.product.kodeSKU, item.qty + 1)}
                          className="h-8 w-8 rounded-lg bg-[#236f86] text-white flex items-center justify-center hover:bg-[#1c5b6e] cursor-pointer"
                          aria-label="Tambah kuantitas"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onUpdateCartQty(item.product.kodeSKU, 0)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Destination Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h2 className="font-bold text-slate-900 text-base">Informasi Pemesan</h2>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#236f86]" />
                    <span>{user.phoneNumber} ({user.userName})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-[#236f86]" />
                    <span>Outlet: <strong>{outletName || user.kodeOutlet || 'OUT-001'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#236f86]" />
                    <span>Distributor: <strong>{distributorName || user.kodeDistributor || 'DIST-001'}</strong></span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Kuantitas:</span>
                    <span className="font-medium text-slate-800">{totalCartCount} item</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Biaya:</span>
                    <span className="text-[#236f86] text-lg">{formatRupiah(totalCartPrice)}</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <Button
                  type="button"
                  disabled={isSubmitting || cart.length === 0}
                  onClick={handleSaveOrder}
                  className="w-full h-12 text-base font-bold rounded-xl gap-2"
                >
                  {isSubmitting ? (
                    <span>Menyimpan Pesanan...</span>
                  ) : (
                    <>
                      <span>Konfirmasi &amp; Simpan Pesanan</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
