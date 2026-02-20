"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnread = () => {
      fetch("/api/conversations/unread")
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((data) => { if (data) setUnreadCount(data.count || 0); })
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Determine active tab from pathname
  const isHome =
    pathname === `/${locale}` || pathname === `/${locale}/`;
  const isCategories =
    pathname.includes("/buy-sell") || pathname.includes("showCategories");
  const isSell = pathname.includes("/product/new");
  const isChat = pathname.includes("/chat");
  const isProfile = pathname.includes("/profile");

  const tabs = [
    {
      key: "home",
      label: locale === "mg" ? "Fandraisana" : "Accueil",
      href: `/${locale}`,
      active: isHome && !isCategories,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        </svg>
      ),
    },
    {
      key: "categories",
      label: locale === "mg" ? "Sokajy" : "Categories",
      href: `/${locale}/buy-sell`,
      active: isCategories,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      ),
    },
    {
      key: "sell",
      label: locale === "mg" ? "Mivarotra" : "Vendre",
      href: `/${locale}/product/new`,
      active: isSell,
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      isCenterButton: true,
    },
    {
      key: "chat",
      label: "Chat",
      href: `/${locale}/chat`,
      active: isChat,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      badge: unreadCount,
    },
    {
      key: "profile",
      label: locale === "mg" ? "Profil" : "Mon profil",
      href: session?.user ? `/${locale}/profile` : `/${locale}/auth/login`,
      active: isProfile,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden"
      role="navigation"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          if (tab.isCenterButton) {
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className="relative flex flex-col items-center justify-center -mt-5"
                aria-label={tab.label}
              >
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg text-white active:scale-95 transition-transform">
                  {tab.icon}
                </div>
                <span className="text-[10px] font-medium text-primary mt-0.5">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1.5 transition-colors ${
                tab.active ? "text-primary" : "text-gray-400"
              }`}
              aria-label={tab.label}
              aria-current={tab.active ? "page" : undefined}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium leading-tight">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area spacer for devices with home indicator (iPhone X+) */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
