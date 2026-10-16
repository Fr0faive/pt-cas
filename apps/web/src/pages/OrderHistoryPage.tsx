import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronDown, ChevronUp, Store, Truck, Calendar, Receipt } from 'lucide-react';
import { authFetch, useAuthStore } from '@/store/useAuthStore.js';
import { InvoiceModal } from '@/components/InvoiceModal.js';
import type { OrderWithDetails } from '@repo/shared';

export function OrderHistoryPage() {
  const { user, outletName, distributorName } = useAuthStore();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedOrderNum, setExpandedOrderNum] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderWithDetails | null>(null);

  useEffect(() => {
    if (!user?.phoneNumber) return;

    authFetch(`/api/orders?phone=${encodeURIComponent(user.phoneNumber)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setOrders(json.data);
          if (json.data.length > 0) {
            setExpandedOrderNum(json.data[0].orderNumber);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, [user?.phoneNumber]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'all') return true;
    return o.orderStatus === selectedStatus;
  });

  const toggleExpand = (orderNumber: string) => {
    setExpandedOrderNum((prev) => (prev === orderNumber ? null : orderNumber));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Diproses':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Dibatalkan':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Riwayat Pesanan Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar transaksi dan rincian produk kosmetik yang telah Anda pesan
          </p>
        </div>
        <Link
          to="/orders/new"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-[#236f86] text-white hover:bg-[#1c5b6e] px-4 py-2 rounded-xl transition self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Buat Pesanan Baru</span>
        </Link>
      </div>

      {/* Filter status buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'Menunggu Konfirmasi', 'Diproses', 'Selesai', 'Dibatalkan'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer border ${
              selectedStatus === st
                ? 'bg-[#236f86] text-white border-[#236f86]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'all' ? 'Semua Pesanan' : st}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Memuat riwayat pesanan...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Belum Ada Riwayat Pesanan</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Anda belum memiliki transaksi pesanan pada kategori status ini.
          </p>
          <Link
            to="/orders/new"
            className="inline-flex items-center justify-center rounded-xl h-11 px-6 text-sm font-semibold bg-[#236f86] text-white hover:bg-[#1c5b6e] transition"
          >
            Buat Pesanan Baru
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const isExpanded = expandedOrderNum === ord.orderNumber;

            return (
              <div
                key={ord.orderNumber}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <div
                  onClick={() => toggleExpand(ord.orderNumber)}
                  className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-base">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getStatusBadge(
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
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{ord.orderDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">Total Belanja</p>
                      <p className="text-base font-bold text-[#236f86]">
                        {formatRupiah(ord.totalAmount)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceOrder(ord);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="Lihat Invoice Pesanan"
                    >
                      <Receipt className="h-3.5 w-3.5 text-slate-600" />
                      <span>Invoice</span>
                    </button>

                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Store className="h-4 w-4 text-[#236f86]" />
                        <span>Outlet: <strong>{ord.outlet?.namaOutlet || ord.kodeOutlet}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Truck className="h-4 w-4 text-[#236f86]" />
                        <span>Distributor: <strong>{ord.distributor?.namaDistributor || ord.kodeDistributor}</strong></span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 overflow-hidden">
                      {ord.items.map((item) => (
                        <div
                          key={item.id || item.kodeSKU}
                          className="p-3.5 flex items-center justify-between text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-3">
                            {item.product?.imageURL && (
                              <img
                                src={item.product.imageURL}
                                alt={item.product.namaSKU}
                                className="h-10 w-10 rounded-lg object-cover border border-slate-100"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">
                                {item.product?.namaSKU || item.kodeSKU}
                              </p>
                              <p className="text-slate-500 text-xs">
                                {item.qty} &times; {formatRupiah(item.hargaJual)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900">
                            {formatRupiah(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#236f86] text-white hover:bg-[#1c5b6e] transition cursor-pointer"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>Cetak / Lihat Invoice Lengkap</span>
                      </button>
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
          outletName={selectedInvoiceOrder.outlet?.namaOutlet || outletName}
          distributorName={selectedInvoiceOrder.distributor?.namaDistributor || distributorName}
        />
      )}
    </div>
  );
}
