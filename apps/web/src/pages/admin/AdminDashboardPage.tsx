import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  Package,
  Store,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import { authFetch, useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.js';
import { InvoiceModal } from '@/components/InvoiceModal.js';
import type {
  MsDistributor,
  MsOutlet,
  MsProduct,
  OrderWithDetails,
} from '@repo/shared';

interface TopProductItem {
  sku: string;
  name: string;
  imageURL: string;
  totalQtySold: number;
  totalRevenue: number;
}

export function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [products, setProducts] = useState<MsProduct[]>([]);
  const [outlets, setOutlets] = useState<MsOutlet[]>([]);
  const [distributors, setDistributors] = useState<MsDistributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderWithDetails | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, prodsRes, outletsRes, distRes] = await Promise.all([
        authFetch('/api/orders'),
        authFetch('/api/products?all=true'),
        fetch('/api/outlets'),
        fetch('/api/distributors'),
      ]);

      if (ordersRes.ok) {
        const json = await ordersRes.json();
        setOrders(json.data || []);
      }
      if (prodsRes.ok) {
        const json = await prodsRes.json();
        setProducts(json.data || []);
      }
      if (outletsRes.ok) {
        const json = await outletsRes.json();
        setOutlets(json.data || []);
      }
      if (distRes.ok) {
        const json = await distRes.json();
        setDistributors(json.data || []);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      authFetch('/api/orders'),
      authFetch('/api/products?all=true'),
      fetch('/api/outlets'),
      fetch('/api/distributors'),
    ])
      .then(async ([ordersRes, prodsRes, outletsRes, distRes]) => {
        if (!isMounted) return;
        if (ordersRes.ok) {
          const json = await ordersRes.json();
          setOrders(json.data || []);
        }
        if (prodsRes.ok) {
          const json = await prodsRes.json();
          setProducts(json.data || []);
        }
        if (outletsRes.ok) {
          const json = await outletsRes.json();
          setOutlets(json.data || []);
        }
        if (distRes.ok) {
          const json = await distRes.json();
          setDistributors(json.data || []);
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
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleUpdateOrderStatus = async (orderNumber: string, newStatus: string) => {
    try {
      const res = await authFetch(`/api/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch {
      // Handled silently
    }
  };

  const totalOmzet = orders
    .filter((o) => o.orderStatus !== 'Dibatalkan')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'Menunggu Konfirmasi');
  const inProgressOrders = orders.filter((o) => o.orderStatus === 'Diproses');
  const completedOrders = orders.filter((o) => o.orderStatus === 'Selesai');
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'Dibatalkan');
  const urgentQueue = orders.filter(
    (o) => o.orderStatus === 'Menunggu Konfirmasi' || o.orderStatus === 'Diproses',
  );

  const activeProductsCount = products.filter((p) => p.isActive !== false).length;
  const inactiveProductsCount = products.length - activeProductsCount;

  const topProductsMap = new Map<string, TopProductItem>();
  for (const order of orders) {
    if (order.orderStatus === 'Dibatalkan') continue;
    for (const item of order.items) {
      const existing = topProductsMap.get(item.kodeSKU);
      const itemQty = Number(item.qty) || 0;
      const itemSubtotal = Number(item.subtotal) || 0;
      if (existing) {
        existing.totalQtySold += itemQty;
        existing.totalRevenue += itemSubtotal;
      } else {
        topProductsMap.set(item.kodeSKU, {
          sku: item.kodeSKU,
          name: item.product?.namaSKU || item.kodeSKU,
          imageURL:
            item.product?.imageURL ||
            'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60',
          totalQtySold: itemQty,
          totalRevenue: itemSubtotal,
        });
      }
    }
  }

  const topProducts = Array.from(topProductsMap.values())
    .sort((a, b) => b.totalQtySold - a.totalQtySold)
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Diproses':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Dibatalkan':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold uppercase tracking-wider">
              Superadmin Control Center
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs font-medium">PT Cantika Alami Sehat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, {user?.userName || 'Superadmin'}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Pantau arus kas transaksi, tanggapi antrean pesanan baru, kelola katalog produk
            dengan varian harga, serta kontrol jaringan outlet dan distributor resmi.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="gap-2 text-xs h-10 px-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#236f86]"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sinkron Data</span>
          </Button>

          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold bg-[#236f86] hover:bg-[#1c5b6e] text-white h-10 px-4 rounded-xl transition shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86]"
          >
            <span>Semua Transaksi</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omzet */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Omzet Bersih</span>
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-[#236f86] flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatRupiah(totalOmzet)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Dari <strong>{orders.filter((o) => o.orderStatus !== 'Dibatalkan').length}</strong> transaksi berhasil
            </p>
          </div>
        </div>

        {/* Card 2: Pesanan Memerlukan Tindakan */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Antrean Perlu Diproses</span>
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                urgentQueue.length > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {urgentQueue.length}
              </p>
              <span className="text-xs font-medium text-slate-500">pesanan</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{pendingOrders.length}</strong> menunggu konfirmasi, <strong>{inProgressOrders.length}</strong> diproses
            </p>
          </div>
        </div>

        {/* Card 3: Katalog Produk */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Master Produk SKU</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {products.length}
              </p>
              <span className="text-xs font-medium text-slate-500">total SKU</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{activeProductsCount}</strong> aktif, <strong>{inactiveProductsCount}</strong> nonaktif
            </p>
          </div>
        </div>

        {/* Card 4: Jaringan Distribusi */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jaringan Distribusi</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {outlets.length}
              </p>
              <span className="text-xs font-medium text-slate-500">outlet aktif</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Didukung oleh <strong>{distributors.length}</strong> distributor resmi
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Queue & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Urgent Action Orders Queue */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Antrean Pesanan Masuk (Perlu Tindakan)</span>
                  {urgentQueue.length > 0 && (
                    <span className="h-6 px-2 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                      {urgentQueue.length}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pesanan dengan status Menunggu Konfirmasi atau Diproses yang membutuhkan respon admin
                </p>
              </div>

              <Link
                to="/admin/orders"
                className="text-xs font-semibold text-[#236f86] hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86] rounded-md px-1"
              >
                <span>Lihat Semua</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Memuat antrean pesanan...
              </div>
            ) : urgentQueue.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Semua Pesanan Tertangani</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                    Tidak ada pesanan tertunda yang memerlukan konfirmasi saat ini.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {urgentQueue.slice(0, 5).map((ord) => (
                  <div
                    key={ord.orderNumber}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 -mx-2 px-2 rounded-xl transition"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm font-mono">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getStatusBadge(
                            ord.orderStatus,
                          )}`}
                        >
                          {ord.orderStatus}
                        </span>
                        {ord.paymentMethod && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-[#236f86] border border-teal-100">
                            {ord.paymentMethod}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{ord.orderDate}</span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        Pemesan: <strong>{ord.phoneNumber}</strong> ({ord.customerName || 'Customer'}) • Outlet: <strong>{ord.outlet?.namaOutlet || ord.kodeOutlet}</strong>
                      </p>
                      <p className="text-xs text-slate-500">
                        Total {ord.items.length} item produk dipesan
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400">Total Biaya</p>
                        <p className="text-sm font-bold text-[#236f86]">
                          {formatRupiah(ord.totalAmount)}
                        </p>
                      </div>

                      {/* Fast status update dropdown */}
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord.orderNumber, e.target.value)}
                        className="h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#236f86]"
                        aria-label={`Ubah status pesanan ${ord.orderNumber}`}
                      >
                        <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86]"
                        title="Lihat Invoice Pesanan"
                        aria-label={`Buka invoice ${ord.orderNumber}`}
                      >
                        <Receipt className="h-3.5 w-3.5 text-slate-600" />
                        <span className="hidden sm:inline">Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Breakdown Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Distribusi Status Seluruh Transaksi ({orders.length} Pesanan)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 space-y-1">
                <span className="text-xs font-medium text-amber-700">Menunggu Konfirmasi</span>
                <p className="text-xl font-extrabold">{pendingOrders.length}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/70 text-blue-900 space-y-1">
                <span className="text-xs font-medium text-blue-700">Sedang Diproses</span>
                <p className="text-xl font-extrabold">{inProgressOrders.length}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 space-y-1">
                <span className="text-xs font-medium text-emerald-700">Selesai / Terkirim</span>
                <p className="text-xl font-extrabold">{completedOrders.length}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/70 text-rose-900 space-y-1">
                <span className="text-xs font-medium text-rose-700">Dibatalkan</span>
                <p className="text-xl font-extrabold">{cancelledOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Top Products & Quick Links */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Top Selling Products */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Produk Paling Diminati</h2>
                <p className="text-xs text-slate-500">Berdasarkan total kuantitas unit yang dipesan</p>
              </div>
              <Link
                to="/admin/products"
                className="text-xs font-semibold text-[#236f86] hover:underline"
              >
                Katalog
              </Link>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada data pesanan produk terakumulasi.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topProducts.map((tp, idx) => (
                  <div key={tp.sku} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <img
                        src={tp.imageURL}
                        alt={tp.name}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-100 shrink-0 bg-slate-50"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{tp.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{tp.sku}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 block">{tp.totalQtySold} pcs</span>
                      <span className="text-[11px] text-[#236f86] font-semibold">
                        {formatRupiah(tp.totalRevenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access Operational Shortcuts */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-slate-900">Akses Cepat Pengelolaan</h2>
            <div className="space-y-2">
              <Link
                to="/admin/products"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition text-xs font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86]"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-[#236f86]" />
                  <span>Katalog &amp; Tambah Produk SKU</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                to="/admin/masters"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition text-xs font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86]"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="h-4 w-4 text-[#236f86]" />
                  <span>Kelola Master Outlet &amp; Distributor</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition text-xs font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86]"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-[#236f86]" />
                  <span>Riwayat Seluruh Transaksi Pelanggan</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
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
