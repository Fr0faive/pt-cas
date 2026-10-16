import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [loginPhone, setLoginPhone] = useState(
    (location.state as { phone?: string })?.phone || '',
  );
  const [loginPassword, setLoginPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!loginPhone.trim() || !loginPassword) return;

    const res = await login(loginPhone.trim(), loginPassword);
    if (res.success) {
      const user = useAuthStore.getState().user;
      const isSuperAdminOrAdmin = user?.role === 'superadmin' || user?.role === 'admin';
      navigate(isSuperAdminOrAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
    } else if (res.isRegistered === false) {
      navigate('/register', { state: { phone: loginPhone.trim() } });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px] mx-auto">
        {/* Logo from /logo.png */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="ei.embeauty"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#236f86]">
            Login
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Masukkan Nomor Handphone &amp; Password Anda
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="loginPhone" className="sr-only">
              Nomor Handphone
            </label>
            <Input
              id="loginPhone"
              type="tel"
              placeholder="Nomor Handphone"
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

          <div>
            <label htmlFor="loginPassword" className="sr-only">
              Password
            </label>
            <Input
              id="loginPassword"
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading || !loginPhone.trim() || !loginPassword}
              className="w-full h-12 text-base font-medium rounded-xl"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-slate-700">
          Belum terdaftar?{' '}
          <Link
            to="/register"
            onClick={clearError}
            className="text-[#236f86] font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-[#236f86] rounded-md px-1"
          >
            Daftar di sini
          </Link>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col items-center gap-2 text-xs text-slate-500">
          <span>Akun Demo Cepat:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setLoginPhone('081298765432');
                setLoginPassword('customer123');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition cursor-pointer"
            >
              Isi Customer (081298765432)
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginPhone('081200000001');
                setLoginPassword('admin123');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition cursor-pointer"
            >
              Isi Superadmin (081200000001)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
