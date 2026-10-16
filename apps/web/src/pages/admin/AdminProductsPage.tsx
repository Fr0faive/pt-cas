import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Power,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckCircle,
} from "lucide-react";
import { authFetch } from "@/store/useAuthStore.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog.js";
import type { MsProduct, ProductVariant } from "@repo/shared";

export function AdminProductsPage() {
  const [products, setProducts] = useState<MsProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prodSku, setProdSku] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodImageBase64, setProdImageBase64] = useState("");
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>([]);

  const [variantName, setVariantName] = useState("");
  const [variantAddPrice, setVariantAddPrice] = useState("0");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch("/api/products?all=true");
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    authFetch("/api/products?all=true")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) {
          setProducts(json.data);
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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const getNextSuggestedSku = (items: MsProduct[]) => {
    let maxNum = 0;
    const regex = /^EI-A(\d+)$/i;
    items.forEach((item) => {
      const match = item.kodeSKU.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `EI-A${nextNum < 10 ? "0" : ""}${nextNum}`;
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setProdSku(getNextSuggestedSku(products));
    setProdName("");
    setProdPrice("");
    setProdIsActive(true);
    setProdImageBase64("");
    setProdVariants([]);
    setVariantName("");
    setVariantAddPrice("0");
    setFeedback(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (p: MsProduct) => {
    setIsEditing(true);
    setProdSku(p.kodeSKU);
    setProdName(p.namaSKU);
    setProdPrice(p.hargaJual.toString());
    setProdIsActive(p.isActive !== false);
    setProdImageBase64(p.imageURL || "");
    setProdVariants(p.variants ? [...p.variants] : []);
    setVariantName("");
    setVariantAddPrice("0");
    setFeedback(null);
    setIsDialogOpen(true);
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file gambar maksimal 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProdImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddVariant = () => {
    if (!variantName.trim()) return;
    const addPriceNum = parseFloat(variantAddPrice) || 0;
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      namaVarian: variantName.trim(),
      addPrice: addPriceNum,
    };
    setProdVariants((prev) => [...prev, newVariant]);
    setVariantName("");
    setVariantAddPrice("0");
  };

  const handleRemoveVariant = (variantId: string) => {
    setProdVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!prodSku.trim() || !prodName.trim() || !prodPrice) return;

    setIsSubmitting(true);
    setFeedback(null);

    const fallbackImage =
      "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60";

    const payload = {
      kodeSKU: prodSku.trim().toUpperCase(),
      namaSKU: prodName.trim(),
      hargaJual: parseFloat(prodPrice),
      imageURL: prodImageBase64.trim() || fallbackImage,
      isActive: prodIsActive,
      variants: prodVariants,
    };

    try {
      let res;
      if (isEditing) {
        res = await authFetch(`/api/products/${prodSku}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({
          type: "success",
          text: isEditing
            ? `Produk ${prodSku} berhasil diperbarui.`
            : `Produk baru ${payload.kodeSKU} berhasil ditambahkan.`,
        });
        setIsDialogOpen(false);
        await fetchProducts();
      } else {
        setFeedback({
          type: "error",
          text: json.message || "Gagal menyimpan produk.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSoftDelete = async (product: MsProduct) => {
    const isCurrentlyActive = product.isActive !== false;
    const actionText = isCurrentlyActive
      ? "menonaktifkan"
      : "mengaktifkan kembali";

    if (
      !window.confirm(
        `Yakin ingin ${actionText} produk "${product.namaSKU}" (${product.kodeSKU})?`,
      )
    ) {
      return;
    }

    try {
      let res;
      if (isCurrentlyActive) {
        res = await authFetch(`/api/products/${product.kodeSKU}`, {
          method: "DELETE",
        });
      } else {
        res = await authFetch(`/api/products/${product.kodeSKU}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        });
      }

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({
          type: "success",
          text: `Status produk ${product.kodeSKU} berhasil diubah menjadi ${isCurrentlyActive ? "Nonaktif" : "Aktif"}.`,
        });
        await fetchProducts();
      } else {
        setFeedback({
          type: "error",
          text: json.message || "Gagal mengubah status produk.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Terjadi kesalahan jaringan." });
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      p.namaSKU.toLowerCase().includes(term) ||
      p.kodeSKU.toLowerCase().includes(term) ||
      p.variants?.some((v) => v.namaVarian.toLowerCase().includes(term));

    const isActive = p.isActive !== false;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "inactive" && !isActive);

    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage),
  );
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const basePriceNum = parseFloat(prodPrice) || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Master Produk SKU
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola katalog SKU kosmetik, opsi varian harga, upload foto base64,
            dan status aktif
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            className="gap-2 text-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sinkron</span>
          </Button>
          <Button
            type="button"
            onClick={handleOpenAdd}
            className="gap-2 text-xs bg-[#236f86] hover:bg-[#1c5b6e] text-white cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah SKU Baru</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm border flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari SKU, nama produk, atau varian..."
            className="pl-10 text-xs sm:text-sm bg-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "active", "inactive"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                statusFilter === st
                  ? "bg-[#236f86] text-white border-[#236f86]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st === "all"
                ? "Semua Produk"
                : st === "active"
                  ? "Aktif"
                  : "Nonaktif"}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          Memuat data produk...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          Tidak ada produk yang cocok dengan pencarian atau filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                  <th className="py-3 px-4 w-16">Foto</th>
                  <th className="py-3 px-4">Kode SKU</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Harga Dasar</th>
                  <th className="py-3 px-4">Opsi Varian (Add Price)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedProducts.map((p) => {
                  const isActive = p.isActive !== false;
                  return (
                    <tr
                      key={p.kodeSKU}
                      className={`hover:bg-slate-50/60 transition ${
                        !isActive ? "bg-slate-50/40 text-slate-400" : ""
                      }`}
                    >
                      {/* Foto Thumbnail */}
                      <td className="py-3 px-4">
                        <img
                          src={p.imageURL}
                          alt={p.namaSKU}
                          className="h-12 w-12 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                          loading="lazy"
                        />
                      </td>

                      {/* Kode SKU */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {p.kodeSKU}
                      </td>

                      {/* Nama Produk */}
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {p.namaSKU}
                      </td>

                      {/* Harga Dasar */}
                      <td className="py-3 px-4 font-bold text-[#236f86] whitespace-nowrap">
                        {formatRupiah(p.hargaJual)}
                      </td>

                      {/* Varian */}
                      <td className="py-3 px-4">
                        {p.variants && p.variants.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {p.variants.map((v) => (
                              <span
                                key={v.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                <span>{v.namaVarian}</span>
                                <span className="font-semibold text-emerald-700">
                                  {v.addPrice > 0
                                    ? `(+${formatRupiah(v.addPrice)})`
                                    : "(+Rp 0)"}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Tanpa varian
                          </span>
                        )}
                      </td>

                      {/* Status Badges */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      {/* Aksi Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#236f86] hover:bg-slate-50 transition cursor-pointer"
                            title="Edit Produk"
                            aria-label={`Edit produk ${p.kodeSKU}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleSoftDelete(p)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isActive
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                            title={
                              isActive ? "Nonaktifkan" : "Aktifkan Kembali"
                            }
                            aria-label={
                              isActive
                                ? "Soft delete produk"
                                : "Aktifkan produk"
                            }
                          >
                            {isActive ? (
                              <Trash2 className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Menampilkan <strong>{startIndex + 1}</strong> &ndash;{" "}
              <strong>
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
              </strong>{" "}
              dari <strong>{filteredProducts.length}</strong> produk
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      validCurrentPage === pageNum
                        ? "bg-[#236f86] text-white shadow-2xs"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={validCurrentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Form Produk (Shadcn UI) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          onClose={() => setIsDialogOpen(false)}
          className="max-w-2xl"
        >
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {isEditing
                  ? `Edit Produk SKU: ${prodSku}`
                  : "Tambah Produk SKU Baru"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Perbarui rincian produk, unggah foto base64, dan kelola opsi varian harga"
                  : "Buat master produk baru dengan format kode SKU standar atau kustom"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pr-2">
              {/* Row 1: SKU & Nama */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="skuInput"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Kode SKU <span className="text-red-500">*</span>
                    </label>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() =>
                          setProdSku(getNextSuggestedSku(products))
                        }
                        className="text-[11px] text-[#236f86] hover:underline cursor-pointer font-medium"
                      >
                        Format EI-A
                      </button>
                    )}
                  </div>
                  <Input
                    id="skuInput"
                    placeholder="Contoh: EI-A05"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    disabled={isEditing}
                    required
                  />
                  {!isEditing && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format standar: <strong>EI-A{"{nomor}"}</strong> (bisa
                      dikustomisasi).
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="nameInput"
                    className="text-xs font-semibold text-slate-700 block mb-1"
                  >
                    Nama Produk SKU <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nameInput"
                    placeholder="Contoh: Brightening Serum 30ml"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Harga Dasar & Status Aktif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="priceInput"
                    className="text-xs font-semibold text-slate-700 block mb-1"
                  >
                    Harga Dasar Jual (Rp){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="priceInput"
                    type="number"
                    min="0"
                    step="500"
                    placeholder="Contoh: 65000"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="statusSelect"
                    className="text-xs font-semibold text-slate-700 block mb-1"
                  >
                    Status Produk
                  </label>
                  <select
                    id="statusSelect"
                    value={prodIsActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setProdIsActive(e.target.value === "active")
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#236f86]"
                  >
                    <option value="active">
                      Aktif (Tampil di Katalog Pesanan)
                    </option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Upload Gambar Base64 */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Foto Produk
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  {prodImageBase64 ? (
                    <div className="relative group shrink-0">
                      <img
                        src={prodImageBase64}
                        alt="Preview Produk"
                        className="h-20 w-20 rounded-xl object-cover border border-slate-200 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setProdImageBase64("")}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-sm hover:bg-red-700 transition cursor-pointer"
                        title="Hapus foto"
                        aria-label="Hapus foto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-white">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-[10px] mt-1">Belum ada</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                      <Upload className="h-4 w-4 text-[#236f86]" />
                      <span>
                        {prodImageBase64
                          ? "Pilih Gambar Lain"
                          : "Upload File Gambar"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Mendukung JPG, PNG, WEBP (maks. 5MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 4: Opsi Varian & Add Price */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-[#236f86]" />
                    <span className="text-xs font-bold text-slate-900">
                      Opsi Varian Produk &amp; Tambahan Harga (Add Price)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {prodVariants.length} Varian
                  </span>
                </div>

                {/* Variant List */}
                {prodVariants.length > 0 && (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 divide-y divide-slate-200/60">
                    {prodVariants.map((v, idx) => {
                      const totalVariantPrice = basePriceNum + v.addPrice;
                      return (
                        <div
                          key={v.id}
                          className={`flex items-center justify-between text-xs ${
                            idx > 0 ? "pt-2" : ""
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-slate-800">
                              {v.namaVarian}
                            </span>
                            <span className="text-slate-500 ml-2">
                              Tambahan:{" "}
                              <strong>+{formatRupiah(v.addPrice)}</strong>
                            </span>
                            <span className="text-emerald-700 font-bold ml-2">
                              (Harga Jual: {formatRupiah(totalVariantPrice)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                            title="Hapus varian"
                            aria-label={`Hapus varian ${v.namaVarian}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Form Tambah Varian Baru */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Tambah Opsi Varian:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6">
                      <Input
                        placeholder="Nama Varian (misal: Ukuran 50ml / Shade 02)"
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Input
                        type="number"
                        min="0"
                        step="500"
                        placeholder="Add Price (+Rp)"
                        value={variantAddPrice}
                        onChange={(e) => setVariantAddPrice(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        onClick={handleAddVariant}
                        disabled={!variantName.trim()}
                        className="w-full text-xs h-9 bg-slate-800 hover:bg-slate-900 text-white cursor-pointer"
                      >
                        + Tambah
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs h-10 px-4"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !prodSku.trim() ||
                  !prodName.trim() ||
                  !prodPrice
                }
                className="text-xs h-10 px-5 bg-[#236f86] hover:bg-[#1c5b6e] text-white"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : isEditing
                    ? "Simpan Perubahan"
                    : "Tambah Produk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
