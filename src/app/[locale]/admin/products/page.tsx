"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface ProductItem {
  id: string;
  title: string;
  price: number;
  category: string;
  status: string;
  hidden: boolean;
  createdAt: string;
  user: { id: string; name: string };
  _count: { reports: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hiddenFilter, setHiddenFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

        const res = await fetch(`/api/admin/products?${params}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.products);
        setPagination(data.pagination);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [categoryFilter, statusFilter, hiddenFilter]
  );

  useEffect(() => {
    fetchProducts(pagination.page);
  }, [pagination.page, fetchProducts]);

  // Reset page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [categoryFilter, statusFilter, hiddenFilter]);

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

  const formatPrice = (price: number) => {
    return price.toLocaleString() + " Ar";
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "reserved":
        return "bg-amber-100 text-amber-700";
      case "sold":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-800">{t("products")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="">{t("category")} - All</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="">{t("status")} - All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        {/* Hidden filter */}
        <select
          value={hiddenFilter}
          onChange={(e) => setHiddenFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="">
            {t("visible")} / {t("hidden")}
          </option>
          <option value="false">{t("visible")}</option>
          <option value="true">{t("hidden")}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 flex-1 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
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
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("name")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("seller")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("category")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("price")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("status")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("hidden")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("reportsCount")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span
                        className="font-medium text-gray-800 truncate block max-w-[200px]"
                        title={product.title}
                      >
                        {product.title}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {product.user.name}
                    </td>
                    <td className="px-5 py-3">
                      <span className="capitalize text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-800 font-medium whitespace-nowrap">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(product.status)}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {product.hidden ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {t("hidden")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {t("visible")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {product._count.reports > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {product._count.reports}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {/* Toggle hide/show */}
                        <button
                          onClick={() => handleToggleHide(product.id, product.hidden)}
                          disabled={actionLoading === product.id}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                            product.hidden
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                          title={product.hidden ? t("show") : t("hide")}
                        >
                          {product.hidden ? t("show") : t("hide")}
                        </button>

                        {/* Delete (admin only) */}
                        {userRole === "admin" && (
                          <>
                            {deleteConfirm === product.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  disabled={actionLoading === product.id}
                                  className="px-2.5 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === product.id ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    "OK"
                                  )}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2.5 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(product.id)}
                                className="px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                {t("deleteProduct")}
                              </button>
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
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

      {/* Delete confirmation overlay */}
      {deleteConfirm && (
        <div className="sr-only" aria-live="polite">
          {t("deleteConfirm")}
        </div>
      )}
    </div>
  );
}
