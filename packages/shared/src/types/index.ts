export type UserRole = 'superadmin' | 'admin' | 'customer';

export interface MsUser {
  phoneNumber: string;
  userName: string;
  userPassword?: string;
  kodeOutlet: string;
  kodeDistributor: string;
  role: UserRole;
  createdAt?: string;
}

export type MsUserSafe = Omit<MsUser, 'userPassword'>;

export interface MsDistributor {
  kodeDistributor: string;
  namaDistributor: string;
}

export interface MsOutlet {
  kodeOutlet: string;
  namaOutlet: string;
  kodeDistributor: string;
}

export interface ProductVariant {
  id: string;
  namaVarian: string;
  addPrice: number;
}

export interface MsProduct {
  kodeSKU: string;
  namaSKU: string;
  imageURL: string;
  hargaJual: number;
  isActive?: boolean;
  variants?: ProductVariant[];
}

export interface TrOrderHeader {
  orderNumber: string;
  orderDate: string;
  phoneNumber: string;
  kodeOutlet: string;
  kodeDistributor: string;
  orderStatus: 'Menunggu Konfirmasi' | 'Diproses' | 'Selesai' | 'Dibatalkan';
  totalAmount: number;
  paymentMethod?: string;
}

export interface TrOrderDetail {
  id?: number | string;
  orderNumber: string;
  kodeSKU: string;
  qty: number;
  hargaJual: number;
  subtotal: number;
}

export interface OrderDetailWithProduct extends TrOrderDetail {
  product?: MsProduct;
}

export interface OrderWithDetails extends TrOrderHeader {
  customerName?: string;
  outlet?: MsOutlet;
  distributor?: MsDistributor;
  items: OrderDetailWithProduct[];
}

export interface LoginDto {
  phoneNumber: string;
  userPassword: string;
}

export interface RegisterDto {
  phoneNumber: string;
  userName: string;
  userPassword: string;
  kodeOutlet: string;
  kodeDistributor: string;
  role?: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: MsUserSafe;
  tokens: AuthTokens;
  isRegistered?: boolean;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface CreateOrderDto {
  phoneNumber: string;
  kodeOutlet: string;
  kodeDistributor: string;
  paymentMethod?: string;
  items: {
    kodeSKU: string;
    qty: number;
    hargaJual: number;
  }[];
}

export interface UpdateOrderStatusDto {
  orderStatus: 'Menunggu Konfirmasi' | 'Diproses' | 'Selesai' | 'Dibatalkan';
}

export interface CartItem {
  id?: string;
  product: MsProduct;
  qty: number;
  selectedVariant?: ProductVariant;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ServerStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  uptime: number;
  environment: string;
  timestamp: string;
  version: string;
}

export interface HashVerificationResult {
  hashed: string;
  matched: boolean;
  algorithm: 'bcrypt';
}
