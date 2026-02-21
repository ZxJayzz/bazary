"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";

interface StatsData {
  totalUsers: number;
  totalProducts: number;
  newUsersToday: number;
  pendingReports: number;
  categoryStats?: { category: string; count: number }[];
  recentReports?: {
    id: string;
    reason: string;
    status: string;
    createdAt: string;
    product: { id: string; title: string };
    reporter: { id: string; name: string; email: string };
  }[];
  recentUsers?: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }[];
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded mt-2" />
        </div>
        <div className="w-11 h-11 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-pulse">
      <div className="p-4 border-b border-gray-100">
        <div className="h-5 w-40 bg-gray-200 rounded" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 flex-1 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("categories");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";

  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SkeletonTable />
          <SkeletonTable />
        </div>
        <SkeletonTable />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-gray-500">{error || t("noData")}</p>
        </div>
      </div>
    );
  }

  const maxCategory = stats.categoryStats
    ? Math.max(...stats.categoryStats.map((c) => c.count), 1)
    : 1;

  return (
    <div className="p-6 space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title={t("totalUsers")}
          value={stats.totalUsers.toLocaleString()}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="bg-blue-50 text-blue-600"
          href={`/${locale}/admin/users`}
        />
        <StatsCard
          title={t("totalProducts")}
          value={stats.totalProducts.toLocaleString()}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          color="bg-green-50 text-green-600"
          href={`/${locale}/admin/products`}
        />
        <StatsCard
          title={t("newToday")}
          value={stats.newUsersToday}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
          color="bg-purple-50 text-purple-600"
          href={`/${locale}/admin/users`}
        />
        <StatsCard
          title={t("pendingReports")}
          value={stats.pendingReports}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          color="bg-amber-50 text-amber-600"
          href={`/${locale}/admin/reports`}
        />
      </div>

      {/* Recent reports and recent users */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent reports */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">{t("recentReports")}</h3>
            <Link
              href={`/${locale}/admin/reports`}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("viewAll")} →
            </Link>
          </div>
          {stats.recentReports && stats.recentReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-5 py-3">
                      {t("reportedProduct")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-5 py-3">
                      {t("reporter")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-5 py-3">
                      {t("status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800 truncate max-w-[200px]">
                          {report.product.title}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {report.reporter.name}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            report.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : report.status === "reviewed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {t(report.status as "pending" | "reviewed" | "resolved")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">
              {t("noData")}
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">{t("recentUsers")}</h3>
            <Link
              href={`/${locale}/admin/users`}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("viewAll")} →
            </Link>
          </div>
          {stats.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-5 py-3">
                      {t("name")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-5 py-3">
                      {t("email")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-5 py-3">
                      {t("role")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/${locale}/admin/users/${user.id}`}
                          className="font-medium text-gray-800 hover:text-primary transition-colors"
                        >
                          {user.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-5 py-3">
                        <span className="capitalize text-gray-600">
                          {t(user.role as "user" | "moderator" | "administrator")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">
              {t("noData")}
            </div>
          )}
        </div>
      </div>

      {/* Category distribution */}
      {stats.categoryStats && stats.categoryStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">{t("categoryDistribution")}</h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {stats.categoryStats
              .sort((a, b) => b.count - a.count)
              .map((cat) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28 shrink-0 truncate capitalize">
                    {tc(cat.category as "electronics" | "vehicles" | "property" | "clothing" | "furniture" | "services" | "other")}
                  </span>
                  <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${Math.max((cat.count / maxCategory) * 100, 8)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
