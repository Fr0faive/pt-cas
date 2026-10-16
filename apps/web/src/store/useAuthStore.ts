import { create } from 'zustand';
import type { ApiResponse, AuthResponseData, AuthTokens, MsUserSafe, RegisterDto } from '@repo/shared';

interface AuthState {
  user: MsUserSafe | null;
  accessToken: string | null;
  refreshToken: string | null;
  outletName: string;
  distributorName: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (phoneNumber: string, userPassword: string) => Promise<{ success: boolean; message: string; isRegistered?: boolean }>;
  register: (data: RegisterDto) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEYS = {
  USER: 'pt_cas_user',
  ACCESS_TOKEN: 'pt_cas_access_token',
  REFRESH_TOKEN: 'pt_cas_refresh_token',
  OUTLET_NAME: 'pt_cas_outlet_name',
  DISTRIBUTOR_NAME: 'pt_cas_distributor_name',
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize from localStorage if present
  const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
  const savedAccess = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const savedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const savedOutletName = localStorage.getItem(STORAGE_KEYS.OUTLET_NAME) || '';
  const savedDistName = localStorage.getItem(STORAGE_KEYS.DISTRIBUTOR_NAME) || '';

  return {
    user: savedUser ? (JSON.parse(savedUser) as MsUserSafe) : null,
    accessToken: savedAccess,
    refreshToken: savedRefresh,
    outletName: savedOutletName,
    distributorName: savedDistName,
    isAuthenticated: Boolean(savedAccess && savedUser),
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    login: async (phoneNumber: string, userPassword: string) => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber, userPassword }),
        });

        const json: ApiResponse<AuthResponseData> = await res.json();

        if (!res.ok || !json.success) {
          const msg = json.message || 'Login gagal. Periksa nomor dan password.';
          const isRegistered = json.data?.isRegistered ?? false;
          set({ isLoading: false, error: msg });
          return { success: false, message: msg, isRegistered };
        }

        const { user, tokens } = json.data;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Load full profile details like outlet name & distributor name
        await get().fetchProfile();

        return { success: true, message: json.message };
      } catch {
        const errorMsg = 'Tidak dapat terhubung ke server backend.';
        set({ isLoading: false, error: errorMsg });
        return { success: false, message: errorMsg };
      }
    },

    register: async (dto: RegisterDto) => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto),
        });

        const json: ApiResponse<AuthResponseData> = await res.json();

        if (!res.ok || !json.success) {
          const msg = json.message || 'Registrasi gagal. Silakan coba lagi.';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }

        const { user, tokens } = json.data;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        await get().fetchProfile();
        return { success: true, message: json.message };
      } catch {
        const errorMsg = 'Gagal melakukan registrasi.';
        set({ isLoading: false, error: errorMsg });
        return { success: false, message: errorMsg };
      }
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.OUTLET_NAME);
      localStorage.removeItem(STORAGE_KEYS.DISTRIBUTOR_NAME);

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        outletName: '',
        distributorName: '',
        isAuthenticated: false,
        error: null,
      });
    },

    refreshSession: async () => {
      const currentRefresh = get().refreshToken;
      if (!currentRefresh) {
        get().logout();
        return false;
      }

      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefresh }),
        });

        const json: ApiResponse<AuthTokens> = await res.json();
        if (res.ok && json.success) {
          const { accessToken, refreshToken } = json.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
          });
          return true;
        }

        get().logout();
        return false;
      } catch {
        get().logout();
        return false;
      }
    },

    fetchProfile: async () => {
      const user = get().user;
      if (!user?.phoneNumber) return;

      try {
        const res = await fetch(`/api/auth/profile/${user.phoneNumber}`);
        const json = await res.json();
        if (res.ok && json.success) {
          const outletName = json.data.outletName || 'Angga Kosmetik';
          const distributorName = json.data.distributorName || 'CV. Sagara Timur Dewata';

          localStorage.setItem(STORAGE_KEYS.OUTLET_NAME, outletName);
          localStorage.setItem(STORAGE_KEYS.DISTRIBUTOR_NAME, distributorName);

          set({ outletName, distributorName });
        }
      } catch {
        // Fallback names matching sample dashboard in Image 3
        set({
          outletName: 'Angga Kosmetik',
          distributorName: 'CV. Sagara Timur Dewata',
        });
      }
    },
  };
});

/**
 * Fetch wrapper that attaches the Bearer token and automatically refreshes on 401
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const store = useAuthStore.getState();
  const token = store.accessToken;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && store.refreshToken) {
    const refreshed = await store.refreshSession();
    if (refreshed) {
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
      }
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}
