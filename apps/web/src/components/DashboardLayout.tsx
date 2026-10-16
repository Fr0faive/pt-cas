import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  History,
  ClipboardList,
  Package,
  Store,
  Truck,
  Phone,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore.js";
import { useCartStore } from "@/store/useCartStore.js";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, outletName, distributorName } = useAuthStore();
  const { getTotalCount } = useCartStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = getTotalCount();
  const isSuperAdminOrAdmin =
    user?.role === "superadmin" || user?.role === "admin";

  // Handle Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getPageTitle = () => {
    if (
      location.pathname === "/admin/dashboard" ||
      location.pathname === "/admin"
    )
      return "Dashboard Superadmin";
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/orders/new") return "Katalog & Buat Pesanan";
    if (location.pathname === "/cart") return "Keranjang Belanja";
    if (location.pathname === "/orders") return "Riwayat Pesanan Anda";
    if (location.pathname === "/admin/orders")
      return "Kelola Riwayat Transaksi";
    if (location.pathname === "/admin/products") return "Master Produk SKU";
    if (location.pathname === "/admin/masters")
      return "Master Outlet & Distributor";
    return "Dashboard";
  };

  const displayOutlet =
    outletName ||
    (user?.kodeOutlet ? `Outlet ${user.kodeOutlet}` : "Angga Kosmetik");
  const displayDistributor =
    distributorName ||
    (user?.kodeDistributor
      ? `Distributor ${user.kodeDistributor}`
      : "CV. Sagara Timur Dewata");

  interface NavItem {
    to: string;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }

  const customerNavItems: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/orders/new", label: "Buat Pesanan", icon: ShoppingBag },
    { to: "/cart", label: "Keranjang", icon: ShoppingCart, badge: cartCount },
    { to: "/orders", label: "Riwayat Pesanan", icon: History },
  ];

  const superadminNavItems: NavItem[] = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/orders", label: "Riwayat Transaksi", icon: ClipboardList },
    { to: "/admin/products", label: "Master Produk SKU", icon: Package },
    { to: "/admin/masters", label: "Outlet & Distributor", icon: Store },
  ];

  const navItems: NavItem[] = isSuperAdminOrAdmin
    ? superadminNavItems
    : customerNavItems;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
            <NavLink
              to={isSuperAdminOrAdmin ? "/admin/dashboard" : "/dashboard"}
              onClick={() => setMobileMenuOpen(false)}
              className="block"
            >
              <img
                src="/logo.png"
                alt="ei.embeauty"
                className="h-10 w-auto object-contain"
              />
            </NavLink>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86]"
              aria-label="Tutup navigasi"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Pill */}
          <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Peran Akun:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider text-[10px] ${
                user?.role === "superadmin"
                  ? "bg-purple-100 text-purple-800"
                  : user?.role === "admin"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-teal-100 text-teal-800"
              }`}
            >
              {user?.role === "superadmin"
                ? "Superadmin"
                : user?.role === "admin"
                  ? "Administrator"
                  : "Customer"}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Menu Utama">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86] ${
                      isActive
                        ? "bg-[#f0f8fc] text-[#236f86] shadow-2xs border-l-4 border-[#236f86]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === "number" && item.badge > 0 && (
                    <span className="bg-[#236f86] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User Card & Logout Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
              <Phone className="h-3.5 w-3.5 text-[#236f86]" />
              <span className="truncate">{user?.phoneNumber}</span>
            </div>
            <p className="text-slate-600 font-medium truncate">
              {user?.userName}
            </p>
            {isSuperAdminOrAdmin ? (
              <div className="pt-1.5 mt-1 border-t border-slate-100 text-[11px] text-purple-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-medium">
                  Akses: Seluruh Data Transaksi
                </span>
              </div>
            ) : (
              <div className="pt-1.5 mt-1 border-t border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                <p className="truncate">
                  Outlet: <strong>{displayOutlet}</strong>
                </p>
                <p className="truncate">
                  Distributor: <strong>{displayDistributor}</strong>
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86]"
              aria-label="Buka navigasi sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              {getPageTitle()}
            </h1>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isSuperAdminOrAdmin && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <Store className="h-3.5 w-3.5 text-[#236f86]" />
                <span className="font-semibold text-slate-800">
                  {displayOutlet}
                </span>
                <span className="text-slate-300">|</span>
                <Truck className="h-3.5 w-3.5 text-[#236f86]" />
                <span>{displayDistributor}</span>
              </div>
            )}

            {!isSuperAdminOrAdmin && (
              <NavLink
                to="/cart"
                className="relative p-2 text-slate-600 hover:text-[#236f86] rounded-xl hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86]"
                aria-label={`Keranjang belanja, ${cartCount} barang`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#236f86] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Routed Content View */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
