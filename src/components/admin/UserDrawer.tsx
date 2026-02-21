"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface UserDrawerProps {
  userId: string | null;
  locale: string;
  onClose: () => void;
}

interface UserDetail {
  user: {
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
  };
  products: {
    id: string;
    title: string;
    price: number;
    status: string;
    hidden: boolean;
    category: string;
    createdAt: string;
  }[];
  reviewsReceived: {
    id: string;
    rating: number;
    content: string | null;
    createdAt: string;
    reviewer: { id: string; name: string };
  }[];
}

export default function UserDrawer({ userId, locale, onClose }: UserDrawerProps) {
  const t = useTranslations("admin");
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}/detail`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [userId]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (userId) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [userId, onClose]);

  const isOpen = !!userId;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + " Ar";
  };

  const roleBadge = (role: string) => {
    const styles =
      role === "admin"
        ? "bg-red-100 text-red-700"
        : role === "moderator"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700";
    const label = role === "admin" ? t("administrator") : t(role as "user" | "moderator");
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
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
        : "bg-gray-100 text-gray-700";
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${styles}`}>
        {t(status as "available" | "reserved" | "sold")}
      </span>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">{t("userDetail")}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-57px)]">
          {loading ? (
            <div className="p-5 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-48 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </div>
          ) : data ? (
            <div className="p-5 space-y-5">
              {/* Profile section */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                  {data.user.image ? (
                    <img src={data.user.image} alt="" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    data.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800 truncate">{data.user.name}</h4>
                    {roleBadge(data.user.role)}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{data.user.email}</p>
                  {data.user.phone && (
                    <p className="text-sm text-gray-400">{data.user.phone}</p>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-gray-400">{t("city")}</p>
                  <p className="text-sm font-medium text-gray-700">{data.user.city}{data.user.district ? `, ${data.user.district}` : ""}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-gray-400">{t("joinedAt")}</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(data.user.createdAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-gray-400">{t("mannerTemp")}</p>
                  <p className="text-sm font-medium text-gray-700">{data.user.mannerTemp}°C</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-gray-400">{t("productsCount")}</p>
                  <p className="text-sm font-medium text-gray-700">{data.user._count.products}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-gray-400">{t("reviewsReceived")}</p>
                  <p className="text-sm font-medium text-gray-700">{data.user._count.reviewsReceived}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-gray-400">{t("conversations")}</p>
                  <p className="text-sm font-medium text-gray-700">{data.user._count.buyerConversations + data.user._count.sellerConversations}</p>
                </div>
              </div>

              {/* Recent products */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">{t("recentProducts")}</h5>
                {data.products.length > 0 ? (
                  <div className="space-y-2">
                    {data.products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-700 truncate">{product.title}</p>
                          <p className="text-xs text-gray-400">{formatPrice(product.price)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {product.hidden && (
                            <span className="text-xs text-red-500 font-medium">{t("hidden")}</span>
                          )}
                          {statusBadge(product.status)}
                        </div>
                      </div>
                    ))}
                    {data.products.length > 5 && (
                      <p className="text-xs text-gray-400 text-center">+{data.products.length - 5} {t("more")}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">{t("noData")}</p>
                )}
              </div>

              {/* Recent reviews */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">{t("reviewsReceived")}</h5>
                {data.reviewsReceived.length > 0 ? (
                  <div className="space-y-2">
                    {data.reviewsReceived.slice(0, 3).map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{review.reviewer.name}</span>
                          <span className="text-xs text-amber-500">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </span>
                        </div>
                        {review.content && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{review.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">{t("noData")}</p>
                )}
              </div>

              {/* View full detail button */}
              <Link
                href={`/${locale}/admin/users/${data.user.id}`}
                className="block w-full text-center py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
              >
                {t("viewFullDetail")}
              </Link>
            </div>
          ) : (
            <div className="p-5 text-center text-gray-400 text-sm">
              {t("noData")}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
