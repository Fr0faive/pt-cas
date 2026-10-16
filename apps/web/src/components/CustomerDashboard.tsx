import { useAuthStore } from '@/store/useAuthStore.js';
import type { MsUserSafe } from '@repo/shared';

interface Props {
  user: MsUserSafe;
  onOpenCreateOrder: () => void;
  onOpenOrderHistory: () => void;
}

export function CustomerDashboard({
  user,
  onOpenCreateOrder,
  onOpenOrderHistory,
}: Props) {
  const { logout, outletName, distributorName } = useAuthStore();

  const displayOutlet = outletName || (user.kodeOutlet ? `Outlet ${user.kodeOutlet}` : 'Angga Kosmetik');
  const displayDistributor = distributorName || (user.kodeDistributor ? `Distributor ${user.kodeDistributor}` : 'CV. Sagara Timur Dewata');

  return (
    <div className="min-h-screen bg-[#c6edf8] flex flex-col items-center">
      <div className="w-full max-w-[440px] px-5 py-6 flex flex-col gap-6">
        {/* Top Header matching Image 3 */}
        <header className="flex items-center justify-between pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1d6278] tracking-tight">
            Dashboard
          </h1>
          <button
            type="button"
            onClick={logout}
            className="bg-[#246e86] hover:bg-[#1c5b6e] active:bg-[#174a5a] text-white px-5 py-2 rounded-xl text-sm font-medium transition shadow-sm cursor-pointer"
          >
            Logout
          </button>
        </header>

        {/* Welcome Card matching Image 3 */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-white/60 text-slate-800 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            Selamat Datang,{' '}
            <span className="text-blue-700 underline underline-offset-2">
              {user.phoneNumber}
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

        {/* Menu Buttons matching Image 3 */}
        <div className="flex flex-col gap-3.5">
          <button
            type="button"
            onClick={onOpenCreateOrder}
            className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl py-4 px-6 text-[#236f86] font-bold text-base sm:text-lg text-center shadow-sm border border-white/60 transition cursor-pointer"
          >
            Buat Pesanan
          </button>

          <button
            type="button"
            onClick={onOpenOrderHistory}
            className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl py-4 px-6 text-[#236f86] font-bold text-base sm:text-lg text-center shadow-sm border border-white/60 transition cursor-pointer"
          >
            Riwayat Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
