"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { CITIES, CATEGORIES } from "@/types";
import { formatPrice, getImageUrls } from "@/lib/utils";
import type { Product } from "@/types";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  district: string | null;
  image: string | null;
  createdAt: string;
}

interface KeywordAlertData {
  id: string;
  keyword: string;
  createdAt: string;
}

export default function ProfilePage() {
  const t = useTranslations();
  const tc = useTranslations("categories");
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Profile edit state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    city: "Antananarivo",
    district: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Category scroll state
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollArrows = useCallback(() => {
    const el = catScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scrollCategories = (dir: "left" | "right") => {
    const el = catScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  useEffect(() => {
    updateScrollArrows();
    window.addEventListener("resize", updateScrollArrows);
    return () => window.removeEventListener("resize", updateScrollArrows);
  }, [products, loading, updateScrollArrows]);

  // Keyword alerts state
  const [keywordAlerts, setKeywordAlerts] = useState<KeywordAlertData[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [addingKeyword, setAddingKeyword] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/login`);
    }
  }, [status, router, locale]);

  // Fetch profile data
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/profile")
        .then((res) => {
          if (!res.ok) throw new Error("Failed");
          return res.json();
        })
        .then((data) => {
          if (data.id) {
            setProfile(data);
            setEditForm({
              name: data.name || "",
              phone: data.phone || "",
              city: data.city || "Antananarivo",
              district: data.district || "",
            });
          }
        })
        .catch(() => {
          showToast("Erreur de chargement du profil", "error");
        });
    }
  }, [session]);

  // Fetch user products
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/products?userId=${session.user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed");
          return res.json();
        })
        .then((data) => {
          setProducts(data.products || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  // Fetch keyword alerts
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/keyword-alerts")
        .then((res) => {
          if (!res.ok) throw new Error("Failed");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setKeywordAlerts(data);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || newKeyword.trim().length < 2) return;
    setAddingKeyword(true);
    try {
      const res = await fetch("/api/keyword-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword.trim() }),
      });
      if (res.ok) {
        const alert = await res.json();
        setKeywordAlerts((prev) => [alert, ...prev]);
        setNewKeyword("");
        showToast(locale === "mg" ? "Teny fototra nampiana" : "Mot-cl\u00e9 ajout\u00e9", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Erreur", "error");
      }
    } catch {
      showToast("Erreur", "error");
    } finally {
      setAddingKeyword(false);
    }
  };

  const handleRemoveKeyword = async (id: string) => {
    try {
      const res = await fetch(`/api/keyword-alerts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setKeywordAlerts((prev) => prev.filter((a) => a.id !== id));
        showToast(locale === "mg" ? "Teny fototra nesorina" : "Mot-cl\u00e9 supprim\u00e9", "success");
      }
    } catch {
      showToast("Erreur", "error");
    }
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: newStatus as Product["status"] } : p))
      );
      showToast("Statut mis \u00e0 jour", "success");
    } catch {
      showToast("Erreur de changement de statut", "error");
    }
  };

  const handleDeleteRequest = (productId: string) => {
    setDeleteConfirm(productId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const productId = deleteConfirm;
    setDeleteConfirm(null);

    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast("Produit supprim\u00e9", "success");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      // Cancel: revert form to original profile data
      if (profile) {
        setEditForm({
          name: profile.name || "",
          phone: profile.phone || "",
          city: profile.city || "Antananarivo",
          district: profile.district || "",
        });
      }
      setAvatarFile(null);
      setAvatarPreview(null);
      setErrorMessage("");
    }
    setEditing(!editing);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let imageUrl: string | undefined;

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      const updateBody: Record<string, string | null> = {
        name: editForm.name,
        phone: editForm.phone || null,
        city: editForm.city,
        district: editForm.district || null,
      };

      if (imageUrl !== undefined) {
        updateBody.image = imageUrl;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        setSuccessMessage(t("profile.editSuccess"));
        showToast("Profil mis \u00e0 jour avec succ\u00e8s", "success");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(
          locale === "mg" ? "Nisy olana tamin'ny fanovana" : "Erreur lors de la modification"
        );
        showToast("Erreur lors de la sauvegarde", "error");
      }
    } catch {
      setErrorMessage(
        locale === "mg" ? "Nisy olana tamin'ny fanovana" : "Erreur lors de la modification"
      );
      showToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateEditForm = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (field === "city") {
      setEditForm((prev) => ({ ...prev, district: "" }));
    }
  };

  // Determine avatar display
  const avatarSrc = avatarPreview || profile?.image || null;

  if (status === "loading" || !session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-60 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        {/* Profile header */}
        <div className="bg-linear-to-br from-primary/5 via-white to-accent/5 px-6 pt-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="relative shrink-0 self-center sm:self-auto">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={profile?.name || ""}
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center ring-4 ring-white shadow-md">
                  <span className="text-primary font-bold text-3xl sm:text-4xl">
                    {(profile?.name || session.user?.name || "?").charAt(0)}
                  </span>
                </div>
              )}
              {editing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {!editing && (
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{profile?.name || session.user?.name}</h1>
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-500 justify-center sm:justify-start">
                    <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{session.user?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 justify-center sm:justify-start">
                      <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {profile.phone}
                    </div>
                  )}
                  {profile?.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 justify-center sm:justify-start">
                      <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.district ? `${profile.district}, ${profile.city}` : profile.city}
                    </div>
                  )}
                </div>

                {/* Buttons - mobile: below info, desktop: top-right */}
                <div className="flex items-center gap-2 mt-4 justify-center sm:hidden">
                  <button
                    onClick={handleEditToggle}
                    className="flex-1 px-4 py-2.5 text-sm border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
                  >
                    {t("profile.edit")}
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: `/${locale}` })}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t("common.logout")}
                  </button>
                </div>
              </div>
            )}

            {/* Desktop buttons */}
            {!editing && (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
                >
                  {t("profile.edit")}
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("common.logout")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        {!editing && (
          <div className="px-6 py-3.5 flex items-center gap-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-semibold text-gray-800">{products.length}</span>
              <span className="text-gray-500">{t("profile.myListings").toLowerCase()}</span>
            </div>
            {profile?.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {locale === "mg" ? "Mpikambana nanomboka ny" : "Membre depuis"}{" "}
                {new Date(profile.createdAt).toLocaleDateString(locale === "mg" ? "mg" : "fr-FR", { month: "long", year: "numeric" })}
              </div>
            )}
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="px-6 pb-6 space-y-4 pt-4 border-t border-gray-100">
            {/* Name */}
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.name")}
              </label>
              <input
                id="profile-name"
                type="text"
                value={editForm.name}
                onChange={(e) => updateEditForm("name", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.phone")}
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => updateEditForm("phone", e.target.value)}
                placeholder="+261 34 00 000 00"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {/* City & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-city" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("profile.city")}
                </label>
                <select
                  id="profile-city"
                  value={editForm.city}
                  onChange={(e) => updateEditForm("city", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {Object.keys(CITIES).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="profile-district" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("profile.district")}
                </label>
                <select
                  id="profile-district"
                  value={editForm.district}
                  onChange={(e) => updateEditForm("district", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">{t("sell.selectDistrict")}</option>
                  {CITIES[editForm.city]?.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save / Cancel buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {saving ? t("common.loading") : t("profile.save")}
              </button>
              <button
                onClick={handleEditToggle}
                disabled={saving}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t("profile.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* My listings */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{t("profile.myListings")}</h2>
        <Link
          href={`/${locale}/product/new`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("common.sell")}
        </Link>
      </div>

      {/* Category filter tabs */}
      {!loading && products.length > 0 && (() => {
        const usedCategories = [...new Set(products.map((p) => p.category))];
        if (usedCategories.length <= 1) return null;
        return (
          <div className="relative mb-4 group">
            {/* Left arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scrollCategories("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Scrollable category list */}
            <div
              ref={catScrollRef}
              onScroll={updateScrollArrows}
              onLoad={updateScrollArrows}
              className={`flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 ${canScrollLeft ? "pl-9" : ""} ${canScrollRight ? "pr-9" : ""}`}
            >
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  categoryFilter === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t("admin.all")} ({products.length})
              </button>
              {CATEGORIES.filter((cat) => usedCategories.includes(cat.name)).map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setCategoryFilter(cat.name)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                      categoryFilter === cat.name
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.icon} {tc(cat.name as "electronics" | "vehicles" | "property" | "clothing" | "furniture" | "appliances" | "sports" | "books" | "services" | "other")} ({count})
                  </button>
                );
              })}
            </div>

            {/* Right arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollCategories("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        );
      })()}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">{t("profile.noListings")}</p>
          <Link
            href={`/${locale}/product/new`}
            className="inline-flex px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
          >
            {t("sell.title")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.filter((p) => categoryFilter === "all" || p.category === categoryFilter).map((product) => {
            const images = getImageUrls(product.images);
            const firstImage = images[0] || "/images/placeholder.svg";
            return (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                <div className="flex">
                  {/* Product image */}
                  <Link
                    href={`/${locale}/product/${product.id}`}
                    className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 relative bg-gray-100 block"
                  >
                    <Image
                      src={firstImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                    {product.status !== "available" && (
                      <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                        product.status === "sold"
                          ? "bg-red-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}>
                        {t(`product.status.${product.status}`)}
                      </span>
                    )}
                  </Link>

                  {/* Product info */}
                  <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <Link
                        href={`/${locale}/product/${product.id}`}
                        className="font-medium text-gray-800 hover:text-primary transition-colors line-clamp-1 block"
                      >
                        {product.title}
                      </Link>
                      <p className="text-base font-semibold text-primary mt-0.5">
                        {formatPrice(product.price)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {product.city}{product.district ? `, ${product.district}` : ""}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusChange(product.id, e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      >
                        <option value="available">{t("product.status.available")}</option>
                        <option value="reserved">{t("product.status.reserved")}</option>
                        <option value="sold">{t("product.status.sold")}</option>
                      </select>
                      <Link
                        href={`/${locale}/product/${product.id}/edit`}
                        className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        {t("common.edit")}
                      </Link>
                      <button
                        onClick={() => handleDeleteRequest(product.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {products.filter((p) => categoryFilter === "all" || p.category === categoryFilter).length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              {locale === "mg" ? "Tsy misy filazana amin'ity sokajy ity" : "Aucune annonce dans cette catégorie"}
            </div>
          )}
        </div>
      )}

      {/* Keyword Alerts */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {locale === "mg" ? "Teny fototra arahina" : "Alertes mots-cl\u00e9s"}
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-4">
            {locale === "mg"
              ? "Hahazo fanentanana ianao rehefa misy vokatra vaovao mifanaraka amin'ireto teny fototra ireto."
              : "Recevez une notification lorsqu\u2019un nouveau produit correspond \u00e0 vos mots-cl\u00e9s."}
          </p>

          {/* Add keyword input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddKeyword(); }}
              placeholder={locale === "mg" ? "Teny fototra vaovao..." : "Nouveau mot-cl\u00e9..."}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              maxLength={50}
            />
            <button
              onClick={handleAddKeyword}
              disabled={addingKeyword || !newKeyword.trim() || newKeyword.trim().length < 2}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {addingKeyword ? "..." : (locale === "mg" ? "Ampio" : "Ajouter")}
            </button>
          </div>

          {/* Alert count */}
          <p className="text-xs text-gray-500 mb-3">
            {keywordAlerts.length}/30 {locale === "mg" ? "teny fototra" : "mots-cl\u00e9s"}
          </p>

          {/* Alert chips */}
          {keywordAlerts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              {locale === "mg" ? "Tsy mbola misy teny fototra" : "Aucun mot-cl\u00e9 pour le moment"}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywordAlerts.map((alert) => (
                <span
                  key={alert.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {alert.keyword}
                  <button
                    onClick={() => handleRemoveKeyword(alert.id)}
                    className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                    aria-label={`Remove ${alert.keyword}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          title={locale === "mg" ? "Hamafa ny filazana" : "Supprimer l'annonce"}
          message={locale === "mg" ? "Tena te hamafa ity filazana ity ve ianao? Tsy azo averina izany." : "Voulez-vous vraiment supprimer cette annonce ? Cette action est irr\u00e9versible."}
          confirmLabel={locale === "mg" ? "Hamafa" : "Supprimer"}
          cancelLabel={locale === "mg" ? "Hanafoana" : "Annuler"}
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
