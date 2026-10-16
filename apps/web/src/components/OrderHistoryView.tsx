import { useState } from 'react';
import { ArrowLeft, ShoppingBag, ChevronDown, ChevronUp, Store, Truck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button.js';
import type { OrderWithDetails } from '@repo/shared';

interface Props {
  orders: OrderWithDetails[];
  onBackToDashboard: () => void;
  onOpenCreateOrder: () => void;
}

export function OrderHistoryView({
  orders,
  onBackToDashboard,
  onOpenCreateOrder,
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedOrderNum, setExpandedOrderNum] = useState<string | null>(
    orders.length > 0 ? orders[0].orderNumber : null,
  );

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
    <div className="min-h-screen bg-slate-50 pb-20">
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
          <h1 className="text-lg font-bold text-slate-800">Riwayat Pesanan</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
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

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-xs">
            <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Belum Ada Riwayat Pesanan</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Anda belum memiliki transaksi pesanan pada kategori status ini.
            </p>
            <Button
              type="button"
              onClick={onOpenCreateOrder}
              className="rounded-xl h-11 px-6 text-sm"
            >
              Buat Pesanan Baru
            </Button>
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
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{ord.orderDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-500">Total Belanja</p>
                        <p className="text-base font-bold text-[#236f86]">
                          {formatRupiah(ord.totalAmount)}
                        </p>
                      </div>

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
                      {/* Outlet & Distributor Info */}
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

                      {/* Items table */}
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
