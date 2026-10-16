import { useEffect, useState, type FormEvent } from 'react';
import { Store, Truck, RefreshCw, Search, Plus, Trash2, Edit2, X, CheckCircle } from 'lucide-react';
import { authFetch } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Select } from '@/components/ui/select.js';
import type { MsDistributor, MsOutlet } from '@repo/shared';

export function AdminMastersPage() {
  const [outlets, setOutlets] = useState<MsOutlet[]>([]);
  const [distributors, setDistributors] = useState<MsDistributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchOutlet, setSearchOutlet] = useState('');
  const [searchDistributor, setSearchDistributor] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showDistModal, setShowDistModal] = useState(false);
  const [editDistId, setEditDistId] = useState<string | null>(null);
  const [distCode, setDistCode] = useState('');
  const [distName, setDistName] = useState('');

  const [showOutletModal, setShowOutletModal] = useState(false);
  const [editOutletId, setEditOutletId] = useState<string | null>(null);
  const [outletCode, setOutletCode] = useState('');
  const [outletName, setOutletName] = useState('');
  const [outletDist, setOutletDist] = useState('');

  const fetchMasters = async () => {
    setIsLoading(true);
    try {
      const [outRes, distRes] = await Promise.all([
        fetch('/api/outlets'),
        fetch('/api/distributors'),
      ]);
      if (outRes.ok) {
        const json = await outRes.json();
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
    Promise.all([fetch('/api/outlets'), fetch('/api/distributors')])
      .then(async ([outRes, distRes]) => {
        if (!isMounted) return;
        if (outRes.ok) {
          const json = await outRes.json();
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

  const openAddDistributor = () => {
    setEditDistId(null);
    setDistCode(`DIST-00${distributors.length + 1}`);
    setDistName('');
    setShowDistModal(true);
  };

  const openEditDistributor = (d: MsDistributor) => {
    setEditDistId(d.kodeDistributor);
    setDistCode(d.kodeDistributor);
    setDistName(d.namaDistributor);
    setShowDistModal(true);
  };

  const handleSaveDistributor = async (e: FormEvent) => {
    e.preventDefault();
    if (!distCode.trim() || !distName.trim()) return;

    try {
      let res;
      if (editDistId) {
        res = await authFetch(`/api/distributors/${editDistId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ namaDistributor: distName.trim() }),
        });
      } else {
        res = await authFetch('/api/distributors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kodeDistributor: distCode.trim().toUpperCase(),
            namaDistributor: distName.trim(),
          }),
        });
      }

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedbackMsg({
          type: 'success',
          text: editDistId ? 'Distributor berhasil diperbarui.' : 'Distributor baru berhasil ditambahkan.',
        });
        setShowDistModal(false);
        await fetchMasters();
      } else {
        setFeedbackMsg({ type: 'error', text: json.message || 'Gagal menyimpan distributor.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Terjadi kesalahan koneksi.' });
    }
  };

  const handleDeleteDistributor = async (kode: string, name: string) => {
    if (!window.confirm(`Hapus distributor "${name}" (${kode})? Data outlet terkait mungkin terdampak.`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/distributors/${kode}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        setFeedbackMsg({ type: 'success', text: `Distributor ${kode} berhasil dihapus.` });
        await fetchMasters();
      } else {
        setFeedbackMsg({ type: 'error', text: json.message || 'Gagal menghapus distributor.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Terjadi kesalahan koneksi.' });
    }
  };

  const openAddOutlet = () => {
    setEditOutletId(null);
    setOutletCode(`OUT-00${outlets.length + 1}`);
    setOutletName('');
    setOutletDist(distributors[0]?.kodeDistributor || '');
    setShowOutletModal(true);
  };

  const openEditOutlet = (o: MsOutlet) => {
    setEditOutletId(o.kodeOutlet);
    setOutletCode(o.kodeOutlet);
    setOutletName(o.namaOutlet);
    setOutletDist(o.kodeDistributor);
    setShowOutletModal(true);
  };

  const handleSaveOutlet = async (e: FormEvent) => {
    e.preventDefault();
    if (!outletCode.trim() || !outletName.trim() || !outletDist) return;

    try {
      let res;
      if (editOutletId) {
        res = await authFetch(`/api/outlets/${editOutletId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            namaOutlet: outletName.trim(),
            kodeDistributor: outletDist,
          }),
        });
      } else {
        res = await authFetch('/api/outlets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kodeOutlet: outletCode.trim().toUpperCase(),
            namaOutlet: outletName.trim(),
            kodeDistributor: outletDist,
          }),
        });
      }

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedbackMsg({
          type: 'success',
          text: editOutletId ? 'Outlet berhasil diperbarui.' : 'Outlet baru berhasil ditambahkan.',
        });
        setShowOutletModal(false);
        await fetchMasters();
      } else {
        setFeedbackMsg({ type: 'error', text: json.message || 'Gagal menyimpan outlet.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Terjadi kesalahan koneksi.' });
    }
  };

  const handleDeleteOutlet = async (kode: string, name: string) => {
    if (!window.confirm(`Hapus outlet "${name}" (${kode})?`)) return;

    try {
      const res = await authFetch(`/api/outlets/${kode}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        setFeedbackMsg({ type: 'success', text: `Outlet ${kode} berhasil dihapus.` });
        await fetchMasters();
      } else {
        setFeedbackMsg({ type: 'error', text: json.message || 'Gagal menghapus outlet.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Terjadi kesalahan koneksi.' });
    }
  };

  const filteredOutlets = outlets.filter(
    (o) =>
      o.namaOutlet.toLowerCase().includes(searchOutlet.toLowerCase()) ||
      o.kodeOutlet.toLowerCase().includes(searchOutlet.toLowerCase()) ||
      o.kodeDistributor.toLowerCase().includes(searchOutlet.toLowerCase()),
  );

  const filteredDistributors = distributors.filter(
    (d) =>
      d.namaDistributor.toLowerCase().includes(searchDistributor.toLowerCase()) ||
      d.kodeDistributor.toLowerCase().includes(searchDistributor.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Kelola Master Outlet &amp; Distributor
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Akses kelola superadmin untuk jaringan distribusi resmi dan gerai outlet
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchMasters}
          className="gap-2 text-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Muat Ulang</span>
        </Button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm border flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          Memuat data master...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Outlet Management Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#236f86]" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Master Outlet ({outlets.length})
                  </h3>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={openAddOutlet}
                  className="gap-1.5 text-xs h-8 px-3 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Outlet</span>
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari nama, kode outlet, atau distributor..."
                  className="pl-10 text-xs sm:text-sm bg-slate-50/60"
                  value={searchOutlet}
                  onChange={(e) => setSearchOutlet(e.target.value)}
                />
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {filteredOutlets.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">
                    Tidak ada outlet yang sesuai.
                  </p>
                ) : (
                  filteredOutlets.map((o) => (
                    <div
                      key={o.kodeOutlet}
                      className="py-3 flex justify-between items-center gap-2 hover:bg-slate-50/50 px-2 rounded-lg transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                          {o.namaOutlet}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {o.kodeOutlet}
                          </span>
                          <span>&bull;</span>
                          <span>Dist: <strong>{o.kodeDistributor}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditOutlet(o)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Edit Outlet"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOutlet(o.kodeOutlet, o.namaOutlet)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Outlet"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Distributor Management Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#236f86]" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Master Distributor ({distributors.length})
                  </h3>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={openAddDistributor}
                  className="gap-1.5 text-xs h-8 px-3 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Distributor</span>
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari nama atau kode distributor..."
                  className="pl-10 text-xs sm:text-sm bg-slate-50/60"
                  value={searchDistributor}
                  onChange={(e) => setSearchDistributor(e.target.value)}
                />
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {filteredDistributors.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">
                    Tidak ada distributor yang sesuai.
                  </p>
                ) : (
                  filteredDistributors.map((d) => (
                    <div
                      key={d.kodeDistributor}
                      className="py-3 flex justify-between items-center gap-2 hover:bg-slate-50/50 px-2 rounded-lg transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                          {d.namaDistributor}
                        </p>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {d.kodeDistributor}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditDistributor(d)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Edit Distributor"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDistributor(d.kodeDistributor, d.namaDistributor)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Distributor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Distributor */}
      {showDistModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editDistId ? 'Ubah Data Distributor' : 'Tambah Distributor Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDistModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDistributor} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kode Distributor
                </label>
                <Input
                  value={distCode}
                  onChange={(e) => setDistCode(e.target.value)}
                  disabled={Boolean(editDistId)}
                  placeholder="Contoh: DIST-003"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Distributor
                </label>
                <Input
                  value={distName}
                  onChange={(e) => setDistName(e.target.value)}
                  placeholder="Contoh: PT Sagara Timur Dewata"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDistModal(false)}
                  className="text-xs h-9 px-4"
                >
                  Batal
                </Button>
                <Button type="submit" className="text-xs h-9 px-5">
                  Simpan Distributor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Outlet */}
      {showOutletModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editOutletId ? 'Ubah Data Outlet' : 'Tambah Outlet Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowOutletModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOutlet} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kode Outlet
                </label>
                <Input
                  value={outletCode}
                  onChange={(e) => setOutletCode(e.target.value)}
                  disabled={Boolean(editOutletId)}
                  placeholder="Contoh: OUT-004"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Outlet
                </label>
                <Input
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  placeholder="Contoh: Toko Kosmetik Cantik Ayu"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Distributor Terkait
                </label>
                <Select
                  value={outletDist}
                  onChange={(e) => setOutletDist(e.target.value)}
                  required
                >
                  <option value="" disabled>Pilih Distributor</option>
                  {distributors.map((d) => (
                    <option key={d.kodeDistributor} value={d.kodeDistributor}>
                      {d.namaDistributor} ({d.kodeDistributor})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOutletModal(false)}
                  className="text-xs h-9 px-4"
                >
                  Batal
                </Button>
                <Button type="submit" className="text-xs h-9 px-5">
                  Simpan Outlet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
