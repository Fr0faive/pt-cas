import type { UserRole } from "../types/index.js";

export const APP_CONFIG = {
  appName: "PT CAS Ordering Portal",
  company: "PT Cantik Alami Sehat",
  apiVersion: "1.0.0",
  defaultPort: 3000,
  webPort: 5173,
} as const;

export const AVAILABLE_ROLES: readonly UserRole[] = [
  "admin",
  "customer",
] as const;

export const ORDER_STATUSES = [
  "Menunggu Konfirmasi",
  "Diproses",
  "Selesai",
  "Dibatalkan",
] as const;

export const API_ROUTES = {
  HEALTH: "/api/health",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_REGISTER: "/api/auth/register",
  AUTH_ME: "/api/auth/me",
  PRODUCTS: "/api/products",
  OUTLETS: "/api/outlets",
  DISTRIBUTORS: "/api/distributors",
  ORDERS: "/api/orders",
  USERS: "/api/users",
  SEED: "/api/seed",
} as const;
