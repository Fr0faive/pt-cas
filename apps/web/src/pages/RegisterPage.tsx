import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Select } from '@/components/ui/select.js';
import type { MsDistributor, MsOutlet } from '@repo/shared';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [regPhone, setRegPhone] = useState(
    (location.state as { phone?: string })?.phone || '',
  );
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDistributor, setRegDistributor] = useState('');
  const [regOutlet, setRegOutlet] = useState('');

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

  const handleSubmit = async (e: FormEvent) => {
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
      setSuccessMessage('Akun berhasil dibuat. Mengalihkan ke dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 800);
    }
  };

  const availableOutlets = outlets.filter((o) =>
    regDistributor ? o.kodeDistributor === regDistributor : true,
  );

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
            Registrasi Akun Baru
          </h1>
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Link
            to="/login"
            onClick={clearError}
            className="text-[#236f86] font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-[#236f86] rounded-md px-1"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
