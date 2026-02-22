"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Notification } from "@/types";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const NAV_LINKS = [
  { key: "buySell", href: "/buy-sell", labelFr: "Acheter & Vendre", labelMg: "Hividy & Hivarotra" },
  { key: "vehicles", href: "/buy-sell?category=vehicles", labelFr: "Véhicules", labelMg: "Fiara" },
  { key: "property", href: "/buy-sell?category=property", labelFr: "Immobilier", labelMg: "Trano" },
  { key: "electronics", href: "/buy-sell?category=electronics", labelFr: "Électronique", labelMg: "Elektronika" },
  { key: "services", href: "/buy-sell?category=services", labelFr: "Services", labelMg: "Serivisy" },
];

const MOBILE_EXTRA_LINKS = [
  { key: "furniture", href: "/buy-sell?category=furniture", labelFr: "Meubles", labelMg: "Fanaka" },
  { key: "clothing", href: "/buy-sell?category=clothing", labelFr: "Vêtements", labelMg: "Akanjo" },
];

function getNotificationIcon(type: string) {
  switch (type) {
    case "message":
      return (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "favorite":
      return (
        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      );
    case "product_sold":
    case "product_reserved":
      return (
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
  }
}

export default function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Notification state
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Poll unread message count
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
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Poll unread notification count
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnreadNotif = () => {
      fetch("/api/notifications/unread")
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((data) => { if (data) setUnreadNotifCount(data.count || 0); })
        .catch(() => {});
    };

    fetchUnreadNotif();
    const interval = setInterval(fetchUnreadNotif, 5000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };

    if (notifDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifDropdownOpen]);

  // Escape key handler for dropdowns and mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotifDropdownOpen(false);
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Fetch notifications when dropdown opens
  const openNotifDropdown = useCallback(() => {
    setNotifDropdownOpen((prev) => {
      if (!prev) {
        setNotifLoading(true);
        fetch("/api/notifications?limit=10")
          .then((res) => {
            if (!res.ok) return null;
            return res.json();
          })
          .then((data) => {
            if (data) setNotifications(Array.isArray(data) ? data : data.notifications || []);
            setNotifLoading(false);
          })
          .catch(() => setNotifLoading(false));
      }
      return !prev;
    });
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifCount(0);
    } catch {
      showToast("Erreur", "error");
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadNotifCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silently fail
      }
    }
    setNotifDropdownOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const isActive = (href: string) => {
    const fullHref = `/${locale}${href}`;
    if (href === "/buy-sell") {
      return pathname === `/${locale}/buy-sell` && !searchParams.has("category");
    }
    const search = searchParams.toString();
    const currentUrl = search ? `${pathname}?${search}` : pathname;
    return currentUrl === fullHref;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/buy-sell?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm shadow-gray-100/50" role="banner">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main header row */}
        <div className="flex items-center h-14 gap-6">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/logo.svg"
              alt="Bazary"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span className="text-lg font-bold text-gray-800 hidden sm:block">
              {t("common.siteName")}
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 min-w-0 overflow-hidden" role="navigation" aria-label={locale === "mg" ? "Navigasiona lehibe" : "Navigation principale"}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={`/${locale}${link.href}`}
                className={`px-2.5 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                  isActive(link.href)
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {locale === "mg" ? link.labelMg : link.labelFr}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Search toggle / inline search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("common.search")}
                    autoFocus
                    className="w-48 md:w-64 pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title={locale === "mg" ? "Tadiavo" : "Rechercher"}
                aria-label={locale === "mg" ? "Tadiavo" : "Rechercher"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Favorites icon - only for logged-in users */}
            {session?.user && (
              <Link
                href={`/${locale}/favorites`}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                title={locale === "mg" ? "Tiana" : "Favoris"}
                aria-label={locale === "mg" ? "Tiana" : "Favoris"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>
            )}

            {/* Chat icon - only for logged-in users */}
            {session?.user && (
              <Link
                href={`/${locale}/chat`}
                className="relative p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                title={locale === "mg" ? "Resaka" : "Messages"}
                aria-label={locale === "mg" ? "Resaka" : "Messages"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification bell - only for logged-in users */}
            {session?.user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotifDropdown}
                  className="relative p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  title={locale === "mg" ? "Fampandrenesana" : "Notifications"}
                  aria-label={locale === "mg" ? "Fampandrenesana" : "Notifications"}
                  aria-expanded={notifDropdownOpen}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-[-4rem] sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden animate-scale-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {t("notifications.title")}
                      </h3>
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary hover:text-primary-hover font-medium"
                        >
                          {t("notifications.markAllRead")}
                        </button>
                      )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifLoading ? (
                        <div className="px-4 py-8 text-center">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <p className="text-sm text-gray-500">{t("notifications.noNotifications")}</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                              !notif.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {timeAgo(notif.createdAt, locale)}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="shrink-0 mt-2">
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100">
                      <Link
                        href={`/${locale}/notifications`}
                        onClick={() => setNotifDropdownOpen(false)}
                        className="block text-center py-2.5 text-sm font-medium text-primary hover:bg-gray-50 transition-colors"
                      >
                        {t("notifications.seeAll")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin link - only for admin/moderator */}
            {session?.user && ((session.user as { role?: string })?.role === "admin" || (session.user as { role?: string })?.role === "moderator") && (
              <Link
                href={`/${locale}/admin`}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors px-2"
                title="Admin"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </Link>
            )}

            <LanguageSwitcher />

            {session?.user ? (
              <Link
                href={`/${locale}/profile`}
                className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-primary transition-colors px-2"
              >
                {t("common.myProfile")}
              </Link>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-primary transition-colors px-2"
              >
                {t("common.login")}
              </Link>
            )}

            <Link
              href={`/${locale}/product/new`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">{t("common.sell")}</span>
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={locale === "mg" ? "Menu" : "Menu"}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white animate-slide-down">
          <div className="px-4 py-2 space-y-0.5">
            {[...NAV_LINKS, ...MOBILE_EXTRA_LINKS].map((link) => (
              <Link
                key={link.key}
                href={`/${locale}${link.href}`}
                className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-orange-50"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {locale === "mg" ? link.labelMg : link.labelFr}
              </Link>
            ))}
            <div className="border-t border-gray-100 my-1" />
            {session?.user && (
              <>
                <Link
                  href={`/${locale}/favorites`}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {locale === "mg" ? "Tiana" : "Favoris"}
                </Link>
                <Link
                  href={`/${locale}/chat`}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {locale === "mg" ? "Resaka" : "Messages"}
                  {unreadCount > 0 && (
                    <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/${locale}/notifications`}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {locale === "mg" ? "Fampandrenesana" : "Notifications"}
                  {unreadNotifCount > 0 && (
                    <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </Link>
                <div className="border-t border-gray-100 my-1" />
                {/* Admin link in mobile menu */}
                {((session.user as { role?: string })?.role === "admin" || (session.user as { role?: string })?.role === "moderator") && (
                  <Link
                    href={`/${locale}/admin`}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </Link>
                )}
                <div className="border-t border-gray-100 my-1" />
              </>
            )}
            <Link
              href={session?.user ? `/${locale}/profile` : `/${locale}/auth/login`}
              className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {session?.user ? t("common.myProfile") : t("common.login")}
            </Link>
            {session?.user && (
              <button
                onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: `/${locale}` }); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                {t("common.logout")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
