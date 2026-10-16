import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Package,
  Layers,
  X,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore.js';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import type { MsProduct, ProductVariant } from '@repo/shared';

export function CreateOrderPage() {
  const [products, setProducts] = useState<MsProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Variant Modal State
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<MsProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantQty, setVariantQty] = useState(1);

  const { cart, addToCart, updateQty, getTotalCount, getTotalPrice } = useCartStore();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setProducts(json.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showVariantModal) {
        setShowVariantModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVariantModal]);

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

  const totalCount = getTotalCount();
  const totalPrice = getTotalPrice();

  const getProductCartQty = (sku: string) => {
    return cart
      .filter((c) => c.product.kodeSKU === sku)
      .reduce((sum, c) => sum + c.qty, 0);
  };

  const handleAddToCartClick = (p: MsProduct) => {
    if (p.variants && p.variants.length > 0) {
      setSelectedProductForVariant(p);
      setSelectedVariant(p.variants[0]);
      setVariantQty(1);
      setShowVariantModal(true);
    } else {
      addToCart(p);
    }
  };

  const handleConfirmVariantAddToCart = () => {
    if (!selectedProductForVariant) return;
    addToCart(selectedProductForVariant, selectedVariant || undefined, variantQty);
    setShowVariantModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 pb-28">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#236f86] hover:text-[#1c5b6e] transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
          <Package className="h-4 w-4 text-[#236f86]" />
          <span>{filteredProducts.length} Produk Tersedia</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Cari nama produk atau kode SKU..."
          className="pl-11 bg-white border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Memuat katalog produk...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((p) => {
            const hasVariants = Boolean(p.variants && p.variants.length > 0);
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
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="bg-slate-900/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs font-mono">
                      {p.kodeSKU}
                    </span>
                    {hasVariants && (
                      <span className="bg-[#236f86]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        <span>{p.variants?.length} Varian</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900 line-clamp-2 text-sm sm:text-base leading-snug">
                      {p.namaSKU}
                    </h2>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <p className="text-base sm:text-lg font-bold text-[#236f86]">
                        {formatRupiah(p.hargaJual)}
                      </p>
                      {hasVariants && (
                        <span className="text-xs text-slate-400 font-medium">
                          (harga dasar)
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {hasVariants ? (
                      <Button
                        type="button"
                        onClick={() => handleAddToCartClick(p)}
                        className="w-full h-11 rounded-xl text-sm gap-2 bg-[#236f86] hover:bg-[#1c5b6e] text-white cursor-pointer"
                      >
                        <Layers className="h-4 w-4" />
                        <span>Pilih Varian</span>
                        {qtyInCart > 0 && (
                          <span className="ml-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            ({qtyInCart})
                          </span>
                        )}
                      </Button>
                    ) : qtyInCart === 0 ? (
                      <Button
                        type="button"
                        onClick={() => handleAddToCartClick(p)}
                        className="w-full h-11 rounded-xl text-sm gap-2 cursor-pointer"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Masukkan ke Keranjang</span>
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between border border-[#85c3db] rounded-xl p-1 bg-[#f0f8fc]">
                        <button
                          type="button"
                          onClick={() => updateQty(p.kodeSKU, qtyInCart - 1)}
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
                          onClick={() => updateQty(p.kodeSKU, qtyInCart + 1)}
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
      )}

      {/* Variant Selection Pop-up Modal */}
      {showVariantModal && selectedProductForVariant && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="variant-modal-title"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3
                  id="variant-modal-title"
                  className="font-bold text-slate-900 text-lg flex items-center gap-2"
                >
                  <Layers className="h-5 w-5 text-[#236f86]" />
                  <span>Pilih Varian Produk</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan varian dan jumlah yang ingin ditambahkan ke keranjang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVariantModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86]"
                aria-label="Tutup dialog pilihan varian"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={selectedProductForVariant.imageURL}
                alt={selectedProductForVariant.namaSKU}
                className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                  {selectedProductForVariant.kodeSKU}
                </span>
                <p className="font-bold text-slate-900 text-sm truncate mt-1">
                  {selectedProductForVariant.namaSKU}
                </p>
                <p className="text-xs font-semibold text-[#236f86] mt-0.5">
                  Harga Dasar: {formatRupiah(selectedProductForVariant.hargaJual)}
                </p>
              </div>
            </div>

            {/* Variant Options List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Pilihan Varian
                </span>
                <span className="text-xs text-slate-400">
                  {selectedProductForVariant.variants?.length || 0} pilihan
                </span>
              </div>

              <div className="space-y-2">
                {selectedProductForVariant.variants?.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const variantFinalPrice =
                    selectedProductForVariant.hargaJual + Number(v.addPrice || 0);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86] ${
                        isSelected
                          ? 'border-[#236f86] bg-[#f0f8fc] ring-2 ring-[#236f86]/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#236f86] bg-[#236f86]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {v.namaVarian}
                          </p>
                          <p className="text-xs text-slate-500">
                            {Number(v.addPrice) > 0 ? (
                              <span className="text-emerald-700 font-semibold">
                                + {formatRupiah(Number(v.addPrice))}
                              </span>
                            ) : (
                              <span>Harga Standar</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-400 block">Harga</span>
                        <span className="font-bold text-sm text-[#236f86]">
                          {formatRupiah(variantFinalPrice)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Subtotal */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  Jumlah Kuantitas
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Subtotal:{' '}
                  <span className="text-[#236f86]">
                    {formatRupiah(
                      (selectedProductForVariant.hargaJual +
                        Number(selectedVariant?.addPrice || 0)) *
                        variantQty,
                    )}
                  </span>
                </span>
              </div>

              <div className="flex items-center border border-slate-200 rounded-xl px-2 py-1 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setVariantQty((prev) => Math.max(1, prev - 1))}
                  disabled={variantQty <= 1}
                  className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Kurangi kuantitas varian"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-9 text-center font-bold text-sm text-slate-900">
                  {variantQty}
                </span>
                <button
                  type="button"
                  onClick={() => setVariantQty((prev) => prev + 1)}
                  className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md transition cursor-pointer"
                  aria-label="Tambah kuantitas varian"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVariantModal(false)}
                className="w-1/3 h-12 rounded-xl text-sm cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmVariantAddToCart}
                disabled={!selectedVariant}
                className="w-2/3 h-12 rounded-xl text-sm gap-2 cursor-pointer bg-[#236f86] hover:bg-[#1c5b6e] text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Tambahkan ke Keranjang</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 right-0 left-0 lg:left-72 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative bg-[#236f86] text-white p-2.5 rounded-xl">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Pesanan</p>
                <p className="text-base sm:text-lg font-bold text-[#236f86]">
                  {formatRupiah(totalPrice)}
                </p>
              </div>
            </div>

            <Link
              to="/cart"
              className="inline-flex items-center justify-center h-11 sm:h-12 px-6 rounded-xl text-sm sm:text-base font-semibold gap-2 bg-[#236f86] text-white hover:bg-[#1c5b6e] transition shadow-xs cursor-pointer"
            >
              <span>Checkout di Keranjang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
