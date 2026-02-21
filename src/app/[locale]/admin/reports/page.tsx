"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface ReportItem {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  product: { id: string; title: string; hidden: boolean };
  reporter: { id: string; name: string; email: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_TABS = ["all", "pending", "reviewed", "resolved"] as const;

export default function AdminReportsPage() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hideProductOnResolve, setHideProductOnResolve] = useState<Record<string, boolean>>({});

  const prevFilterRef = useRef(statusFilter);

  const fetchReports = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });
        if (statusFilter && statusFilter !== "all") {
          params.set("status", statusFilter);
        }

        const res = await fetch(`/api/admin/reports?${params}`);
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data.reports);
        setPagination(data.pagination);
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    const filterChanged = prevFilterRef.current !== statusFilter;
    prevFilterRef.current = statusFilter;

    if (filterChanged && pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    fetchReports(pagination.page);
  }, [pagination.page, fetchReports, statusFilter]);

  const handleUpdateStatus = async (reportId: string, newStatus: string, hideProduct?: boolean) => {
    setActionLoading(reportId);
    try {
      const body: { status: string; hideProduct?: boolean } = { status: newStatus };
      if (hideProduct) {
        body.hideProduct = true;
      }

      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update report");
      const updatedReport = await res.json();

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status: updatedReport.status,
                product: {
                  ...r.product,
                  hidden: hideProduct ? true : r.product.hidden,
                },
              }
            : r
        )
      );
      // Clear the hide product checkbox
      setHideProductOnResolve((prev) => {
        const next = { ...prev };
        delete next[reportId];
        return next;
      });
    } catch {
      // Failed silently
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "mg" ? "mg" : "fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "reviewed":
        return "bg-blue-100 text-blue-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-800">{t("reports")}</h1>

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit max-w-full overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              statusFilter === tab
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "all"
              ? t("all")
              : t(tab as "pending" | "reviewed" | "resolved")}
          </button>
        ))}
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
                <div className="h-4 w-28 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {t("noData")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("reportedProduct")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3 hidden lg:table-cell">
                    {t("reporter")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3 hidden md:table-cell">
                    {t("reportReason")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3 hidden xl:table-cell">
                    {t("description")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("status")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3 hidden lg:table-cell">
                    {t("date")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-medium text-gray-800 truncate block max-w-[180px]"
                          title={report.product.title}
                        >
                          {report.product.title}
                        </span>
                        {report.product.hidden && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-600 shrink-0">
                            {t("hidden")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                      {report.reporter.name}
                    </td>
                    <td className="px-5 py-3 text-gray-600 capitalize hidden md:table-cell">
                      {report.reason}
                    </td>
                    <td className="px-5 py-3 hidden xl:table-cell">
                      <span
                        className="text-gray-500 truncate block max-w-[200px]"
                        title={report.description || ""}
                      >
                        {report.description || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(report.status)}`}
                      >
                        {t(report.status as "pending" | "reviewed" | "resolved")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap hidden lg:table-cell">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Mark as reviewed */}
                          {report.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(report.id, "reviewed")}
                              disabled={actionLoading === report.id}
                              className="px-2.5 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === report.id ? (
                                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                t("markReviewed")
                              )}
                            </button>
                          )}

                          {/* Mark as resolved */}
                          {(report.status === "pending" || report.status === "reviewed") && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  report.id,
                                  "resolved",
                                  hideProductOnResolve[report.id]
                                )
                              }
                              disabled={actionLoading === report.id}
                              className="px-2.5 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === report.id ? (
                                <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                t("markResolved")
                              )}
                            </button>
                          )}
                        </div>

                        {/* Hide product checkbox (only when resolving is available) */}
                        {(report.status === "pending" || report.status === "reviewed") &&
                          !report.product.hidden && (
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hideProductOnResolve[report.id] || false}
                                onChange={(e) =>
                                  setHideProductOnResolve((prev) => ({
                                    ...prev,
                                    [report.id]: e.target.checked,
                                  }))
                                }
                                className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary/30"
                              />
                              <span className="text-[11px] text-gray-500">
                                {t("hideProduct")}
                              </span>
                            </label>
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
              {pagination.total} {t("reports").toLowerCase()}
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
