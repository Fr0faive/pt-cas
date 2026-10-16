import { useState } from 'react';
import { Search, ShoppingCart, Plus, Minus, ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import type { CartItem, MsProduct } from '@repo/shared';

interface Props {
  products: MsProduct[];
  cart: CartItem[];
  onAddToCart: (product: MsProduct) => void;
  onUpdateCartQty: (sku: string, qty: number) => void;
  onGoToCheckout: () => void;
  onBackToDashboard: () => void;
}

export function CreateOrderView({
  products,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onGoToCheckout,
  onBackToDashboard,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.namaSKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kodeSKU.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.qty, 0);
  const totalCartPrice = cart.reduce((acc, curr) => acc + curr.qty * curr.product.hargaJual, 0);

  const getProductCartQty = (sku: string) => {
    const found = cart.find((c) => c.product.kodeSKU === sku);
    return found ? found.qty : 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top Header bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#236f86] hover:text-[#1c5b6e] transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
          </button>

          <h1 className="text-lg font-bold text-slate-800">Katalog Produk</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari nama produk atau kode SKU..."
              className="pl-11 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-600 self-start sm:self-auto">
            <Package className="h-4 w-4 text-[#236f86]" />
            <span>{filteredProducts.length} Produk Tersedia</span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((p) => {
            const qtyInCart = getProductCartQty(p.kodeSKU);

            return (
              <div
                key={p.kodeSKU}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
              >
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={p.imageURL}
                    alt={p.namaSKU}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {p.kodeSKU}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm sm:text-base leading-snug">
                      {p.namaSKU}
                    </h3>
                    <p className="mt-1 text-base sm:text-lg font-bold text-[#236f86]">
                      {formatRupiah(p.hargaJual)}
                    </p>
                  </div>

                  <div>
                    {qtyInCart === 0 ? (
                      <Button
                        type="button"
                        onClick={() => onAddToCart(p)}
                        className="w-full h-11 rounded-xl text-sm gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Masukkan ke Keranjang</span>
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between border border-[#85c3db] rounded-xl p-1 bg-[#f0f8fc]">
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(p.kodeSKU, qtyInCart - 1)}
                          className="h-9 w-9 rounded-lg bg-white text-[#236f86] flex items-center justify-center hover:bg-slate-50 transition border border-slate-200 cursor-pointer"
                          aria-label="Kurangi kuantitas"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold text-[#236f86] text-base px-3">
                          {qtyInCart}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(p.kodeSKU, qtyInCart + 1)}
                          className="h-9 w-9 rounded-lg bg-[#236f86] text-white flex items-center justify-center hover:bg-[#1c5b6e] transition cursor-pointer"
                          aria-label="Tambah kuantitas"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Cart Bar at bottom */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative bg-[#236f86] text-white p-2.5 rounded-xl">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Pesanan</p>
                <p className="text-base sm:text-lg font-bold text-[#236f86]">
                  {formatRupiah(totalCartPrice)}
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={onGoToCheckout}
              className="h-11 sm:h-12 px-6 rounded-xl text-sm sm:text-base font-semibold gap-2"
            >
              <span>Checkout di Keranjang</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
