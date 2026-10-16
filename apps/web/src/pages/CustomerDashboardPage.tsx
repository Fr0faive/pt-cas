import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, History, Clock } from 'lucide-react';
import { authFetch, useAuthStore } from '@/store/useAuthStore.js';
import type { OrderWithDetails } from '@repo/shared';

export function CustomerDashboardPage() {
  const { user, outletName, distributorName } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState<OrderWithDetails[]>([]);

  useEffect(() => {
    if (!user?.phoneNumber) return;
    authFetch(`/api/orders?phone=${encodeURIComponent(user.phoneNumber)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setRecentOrders(json.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, [user?.phoneNumber]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const displayOutlet =
    outletName || (user?.kodeOutlet ? `Outlet ${user.kodeOutlet}` : 'Angga Kosmetik');
  const displayDistributor =
    distributorName ||
    (user?.kodeDistributor ? `Distributor ${user.kodeDistributor}` : 'CV. Sagara Timur Dewata');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Welcome Card matching Image 3 with soft pastel cyan styling */}
      <div className="bg-[#c6edf8] rounded-3xl p-6 sm:p-8 border border-[#a2ddf0] shadow-xs">
        <div className="max-w-xl space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-white/80 space-y-3.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Selamat Datang,{' '}
              <span className="text-blue-700 underline underline-offset-2">
                {user?.phoneNumber}
              </span>
            </h2>

            <div className="space-y-1.5 text-slate-700 text-sm sm:text-base leading-relaxed">
              <p>
                Outlet: <strong className="font-bold text-slate-900">{displayOutlet}</strong>
              </p>
              <p>
                Distributor:{' '}
                <strong className="font-bold text-slate-900">{displayDistributor}</strong>
              </p>
            </div>

            <p className="pt-2 text-xs sm:text-sm text-slate-600 leading-normal">
              Gunakan menu di bawah untuk melakukan pemesanan.
            </p>
          </div>

          {/* Action Buttons matching Image 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <Link
              to="/orders/new"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl py-4 px-6 text-[#236f86] font-bold text-base sm:text-lg text-center shadow-xs border border-white/80 transition cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Buat Pesanan</span>
            </Link>

            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl py-4 px-6 text-[#236f86] font-bold text-base sm:text-lg text-center shadow-xs border border-white/80 transition cursor-pointer"
            >
              <History className="h-5 w-5" />
              <span>Riwayat Pesanan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#236f86]" />
            <h3 className="font-bold text-slate-900 text-base">Pesanan Terakhir</h3>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-[#236f86] hover:underline"
          >
            Lihat Semua Pesanan
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            Belum ada transaksi pesanan. Klik &quot;Buat Pesanan&quot; untuk memulai.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((ord) => (
              <div
                key={ord.orderNumber}
                className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-sm"
              >
                <div>
                  <span className="font-semibold text-slate-800">{ord.orderNumber}</span>
                  <span className="text-xs text-slate-400 ml-2">({ord.orderDate})</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ord.items.length} item barang dipesan
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="font-bold text-[#236f86]">
                    {formatRupiah(ord.totalAmount)}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {ord.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
