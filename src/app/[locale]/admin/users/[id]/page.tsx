"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Tab = "overview" | "products" | "reviews" | "conversations" | "reports" | "manage";

const CATEGORIES = ["vehicles", "property", "electronics", "services", "furniture", "clothing", "other"];
const STATUSES = ["available", "reserved", "sold"];

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  district: string | null;
  image: string | null;
  role: string;
  mannerTemp: number;
  createdAt: string;
  _count: {
    products: number;
    reviewsReceived: number;
    reviewsGiven: number;
    reports: number;
    favorites: number;
    buyerConversations: number;
    sellerConversations: number;
  };
}

interface ProductItem {
  id: string;
  title: string;
  price: number;
  status: string;
  hidden: boolean;
  category: string;
  views: number;
  createdAt: string;
  _count: { favorites: number; reports: number };
}

interface ReviewItem {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  reviewer: { id: string; name: string; image: string | null };
}

interface ReportItem {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter?: { id: string; name: string };
  product: { id: string; title: string };
}

interface ConversationItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  product: { id: string; title: string };
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  _count: { messages: number };
}

interface DetailData {
  user: UserData;
  products: ProductItem[];
  reviewsReceived: ReviewItem[];
  reportsReceived: ReportItem[];
  reportsMade: ReportItem[];
  conversations: ConversationItem[];
}

