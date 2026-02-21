"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface ProductItem {
  id: string;
  title: string;
  price: number;
  images: string | string[];
  category: string;
  status: string;
  hidden: boolean;
  views: number;
  city: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  _count: { reports: number; favorites: number; conversations: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

const CATEGORIES = [
  "vehicles",
  "property",
  "electronics",
  "services",
  "furniture",
  "clothing",
  "other",
];

const STATUSES = ["available", "reserved", "sold"];

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("categories");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hiddenFilter, setHiddenFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    price: string;
    category: string;
    status: string;
  }>({ title: "", price: "", category: "", status: "" });

  const prevFiltersRef = useRef({ categoryFilter, statusFilter, hiddenFilter, searchQuery });
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProducts = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });
        if (categoryFilter) params.set("category", categoryFilter);
        if (statusFilter) params.set("status", statusFilter);
        if (hiddenFilter) params.set("hidden", hiddenFilter);
        if (searchQuery) params.set("search", searchQuery);

        const res = await fetch(`/api/admin/products?${params}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.products);
        setPagination(data.pagination);
        if (data.categoryCounts) {
          setCategoryCounts(data.categoryCounts);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [categoryFilter, statusFilter, hiddenFilter, searchQuery]
  );

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.categoryFilter !== categoryFilter ||
      prevFiltersRef.current.statusFilter !== statusFilter ||
      prevFiltersRef.current.hiddenFilter !== hiddenFilter ||
      prevFiltersRef.current.searchQuery !== searchQuery;
    prevFiltersRef.current = { categoryFilter, statusFilter, hiddenFilter, searchQuery };

    if (filtersChanged && pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    fetchProducts(pagination.page);
  }, [pagination.page, fetchProducts, categoryFilter, statusFilter, hiddenFilter, searchQuery]);

  // Debounced search
  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 400);
  };

  const handleToggleHide = async (productId: string, currentHidden: boolean) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !currentHidden }),
      });
      if (!res.ok) throw new Error("Failed to update product");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, hidden: !currentHidden } : p
        )
      );
    } catch {
      // Failed silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update product");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, status: newStatus } : p
        )
      );
    } catch {
      // Failed silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (product: ProductItem) => {
    setEditingProduct(product.id);
    setEditForm({
      title: product.title,
      price: String(product.price),
      category: product.category,
      status: product.status,
    });
  };

  const handleSaveEdit = async (productId: string) => {
    setActionLoading(productId);
    try {
      const updates: Record<string, unknown> = {};
      const original = products.find((p) => p.id === productId);
      if (!original) return;

      if (editForm.title !== original.title) updates.title = editForm.title;
      if (Number(editForm.price) !== original.price) updates.price = Number(editForm.price);
      if (editForm.category !== original.category) updates.category = editForm.category;
      if (editForm.status !== original.status) updates.status = editForm.status;

      if (Object.keys(updates).length === 0) {
        setEditingProduct(null);
        return;
      }

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update product");
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, title: updated.title, price: updated.price, category: updated.category, status: updated.status }
            : p
        )
      );
      setEditingProduct(null);
    } catch {
      // Failed silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (productId: string) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      setDeleteConfirm(null);
    } catch {
      // Failed silently
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString() + " Ar";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-700";
      case "reserved": return "bg-amber-100 text-amber-700";
      case "sold": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getImageUrl = (images: string | string[]): string => {
    try {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch {
      if (typeof images === "string" && images.startsWith("http")) return images;
    }
    return "/images/placeholder.svg";
  };

  const totalAllProducts = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === "mg" ? "mg" : "fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{t("products")}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{pagination.total} {t("products").toLowerCase()}</p>
        </div>
      </div>

      {/* Category tabs with counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setCategoryFilter("")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !categoryFilter
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("all")} ({totalAllProducts})
        </button>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts.find((c) => c.category === cat)?.count || 0;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tc(cat as "electronics" | "vehicles" | "property" | "clothing" | "furniture" | "services" | "other")} ({count})
            </button>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={t("search")}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
        >
          <option value="">{t("status")} - {t("all")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(s as "available" | "reserved" | "sold")}
            </option>
          ))}
        </select>

        {/* Hidden filter */}
        <select
          value={hiddenFilter}
          onChange={(e) => setHiddenFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
        >
          <option value="">
            {t("visible")} / {t("hidden")}
          </option>
          <option value="false">{t("visible")}</option>
          <option value="true">{t("hidden")}</option>
        </select>
      </div>

      {/* Product cards / table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {t("noData")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left font-medium text-gray-500 px-4 py-3 w-[320px]">
                    {t("name")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">
                    {t("seller")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3 hidden md:table-cell">
                    {t("category")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">
                    {t("price")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">
                    {t("status")}
                  </th>
                  <th className="text-center font-medium text-gray-500 px-4 py-3 hidden xl:table-cell">
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </th>
                  <th className="text-center font-medium text-gray-500 px-4 py-3 hidden xl:table-cell">
                    <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </th>
                  <th className="text-center font-medium text-gray-500 px-4 py-3 hidden xl:table-cell">
                    {t("reportsCount")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">
                    {t("date")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${product.hidden ? "opacity-60" : ""}`}>
                    {/* Product: image + title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={getImageUrl(product.images)}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                          {product.hidden && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          {editingProduct === product.id ? (
                            <input
                              value={editForm.title}
                              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                              className="w-full text-sm font-medium border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          ) : (
                            <Link
                              href={`/${locale}/product/${product.id}`}
                              className="font-medium text-gray-800 hover:text-primary transition-colors line-clamp-1"
                              title={product.title}
                            >
                              {product.title}
                            </Link>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">{product.city}</p>
                        </div>
                      </div>
                    </td>

                    {/* Seller */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Link
                        href={`/${locale}/admin/users/${product.user.id}`}
                        className="text-gray-600 hover:text-primary transition-colors text-sm"
                      >
                        {product.user.name}
                      </Link>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {editingProduct === product.id ? (
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {tc(cat as "electronics" | "vehicles" | "property" | "clothing" | "furniture" | "services" | "other")}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-600 text-sm">
                          {tc(product.category as "electronics" | "vehicles" | "property" | "clothing" | "furniture" | "services" | "other")}
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                          className="w-24 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        <span className="text-gray-800 font-medium whitespace-nowrap text-sm">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {editingProduct === product.id ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {t(s as "available" | "reserved" | "sold")}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => {
                            const nextStatus = product.status === "available" ? "reserved" : product.status === "reserved" ? "sold" : "available";
                            handleStatusChange(product.id, nextStatus);
                          }}
                          disabled={actionLoading === product.id}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(product.status)}`}
                          title={locale === "mg" ? "Tsindrio hanovana ny toetry" : "Cliquez pour changer le statut"}
                        >
                          {t(product.status as "available" | "reserved" | "sold")}
                        </button>
                      )}
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-center text-gray-500 text-sm hidden xl:table-cell">{product.views}</td>

                    {/* Favorites */}
                    <td className="px-4 py-3 text-center text-gray-500 text-sm hidden xl:table-cell">{product._count.favorites}</td>

                    {/* Reports */}
                    <td className="px-4 py-3 text-center hidden xl:table-cell">
                      {product._count.reports > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {product._count.reports}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">0</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap hidden lg:table-cell">
                      {formatDate(product.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {editingProduct === product.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(product.id)}
                              disabled={actionLoading === product.id}
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                              title={locale === "mg" ? "Tehirizo" : "Enregistrer"}
                            >
                              {actionLoading === product.id ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                              title={locale === "mg" ? "Ajanony" : "Annuler"}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title={locale === "mg" ? "Ovay" : "Modifier"}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            {/* Toggle hide/show */}
                            <button
                              onClick={() => handleToggleHide(product.id, product.hidden)}
                              disabled={actionLoading === product.id}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                product.hidden
                                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                                  : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              }`}
                              title={product.hidden ? t("show") : t("hide")}
                            >
                              {product.hidden ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              )}
                            </button>

                            {/* Delete (admin only) */}
                            {userRole === "admin" && (
                              <>
                                {deleteConfirm === product.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDelete(product.id)}
                                      disabled={actionLoading === product.id}
                                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                      {actionLoading === product.id ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(product.id)}
                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                    title={t("deleteProduct")}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              {pagination.total} {t("products").toLowerCase()}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("previous")}
              </button>
              <span className="text-sm text-gray-600">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
