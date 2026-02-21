"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface AdminSidebarProps {
  userRole: string;
  locale: string;
}

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ProductsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

export default function AdminSidebar({ userRole, locale }: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("admin");

  const basePath = `/${locale}/admin`;

  const navItems = [
    {
      href: basePath,
      label: t("dashboard"),
      icon: <DashboardIcon />,
      exact: true,
      show: true,
    },
    {
      href: `${basePath}/users`,
      label: t("users"),
      icon: <UsersIcon />,
      exact: false,
      show: userRole === "admin" || userRole === "moderator",
    },
    {
      href: `${basePath}/products`,
      label: t("products"),
      icon: <ProductsIcon />,
      exact: false,
      show: true,
    },
    {
      href: `${basePath}/reports`,
      label: t("reports"),
      icon: <ReportsIcon />,
      exact: false,
      show: true,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col h-[calc(100vh-57px)] sticky top-[57px] bg-white border-r border-gray-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{t("title")}</h2>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{t(userRole as "user" | "moderator" | "administrator")}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("backToHome")}
          </Link>
        </div>
      </aside>

      {/* Mobile horizontal nav bar */}
      <nav className="lg:hidden bg-white border-b border-gray-200 sticky top-[57px] z-40">
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    active
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
        </div>
      </nav>
    </>
  );
}
