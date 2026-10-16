import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, QrCode } from "lucide-react";
import { authFetch, useAuthStore } from "@/store/useAuthStore.js";
import { useCartStore } from "@/store/useCartStore.js";
import { InvoiceModal } from "@/components/InvoiceModal.js";
import type { OrderWithDetails } from "@repo/shared";
import { Button } from "@/components/ui/button";

export function CartCheckoutPage() {
  const navigate = useNavigate();
  const { user, outletName, distributorName } = useAuthStore();
  const { cart, updateQty, clearCart, getTotalPrice } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<"qris" | "bca_va">("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successOrder, setSuccessOrder] = useState<OrderWithDetails | null>(
    null,
  );
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const rawSubtotal = getTotalPrice();
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const deliveryAmount = 0;
  const taxAmount = 0;
  const finalTotal = Math.max(
    0,
    rawSubtotal - discountAmount + deliveryAmount + taxAmount,
  );

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("Masukkan kode kupon terlebih dahulu.");
      return;
    }

    if (code === "BEAUTY10" || code === "CANTIK10" || code === "PROMO10") {
      setDiscountPercent(10);
      setCouponSuccess("Kupon 10% diskon berhasil diterapkan!");
    } else {
      setCouponError("Kode kupon tidak valid atau telah kedaluwarsa.");
      setDiscountPercent(0);
    }
  };

  const handleCancelOrder = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin membatalkan dan mengosongkan keranjang belanja?",
      )
    ) {
      clearCart();
    }
  };

  const handleCheckOut = async () => {
    if (!user || cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        phoneNumber: user.phoneNumber,
        kodeOutlet: user.kodeOutlet || "OUT-001",
        kodeDistributor: user.kodeDistributor || "DIST-001",
        paymentMethod: getPaymentMethodName(),
        items: cart.map((c) => ({
          kodeSKU: c.product.kodeSKU,
          qty: c.qty,
          hargaJual: c.product.hargaJual,
        })),
      };

      const res = await authFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        clearCart();
        setSuccessOrder(json.data);
        setShowInvoiceModal(true);
      } else {
        setErrorMsg(json.message || "Gagal memproses pesanan.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentMethodName = () => {
    return selectedPayment === "qris" ? "QRIS" : "BCA Virtual Account";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-24">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-2xs">
          <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Keranjang Masih Kosong
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Silakan pilih produk kosmetik untuk menambahkan barang ke keranjang
            belanja Anda.
          </p>
          <Link
            to="/orders/new"
            className="inline-flex items-center justify-center rounded-xl h-11 px-6 text-sm font-semibold bg-[#236f86] text-white hover:bg-[#1c5b6e] transition cursor-pointer"
          >
            Pilih Produk Kosmetik
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Table List & Actions */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Table Header Row */}
            <div className="hidden sm:grid grid-cols-12 text-xs font-semibold text-slate-400 px-4 py-1">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Price</div>
            </div>

            {/* Product Card Items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.kodeSKU}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs transition hover:border-slate-300"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-4 min-w-0 flex-1 sm:max-w-[50%]">
                    <img
                      src={item.product.imageURL}
                      alt={item.product.namaSKU}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                        {item.product.namaSKU}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        SKU:{" "}
                        <span className="font-semibold">
                          {item.product.kodeSKU}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between sm:justify-center">
                    <div className="flex items-center border border-slate-200 rounded-xl px-2 py-1 bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          updateQty(item.id || item.product.kodeSKU, item.qty - 1)
                        }
                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md transition cursor-pointer"
                        aria-label="Kurangi kuantitas"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-slate-900">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQty(item.id || item.product.kodeSKU, item.qty + 1)
                        }
                        className="h-7 w-7 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md transition cursor-pointer"
                        aria-label="Tambah kuantitas"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Price & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:min-w-[130px]">
                    <span className="text-base font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(item.product.hargaJual * item.qty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id || item.product.kodeSKU, 0)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition cursor-pointer rounded-lg hover:bg-red-50"
                      title="Hapus barang"
                      aria-label="Hapus barang dari keranjang"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions: Back link & Cancel Order button */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate("/orders/new")}
                className="text-sm font-semibold text-slate-800 hover:text-slate-600 transition cursor-pointer px-2 py-1"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleCancelOrder}
                className="bg-[#ff3b30] hover:bg-red-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
              >
                Cancel Order
              </button>
            </div>
          </div>

          {/* Right Column: Coupon Code, Order Summery, Payment Method */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            {/* 1. Coupon Code Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3.5 shadow-2xs">
              <h2 className="font-bold text-slate-900 text-base">
                Coupon Code
              </h2>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter Your Coupon Code"
                className="w-full bg-slate-100/90 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#236f86]"
              />

              {couponSuccess && (
                <p className="text-xs text-emerald-600 font-semibold">
                  {couponSuccess}
                </p>
              )}
              {couponError && (
                <p className="text-xs text-rose-600 font-medium">
                  {couponError}
                </p>
              )}

              <button
                type="button"
                onClick={handleApplyCoupon}
                className="w-full py-2.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50/70 font-semibold text-sm transition cursor-pointer"
              >
                Apply Your Coupon
              </button>
            </div>

            {/* 2. Order Summery Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
              <h2 className="font-bold text-slate-900 text-base">
                Order Summery
              </h2>

              <div className="space-y-2 text-sm pt-1">
                <div className="flex justify-between text-slate-500">
                  <span>Discount</span>
                  <span className="font-medium text-slate-800">
                    {discountAmount > 0
                      ? `- ${formatRupiah(discountAmount)}`
                      : "Rp0"}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className="font-medium text-slate-800">
                    Gratis (Rp 0)
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Tax</span>
                  <span className="font-medium text-slate-800">Rp 0</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatRupiah(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Payment Method Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-base">
                  Payment Method
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#236f86] border border-teal-100">
                  {selectedPayment === "qris" ? "QRIS Instant" : "BCA Virtual"}
                </span>
              </div>

              {/* QRIS & BCA Virtual Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: QRIS */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment("qris")}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between gap-3 ${
                    selectedPayment === "qris"
                      ? "border-[#236f86] bg-[#f0f8fc] ring-2 ring-[#236f86]/20 shadow-xs"
                      : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/80"
                  }`}
                  aria-label="Pilih metode QRIS"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-2xs">
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">QRIS</p>
                        <p className="text-[11px] text-slate-500">Scan &amp; Bayar Instan</p>
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center mt-1 ${
                        selectedPayment === "qris"
                          ? "border-[#236f86] bg-[#236f86]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedPayment === "qris" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    GoPay, OVO, Dana, ShopeePay, LinkAja, BCA, Mandiri, BRI
                  </p>
                </button>

                {/* Option 2: BCA Virtual Account */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment("bca_va")}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between gap-3 ${
                    selectedPayment === "bca_va"
                      ? "border-[#236f86] bg-[#f0f8fc] ring-2 ring-[#236f86]/20 shadow-xs"
                      : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/80"
                  }`}
                  aria-label="Pilih metode BCA Virtual Account"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-[#003087] flex items-center justify-center text-white font-extrabold text-xs shadow-2xs">
                        BCA
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">BCA Virtual</p>
                        <p className="text-[11px] text-slate-500">Virtual Account</p>
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center mt-1 ${
                        selectedPayment === "bca_va"
                          ? "border-[#236f86] bg-[#236f86]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedPayment === "bca_va" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    m-BCA, KlikBCA, myBCA, &amp; seluruh ATM BCA (Verifikasi Otomatis)
                  </p>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Primary Check Out CTA */}
              <Button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={handleCheckOut}
                className="w-full h-11 rounded-xl text-sm gap-2"
              >
                {isSubmitting ? "Processing..." : "Check Out"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal matching Image 1 */}
      {successOrder && (
        <InvoiceModal
          order={successOrder}
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            navigate("/orders");
          }}
          outletName={outletName}
          distributorName={distributorName}
          paymentMethod={getPaymentMethodName()}
        />
      )}
    </div>
  );
}
