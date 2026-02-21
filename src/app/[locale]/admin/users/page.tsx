"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UserDrawer from "@/components/admin/UserDrawer";

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  role: string;
  createdAt: string;
  _count: { products: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(pagination.page, search);
  }, [search, pagination.page, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearch(searchInput);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      const updatedUser = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: updatedUser.role } : u
        )
      );
    } catch {
      // Role change failed silently
    } finally {
      setChangingRole(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch {
      // Delete failed
    } finally {
      setDeletingUser(null);
      setConfirmDelete(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "mg" ? "mg" : "fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isAdmin = userRole === "admin";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">{t("users")}</h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("search")}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white w-full sm:w-64"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            {t("search")}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 flex-1 bg-gray-100 rounded" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
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
                  <th className="text-left font-medium text-gray-500 px-5 py-3 hidden md:table-cell">
                    {t("email")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3 hidden lg:table-cell">
                    {t("city")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("role")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3 hidden lg:table-cell">
                    {t("productsCount")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3 hidden lg:table-cell">
                    {t("joinedAt")}
                  </th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setDrawerUserId(user.id)}
                        className="font-medium text-gray-800 hover:text-primary transition-colors text-left"
                      >
                        {user.name}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-gray-600 hidden md:table-cell">
                      {user.email}
                    </td>
                    <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                      {user.city}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : user.role === "moderator"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t(user.role === "admin" ? "administrator" : user.role as "user" | "moderator")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                      {user._count.products}
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap hidden lg:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      {isAdmin ? (
                        <div className="flex items-center gap-2">
                          <label className="sr-only" htmlFor={`role-${user.id}`}>
                            {t("changeRole")}
                          </label>
                          <select
                            id={`role-${user.id}`}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={changingRole === user.id || user.id === session?.user?.id}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                          >
                            <option value="user">{t("user")}</option>
                            <option value="moderator">{t("moderator")}</option>
                            <option value="admin">{t("administrator")}</option>
                          </select>
                          {changingRole === user.id && (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          )}
                          {/* Delete button - not for self or other admins */}
                          {user.id !== session?.user?.id && user.role !== "admin" && (
                            confirmDelete === user.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={deletingUser === user.id}
                                  className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                  {deletingUser === user.id ? "..." : "OK"}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(user.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title={t("deleteUser")}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
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
              {pagination.total} {t("users").toLowerCase()}
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

      {/* User Drawer */}
      <UserDrawer
        userId={drawerUserId}
        locale={locale}
        onClose={() => setDrawerUserId(null)}
      />
    </div>
  );
}
