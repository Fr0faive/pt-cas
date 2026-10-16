import { ShoppingCart, LogOut, Cpu, LayoutDashboard, ShoppingBag, History, Shield, User } from 'lucide-react';
import type { FlowStep } from './FlowchartBar.js';
import type { MsUserSafe } from '@repo/shared';

interface Props {
  currentUser: MsUserSafe | null;
  currentStep: FlowStep;
  cartCount: number;
  onNavigate: (step: FlowStep) => void;
  onLogout: () => void;
  onQuickLogin: (phone: string, pass: string) => void;
}

export function Navbar({
  currentUser,
  currentStep,
  cartCount,
  onNavigate,
  onLogout,
  onQuickLogin,
}: Props) {
  return (
    <header className="app-header">
      <div className="container header-content">
        {/* Brand */}
        <div className="brand-wrapper" onClick={() => currentUser && onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Cpu size={22} />
          </div>
          <div>
            <h1 className="brand-title">PT CAS Ordering Portal</h1>
            <p className="brand-subtitle">Order Management System</p>
          </div>
        </div>

        {/* Navigation if logged in */}
        {currentUser && (
          <nav className="header-nav">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`nav-link-btn ${currentStep === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>

            {currentUser.role === 'customer' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('buat_pesanan')}
                  className={`nav-link-btn ${currentStep === 'buat_pesanan' ? 'active' : ''}`}
                >
                  <ShoppingBag size={15} />
                  <span>Buat Pesanan</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('riwayat')}
                  className={`nav-link-btn ${currentStep === 'riwayat' ? 'active' : ''}`}
                >
                  <History size={15} />
                  <span>Riwayat Pesanan</span>
                </button>
              </>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="header-right-group">
          {currentUser ? (
            <>
              {/* Cart Button (Customer Only) */}
              {currentUser.role === 'customer' && (
                <button
                  type="button"
                  onClick={() => onNavigate('checkout')}
                  className="cart-nav-btn"
                  title="Lihat Keranjang Belanja"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && <span className="cart-badge-dot">{cartCount}</span>}
                </button>
              )}

              {/* User Pill */}
              <div className="user-profile-pill">
                <div className="profile-mini-avatar">
                  {currentUser.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                </div>
                <div className="profile-text-group">
                  <div className="user-name-label">{currentUser.userName}</div>
                  <span className={`role-badge mini ${currentUser.role}`}>{currentUser.role}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="logout-nav-btn"
                title="Keluar / Logout"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </>
          ) : (
            <div className="quick-auth-triggers">
              <button
                type="button"
                onClick={() => onQuickLogin('081298765432', 'customer123')}
                className="demo-quick-btn customer"
              >
                Login Customer
              </button>
              <button
                type="button"
                onClick={() => onQuickLogin('081200000001', 'admin123')}
                className="demo-quick-btn admin"
              >
                Login Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
