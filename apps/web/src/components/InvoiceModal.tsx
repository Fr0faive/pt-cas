import { useState } from "react";
import { X, Copy, Check, Printer } from "lucide-react";
import type { OrderWithDetails } from "@repo/shared";

interface InvoiceModalProps {
  order: OrderWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  outletName?: string;
  distributorName?: string;
  paymentMethod?: string;
}

export function InvoiceModal({
  order,
  isOpen,
  onClose,
  outletName,
  distributorName,
  paymentMethod = "Transfer Bank",
}: InvoiceModalProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  if (!isOpen || !order) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowOptions(false);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalItemsCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai":
        return {
          dot: "bg-emerald-500",
          pill: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
        };
      case "Diproses":
        return {
          dot: "bg-blue-500",
          pill: "bg-blue-50 text-blue-800 border-blue-200/60",
        };
      case "Dibatalkan":
        return {
          dot: "bg-rose-500",
          pill: "bg-rose-50 text-rose-800 border-rose-200/60",
        };
      case "Menunggu Konfirmasi":
      default:
        return {
          dot: "bg-amber-500",
          pill: "bg-amber-50 text-amber-800 border-amber-200/60",
        };
    }
  };

  const statusStyle = getStatusColor(order.orderStatus);
  const displayCompany =
    order.outlet?.namaOutlet ||
    outletName ||
    (order.kodeOutlet ? `Outlet ${order.kodeOutlet}` : "PT. Cantika Surya");

  const displayDistributor =
    order.distributor?.namaDistributor ||
    distributorName ||
    (order.kodeDistributor ? `Distributor ${order.kodeDistributor}` : "");

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 z-10 space-y-5 my-8">
        <div className="flex items-center justify-between">
          <h2 id="invoice-title" className="text-xl font-bold text-slate-900">
            Invoices Detail
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup invoice"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block mb-1.5">
              Company
            </span>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs shrink-0">
                <span className="font-serif">C</span>
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-slate-900 truncate block">
                  {displayCompany}
                </span>
                {displayDistributor && (
                  <span className="text-[10px] text-slate-400 truncate block">
                    Dist: {displayDistributor}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-medium block mb-1.5">Job</span>
            <p className="font-semibold text-slate-900 truncate">
              {order.orderNumber}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {order.orderDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.pill}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
            {order.orderStatus}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f0f8fc] text-[#236f86] border border-sky-100">
            {order.paymentMethod || paymentMethod || "QRIS"}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div
                key={item.id || item.kodeSKU || idx}
                className={`flex items-start justify-between gap-3 text-xs ${
                  idx > 0 ? "pt-3 mt-3" : ""
                }`}
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">
                    {item.product?.namaSKU || item.kodeSKU}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {item.qty} pcs &times; {formatRupiah(item.hargaJual)}
                  </p>
                </div>
                <span className="font-semibold text-slate-800 whitespace-nowrap text-right">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <span className="text-sm font-bold text-emerald-600">
              Total {formatRupiah(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex justify-between items-center text-slate-600">
            <span>{totalItemsCount} Total Produk Dipesan</span>
            <span className="font-semibold text-slate-900">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>Potongan Komisi / Diskon</span>
            <span>- Rp 0 (0%)</span>
          </div>

          <div className="pt-2 text-right">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide block">
              Take Home
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight block">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 relative">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Export Invoice</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              aria-label="Opsi tambahan"
            >
              ...
            </button>

            {showOptions && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-xs">
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">
                        Tersalin
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span>Salin ID Pesanan</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
