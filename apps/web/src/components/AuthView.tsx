import { useEffect, useState, type FormEvent } from 'react';
import { useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Select } from '@/components/ui/select.js';
import type { MsDistributor, MsOutlet } from '@repo/shared';

export function AuthView() {
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login inputs
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regPhone, setRegPhone] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDistributor, setRegDistributor] = useState('');
  const [regOutlet, setRegOutlet] = useState('');

  // Master options for registration
  const [distributors, setDistributors] = useState<MsDistributor[]>([]);
  const [outlets, setOutlets] = useState<MsOutlet[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetch('/api/distributors')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setDistributors(json.data);
        }
      })
      .catch(() => {});

    fetch('/api/outlets')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setOutlets(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    if (!loginPhone.trim() || !loginPassword) {
      return;
    }

    const res = await login(loginPhone.trim(), loginPassword);
    if (!res.success && res.isRegistered === false) {
      // Flowchart branch: Nomor tidak terdaftar -> switch to Register with phone prefilled
      setRegPhone(loginPhone.trim());
      setMode('register');
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    if (!regPhone.trim() || !regName.trim() || !regPassword || !regDistributor || !regOutlet) {
      return;
    }

    const res = await register({
      phoneNumber: regPhone.trim(),
      userName: regName.trim(),
      userPassword: regPassword,
      kodeDistributor: regDistributor,
      kodeOutlet: regOutlet,
      role: 'customer',
    });

    if (res.success) {
      setSuccessMessage('Akun berhasil dibuat. Membuka dashboard...');
    }
  };

  const availableOutlets = outlets.filter((o) =>
    regDistributor ? o.kodeDistributor === regDistributor : true,
  );

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px] mx-auto">
        {mode === 'login' ? (
          <div>
            {/* Header matching Image 1 */}
            <div className="text-center mb-10">
              <h1 className="font-serif-brand text-3xl sm:text-4xl tracking-tight text-slate-900 font-normal">
                ei.embeauty
              </h1>
              <p className="text-xs text-slate-400 tracking-wide mt-1">
                you deserve better
              </p>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#236f86]">
                Login
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Masukkan Nomor Handphone &amp; Password Anda
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setMode('register');
                }}
                className="text-[#236f86] font-semibold hover:underline focus:outline-none"
              >
                Daftar di sini
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header matching Image 2 */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#236f86]">
                Registrasi Akun Baru
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Daftarkan akun Anda untuk melakukan Pemesanan
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="regPhone" className="sr-only">
                  Nomor Handphone
                </label>
                <Input
                  id="regPhone"
                  type="tel"
                  placeholder="Nomor Handphone"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>

              <div>
                <label htmlFor="regName" className="sr-only">
                  Nama
                </label>
                <Input
                  id="regName"
                  type="text"
                  placeholder="Nama"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label htmlFor="regPassword" className="sr-only">
                  Password
                </label>
                <Input
                  id="regPassword"
                  type="password"
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label htmlFor="regDistributor" className="sr-only">
                  Pilih Distributor
                </label>
                <Select
                  id="regDistributor"
                  value={regDistributor}
                  onChange={(e) => {
                    setRegDistributor(e.target.value);
                    setRegOutlet('');
                  }}
                  required
                >
                  <option value="" disabled>
                    Pilih Distributor
                  </option>
                  {distributors.map((d) => (
                    <option key={d.kodeDistributor} value={d.kodeDistributor}>
                      {d.namaDistributor}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label htmlFor="regOutlet" className="sr-only">
                  Pilih Outlet
                </label>
                <Select
                  id="regOutlet"
                  value={regOutlet}
                  disabled={!regDistributor}
                  onChange={(e) => setRegOutlet(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    {regDistributor ? 'Pilih Outlet' : 'Pilih Distributor terlebih dahulu'}
                  </option>
                  {availableOutlets.map((o) => (
                    <option key={o.kodeOutlet} value={o.kodeOutlet}>
                      {o.namaOutlet}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !regPhone.trim() ||
                    !regName.trim() ||
                    !regPassword ||
                    !regDistributor ||
                    !regOutlet
                  }
                  className="w-full h-12 text-base font-medium rounded-xl"
                >
                  {isLoading ? 'Mendaftarkan...' : 'Daftar'}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-slate-700">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setMode('login');
                }}
                className="text-indigo-600 underline font-medium hover:text-indigo-800 focus:outline-none"
              >
                Masuk di sini
              </button>
            </div>
          </div>
        )}

        {/* Quick Demo Fill Bar for Instant Testing */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col items-center gap-2 text-xs text-slate-500">
          <span>Akun Demo Cepat:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginPhone('081298765432');
                setLoginPassword('customer123');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
            >
              Isi Customer (081298765432)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginPhone('081200000001');
                setLoginPassword('admin123');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
            >
              Isi Admin (081200000001)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
