import { CheckCircle2, ChevronRight, CircleDot } from 'lucide-react';

export type FlowStep =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'buat_pesanan'
  | 'keranjang'
  | 'checkout'
  | 'riwayat'
  | 'selesai';

interface Props {
  currentStep: FlowStep;
  onNavigate?: (step: FlowStep) => void;
  isLoggedIn: boolean;
}

export function FlowchartBar({ currentStep, onNavigate, isLoggedIn }: Props) {
  const steps: { id: FlowStep; label: string; desc: string }[] = [
    { id: 'login', label: '1. Login HP', desc: 'No. Handphone' },
    { id: 'dashboard', label: '2. Dashboard', desc: 'Ringkasan Menu' },
    { id: 'buat_pesanan', label: '3. Buat Pesanan', desc: 'Pilih Produk' },
    { id: 'checkout', label: '4. Checkout', desc: 'Simpan Pesanan' },
    { id: 'riwayat', label: '5. Riwayat', desc: 'Daftar Pesanan' },
  ];

  const getStepIndex = (step: FlowStep) => {
    switch (step) {
      case 'login':
      case 'register':
        return 0;
      case 'dashboard':
        return 1;
      case 'buat_pesanan':
      case 'keranjang':
        return 2;
      case 'checkout':
        return 3;
      case 'riwayat':
      case 'selesai':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="flowchart-container">
      <div className="flowchart-header">
        <div className="flowchart-title">
          <span className="flowchart-badge">Sesuai Alur Flowchart</span>
          <span>Tahapan Transaksi Pemesanan Produk</span>
        </div>
      </div>

      <div className="flowchart-steps">
        {steps.map((s, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isClickable = isLoggedIn && onNavigate && idx <= currentIndex + 1;

          return (
            <div key={s.id} className="flowchart-step-wrapper">
              <button
                type="button"
                onClick={() => isClickable && onNavigate(s.id)}
                disabled={!isClickable}
                className={`flowchart-step ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
              >
                <div className="step-icon">
                  {isDone ? (
                    <CheckCircle2 size={16} color="#34d399" />
                  ) : isCurrent ? (
                    <CircleDot size={16} color="#818cf8" />
                  ) : (
                    <span className="step-number">{idx + 1}</span>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">{s.label}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className={`step-arrow ${idx < currentIndex ? 'done' : ''}`}>
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
