# PT CAS Monorepo — Aplikasi Pemesanan Barang (Vite + React Router + NestJS + Drizzle ORM)

Arsitektur **pnpm workspace monorepo** ditenagai oleh **Turborepo** yang mengimplementasikan **Flowchart Alur Pemesanan**, **Multi-page React Router**, dan **Database Relasional Drizzle ORM** dengan pemisahan peran ketat: **`admin`** dan **`customer`**.

---

## 🧭 Struktur Halaman & Routing (React Router)

Aplikasi telah dipisahkan menjadi rute halaman mandiri dengan **Protected Route Guard** berbasis token sesi (Zustand + JWT):

| Rute URL | Komponen Halaman | Status Akses | Deskripsi Sesuai Desain |
| :--- | :--- | :--- | :--- |
| **`/login`** | [LoginPage.tsx](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/src/pages/LoginPage.tsx) | Publik | Menggunakan [logo.png](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/public/logo.png), input No HP & Password, tombol Masuk, dan link Daftar |
| **`/register`** | [RegisterPage.tsx](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/src/pages/RegisterPage.tsx) | Publik | Menggunakan [logo.png](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/public/logo.png), No HP, Nama, Password, Dropdown Distributor & Outlet |
| **`/dashboard`** | [CustomerDashboardPage.tsx](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/src/pages/CustomerDashboardPage.tsx) | **Protected (Customer)** | Tampilan pastel cyan, sapaan selamat datang, info outlet/distributor, tombol Buat Pesanan, Riwayat Pesanan, dan Logout |
| **`/orders/new`** | [CreateOrderPage.tsx](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/src/pages/CreateOrderPage.tsx) | **Protected (Customer)** | Halaman katalog produk dengan pencarian SKU, kontrol kuantitas, dan floating bar keranjang |
| **`/cart`** | [CartCheckoutPage.tsx](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/src/pages/CartCheckoutPage.tsx) | **Protected (Customer)** | Halaman checkout dengan rincian belanja, ringkasan pemesan, dan aksi Simpan Pesanan |
| **`/orders`** | [OrderHistoryPage.tsx](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/src/pages/OrderHistoryPage.tsx) | **Protected (Customer)** | Halaman riwayat pesanan dengan filter status, collapsible detail item, dan tanggal |
| **`/admin`** | [AdminDashboardPage.tsx](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/src/pages/AdminDashboardPage.tsx) | **Protected (Admin)** | Control panel untuk kelola seluruh pesanan, update status transaksi, dan tambah master SKU |

---

## 🔐 Keamanan Sesi & API

1. **Global Protected Guard (`APP_GUARD`)**:
   - Seluruh endpoint di backend NestJS terlindungi secara default (`JwtAuthGuard`).
   - Endpoint publik ditandai dengan dekorator `@Public()`.
2. **Refresh Token**:
   - Token akses berumur 15 menit dan refresh token berumur 7 hari.
   - Endpoint `POST /api/auth/refresh` memperbarui token secara otomatis tanpa logout paksa.
3. **State Management Zustand**:
   - [useAuthStore](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/src/store/useAuthStore.ts): Mengelola sesi login, user, access token, dan refresh token di `localStorage`.
   - [useCartStore](file:///Users/faikarmocht/Pekerjaan/interview/pt-cas/apps/web/src/store/useCartStore.ts): Mengelola item keranjang belanja tetap persisten saat berpindah rute `/orders/new` dan `/cart`.
   - Wrapper `authFetch()` otomatis menyematkan header `Bearer <accessToken>` dan menangani silent refresh saat token expired (401).

---

## 🔑 Akun Demo Cepat

- **Customer Akun**:
  - Nomor Handphone: `081298765432`
  - Password: `customer123`
  - Outlet: Toko Berkah CAS (Angga Kosmetik)
- **Admin Akun**:
  - Nomor Handphone: `081200000001`
  - Password: `admin123`

---

## 🚀 Menjalankan Aplikasi

```bash
pnpm dev
```
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **API NestJS**: [http://localhost:3000/api](http://localhost:3000/api)