export default function AdminUserDetailPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("categories");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const segments = pathname.split("/");
  const locale = segments[1] || "fr";
  const userId = segments[segments.length - 1];

  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [changingRole, setChangingRole] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productActionLoading, setProductActionLoading] = useState<string | null>(null);
  const [productDeleteConfirm, setProductDeleteConfirm] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/detail`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === "mg" ? "mg" : "fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatPrice = (price: number) => price.toLocaleString() + " Ar";

  const handleRoleChange = async (newRole: string) => {
    setChangingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed");
      await fetchData();
    } catch {
      // silently fail
    } finally {
      setChangingRole(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm(t("deleteUserConfirm"))) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.push(`/${locale}/admin/users`);
    } catch {
      // silently fail
    }
  };

  const tabs: { key: Tab; label: string; count?: number }[] = data
    ? [
        { key: "overview", label: t("overview") },
        { key: "products", label: t("products"), count: data.user._count.products },
        { key: "reviews", label: t("reviews"), count: data.user._count.reviewsReceived },
        { key: "conversations", label: t("conversations"), count: data.user._count.buyerConversations + data.user._count.sellerConversations },
        { key: "reports", label: t("reports"), count: data.reportsReceived.length + data.reportsMade.length },
        { key: "manage", label: t("manage") },
      ]
    : [];

  const roleBadge = (role: string) => {
    const styles =
      role === "admin"
        ? "bg-red-100 text-red-700"
        : role === "moderator"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700";
    const label = role === "admin" ? t("administrator") : t(role as "user" | "moderator");
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles}`}>
        {label}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const styles =
      status === "available"
        ? "bg-green-100 text-green-700"
        : status === "reserved"
        ? "bg-amber-100 text-amber-700"
        : status === "sold"
        ? "bg-gray-100 text-gray-700"
        : status === "pending"
        ? "bg-amber-100 text-amber-700"
        : status === "reviewed"
        ? "bg-blue-100 text-blue-700"
        : "bg-green-100 text-green-700";
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
        {t(status as "available" | "reserved" | "sold" | "pending" | "reviewed" | "resolved")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-56 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-10 bg-gray-100 rounded-lg" />
        <div className="h-64 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500">{t("noData")}</p>
          <Link href={`/${locale}/admin/users`} className="text-primary text-sm mt-2 inline-block">
            ← {t("backToUsers")}
          </Link>
        </div>
      </div>
    );
  }

  const { user } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Back link + Header */}
      <div>
        <Link
          href={`/${locale}/admin/users`}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("backToUsers")}
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
            {user.image ? (
              <img src={user.image} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
              {roleBadge(user.role)}
            </div>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex gap-0 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400">{t("city")}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{user.city}{user.district ? `, ${user.district}` : ""}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400">{t("joinedAt")}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{formatDate(user.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400">{t("mannerTemp")}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{user.mannerTemp}°C</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400">{t("productsCount")}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{user._count.products}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400">{t("reviewsReceived")}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{user._count.reviewsReceived}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400">{t("reviewsGiven")}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{user._count.reviewsGiven}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400">{t("favorites")}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{user._count.favorites}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400">{t("conversations")}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{user._count.buyerConversations + user._count.sellerConversations}</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (() => {
          const filteredProducts = productCategoryFilter
            ? data.products.filter((p) => p.category === productCategoryFilter)
            : data.products;

          const categoryCounts = data.products.reduce<Record<string, number>>((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
          }, {});

          const handleProductToggleHide = async (productId: string, currentHidden: boolean) => {
            setProductActionLoading(productId);
            try {
              const res = await fetch(`/api/admin/products/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hidden: !currentHidden }),
              });
              if (!res.ok) throw new Error("Failed");
              setData((prev) => prev ? {
                ...prev,
                products: prev.products.map((p) =>
                  p.id === productId ? { ...p, hidden: !currentHidden } : p
                ),
              } : prev);
            } catch { /* */ } finally { setProductActionLoading(null); }
          };

          const handleProductStatusChange = async (productId: string, newStatus: string) => {
            setProductActionLoading(productId);
            try {
              const res = await fetch(`/api/admin/products/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
              });
              if (!res.ok) throw new Error("Failed");
              setData((prev) => prev ? {
                ...prev,
                products: prev.products.map((p) =>
                  p.id === productId ? { ...p, status: newStatus } : p
                ),
              } : prev);
            } catch { /* */ } finally { setProductActionLoading(null); }
          };

          const handleProductDelete = async (productId: string) => {
            setProductActionLoading(productId);
            try {
              const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
              if (!res.ok) throw new Error("Failed");
              setData((prev) => prev ? {
                ...prev,
                products: prev.products.filter((p) => p.id !== productId),
                user: { ...prev.user, _count: { ...prev.user._count, products: prev.user._count.products - 1 } },
              } : prev);
              setProductDeleteConfirm(null);
            } catch { /* */ } finally { setProductActionLoading(null); }
          };

          return (
            <div>
              {/* Category filter pills */}
              {Object.keys(categoryCounts).length > 1 && (
                <div className="flex items-center gap-2 px-5 pt-4 pb-2 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setProductCategoryFilter("")}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      !productCategoryFilter ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t("all")} ({data.products.length})
                  </button>
                  {CATEGORIES.filter((cat) => categoryCounts[cat]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setProductCategoryFilter(cat === productCategoryFilter ? "" : cat)}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        productCategoryFilter === cat ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tc(cat as "electronics" | "vehicles" | "property" | "clothing" | "furniture" | "services" | "other")} ({categoryCounts[cat]})
                    </button>
                  ))}
                </div>
              )}

              {filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left font-medium text-gray-500 px-5 py-3">{t("name")}</th>
                        <th className="text-left font-medium text-gray-500 px-5 py-3">{t("category")}</th>
                        <th className="text-left font-medium text-gray-500 px-5 py-3">{t("price")}</th>
                        <th className="text-left font-medium text-gray-500 px-5 py-3">{t("status")}</th>
                        <th className="text-left font-medium text-gray-500 px-5 py-3">{t("views")}</th>
                        <th className="text-left font-medium text-gray-500 px-5 py-3">{t("date")}</th>
                        <th className="text-left font-medium text-gray-500 px-5 py-3">{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${product.hidden ? "opacity-60" : ""}`}>
                          <td className="px-5 py-3">
                            <Link href={`/${locale}/product/${product.id}`} className="font-medium text-gray-800 hover:text-primary transition-colors">
                              {product.title}
                            </Link>
                            {product.hidden && (
                              <span className="ml-2 text-xs text-red-500 font-medium">{t("hidden")}</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            {tc(product.category as "electronics" | "vehicles" | "property" | "clothing" | "furniture" | "services" | "other")}
                          </td>
                          <td className="px-5 py-3 text-gray-600">{formatPrice(product.price)}</td>
                          <td className="px-5 py-3">
                            <button
                              onClick={() => {
                                const next = product.status === "available" ? "reserved" : product.status === "reserved" ? "sold" : "available";
                                handleProductStatusChange(product.id, next);
                              }}
                              disabled={productActionLoading === product.id}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${
                                product.status === "available" ? "bg-green-100 text-green-700" :
                                product.status === "reserved" ? "bg-amber-100 text-amber-700" :
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {t(product.status as "available" | "reserved" | "sold")}
                            </button>
                          </td>
                          <td className="px-5 py-3 text-gray-500">{product.views}</td>
                          <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(product.createdAt)}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              {/* Toggle hide/show */}
                              <button
                                onClick={() => handleProductToggleHide(product.id, product.hidden)}
                                disabled={productActionLoading === product.id}
                                className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
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
                                  {productDeleteConfirm === product.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleProductDelete(product.id)}
                                        disabled={productActionLoading === product.id}
                                        className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                                      >
                                        {productActionLoading === product.id ? (
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => setProductDeleteConfirm(null)}
                                        className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setProductDeleteConfirm(product.id)}
                                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                      title={t("deleteProduct")}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
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
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">{t("noData")}</div>
              )}
            </div>
          );
        })()}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="p-5">
            {data.reviewsReceived.length > 0 ? (
              <div className="space-y-3">
                {data.reviewsReceived.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{review.reviewer.name}</span>
                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                      <span className="text-amber-500 text-sm">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.content && (
                      <p className="text-sm text-gray-600 mt-1">{review.content}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-4">{t("noData")}</div>
            )}
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === "conversations" && (
          <div className="overflow-x-auto">
            {data.conversations.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left font-medium text-gray-500 px-5 py-3">{t("reportedProduct")}</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-3">{t("buyer")}</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-3">{t("seller")}</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-3">{t("messagesCount")}</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-3">{t("date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.conversations.map((conv) => (
                    <tr key={conv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800 truncate max-w-[200px]">
                        {conv.product.title}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        <span className={conv.buyer.id === userId ? "font-semibold text-primary" : ""}>
                          {conv.buyer.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        <span className={conv.seller.id === userId ? "font-semibold text-primary" : ""}>
                          {conv.seller.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{conv._count.messages}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(conv.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">{t("noData")}</div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="p-5 space-y-5">
            {/* Reports received */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t("reportsReceived")}</h4>
              {data.reportsReceived.length > 0 ? (
                <div className="space-y-2">
                  {data.reportsReceived.map((report) => (
                    <div key={report.id} className="bg-gray-50 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">{report.product.title}</span>
                          <span className="text-xs text-gray-400 ml-2">{t("reporter")}: {report.reporter?.name}</span>
                        </div>
                        {statusBadge(report.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{report.reason}</p>
                      {report.description && <p className="text-xs text-gray-400 mt-0.5">{report.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t("noData")}</p>
              )}
            </div>

            {/* Reports made */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t("reportsMade")}</h4>
              {data.reportsMade.length > 0 ? (
                <div className="space-y-2">
                  {data.reportsMade.map((report) => (
                    <div key={report.id} className="bg-gray-50 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{report.product.title}</span>
                        {statusBadge(report.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{report.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t("noData")}</p>
              )}
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && (
          <div className="p-5 space-y-6">
            {/* Role change */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{t("changeRole")}</h4>
              <div className="flex items-center gap-3">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={changingRole || user.id === session?.user?.id}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 bg-white"
                >
                  <option value="user">{t("user")}</option>
                  <option value="moderator">{t("moderator")}</option>
                  <option value="admin">{t("administrator")}</option>
                </select>
                {changingRole && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              {user.id === session?.user?.id && (
                <p className="text-xs text-amber-600 mt-2">{t("cannotChangeOwnRole")}</p>
              )}
            </div>

            {/* Delete user */}
            {user.id !== session?.user?.id && user.role !== "admin" && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-red-600 mb-2">{t("dangerZone")}</h4>
                <p className="text-xs text-gray-500 mb-3">{t("deleteUserWarning")}</p>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t("deleteUser")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
