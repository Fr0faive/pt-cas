import { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Receipt,
} from "lucide-react";
import { authFetch } from "@/store/useAuthStore.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { InvoiceModal } from "@/components/InvoiceModal.js";
import type { OrderWithDetails } from "@repo/shared";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderNum, setExpandedOrderNum] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] =
    useState<OrderWithDetails | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch("/api/orders");
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    authFetch("/api/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) {
          setOrders(json.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleUpdateOrderStatus = async (
    orderNumber: string,
    newStatus: string,
  ) => {
    try {
      const res = await authFetch(`/api/orders/${orderNumber}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch {
      // Handled silently
    }
  };

  const toggleExpand = (orderNumber: string) => {
    setExpandedOrderNum((prev) => (prev === orderNumber ? null : orderNumber));
  };

  const filteredOrders = orders.filter((ord) => {
    const matchStatus =
      statusFilter === "all" || ord.orderStatus === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      ord.orderNumber.toLowerCase().includes(term) ||
      ord.phoneNumber.includes(term) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(term)) ||
      ord.kodeOutlet.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Menunggu Konfirmasi":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Diproses":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Selesai":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Dibatalkan":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const totalOmzet = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const pendingCount = orders.filter(
    (o) => o.orderStatus === "Menunggu Konfirmasi",
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Kelola Riwayat Transaksi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar seluruh transaksi yang masuk dari semua customer dan outlet
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="gap-2 text-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Muat Ulang Transaksi</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">
            Total Transaksi
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {orders.length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">
            Menunggu Konfirmasi
          </p>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {pendingCount}
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">
            Total Nilai Transaksi
          </p>
          <p className="text-xl font-bold text-[#236f86] mt-1">
            {formatRupiah(totalOmzet)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari order number, no. HP, atau outlet..."
            className="pl-10 text-xs sm:text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            "all",
            "Menunggu Konfirmasi",
            "Diproses",
            "Selesai",
            "Dibatalkan",
          ].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                statusFilter === st
                  ? "bg-[#236f86] text-white border-[#236f86]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st === "all" ? "Semua Status" : st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          Memuat riwayat transaksi...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          Tidak ditemukan transaksi yang cocok dengan filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const isExpanded = expandedOrderNum === ord.orderNumber;

            return (
              <div
                key={ord.orderNumber}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getStatusBadge(
                          ord.orderStatus,
                        )}`}
                      >
                        {ord.orderStatus}
                      </span>
                      {ord.paymentMethod && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-[#236f86] border border-teal-100">
                          {ord.paymentMethod}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {ord.orderDate}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        Customer:{" "}
                        <strong className="text-slate-900">
                          {ord.phoneNumber}
                        </strong>{" "}
                        {ord.customerName ? `(${ord.customerName})` : ""}
                      </span>
                      <span>
                        Outlet:{" "}
                        <strong className="text-slate-900">
                          {ord.outlet?.namaOutlet || ord.kodeOutlet}
                        </strong>
                      </span>
                      <span>
                        Distributor:{" "}
                        <strong className="text-slate-900">
                          {ord.distributor?.namaDistributor ||
                            ord.kodeDistributor}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">
                        Total Transaksi
                      </p>
                      <p className="text-sm sm:text-base font-bold text-[#236f86]">
                        {formatRupiah(ord.totalAmount)}
                      </p>
                    </div>

                    <select
                      value={ord.orderStatus}
                      onChange={(e) =>
                        handleUpdateOrderStatus(ord.orderNumber, e.target.value)
                      }
                      className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#236f86]"
                    >
                      <option value="Menunggu Konfirmasi">
                        Menunggu Konfirmasi
                      </option>
                      <option value="Diproses">Diproses</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(ord)}
                      className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="Lihat & Cetak Invoice"
                    >
                      <Receipt className="h-3.5 w-3.5 text-slate-600" />
                      <span>Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(ord.orderNumber)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      aria-label="Rincian pesanan"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700">
                        Rincian Produk Dipesan ({ord.items.length} item):
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#236f86] hover:underline cursor-pointer"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>Buka Invoices</span>
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 overflow-hidden">
                      {ord.items.map((item) => (
                        <div
                          key={item.id || item.kodeSKU}
                          className="p-3 flex items-center justify-between text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.product?.imageURL && (
                              <img
                                src={item.product.imageURL}
                                alt={item.product.namaSKU}
                                className="h-10 w-10 rounded-lg object-cover border border-slate-100 shrink-0"
                              />
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-slate-900 truncate">
                                {item.product?.namaSKU || item.kodeSKU}
                              </p>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {item.kodeSKU}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className="text-slate-500 text-xs">
                              {item.qty} &times; {formatRupiah(item.hargaJual)}
                            </span>
                            <p className="font-bold text-slate-900">
                              {formatRupiah(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          outletName={selectedInvoiceOrder.outlet?.namaOutlet}
          distributorName={selectedInvoiceOrder.distributor?.namaDistributor}
        />
      )}
    </div>
  );
}
