"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { CITIES } from "@/types";
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
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={profile?.name || ""}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">
                    {(profile?.name || session.user?.name || "?").charAt(0)}
                  </span>
                </div>
              )}
              {editing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div>
                <h1 className="text-xl font-bold text-gray-800">{profile?.name || session.user?.name}</h1>
                <p className="text-sm text-gray-500">{session.user?.email}</p>
                {(profile?.phone) && (
                  <p className="text-sm text-gray-500">{profile.phone}</p>
                )}
                {(profile?.city) && (
                  <p className="text-sm text-gray-500">
                    {profile.district ? `${profile.district}, ${profile.city}` : profile.city}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!editing && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {/* Name */}
            <div className="mt-4">
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
            <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex">
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0">
                  <ProductCard product={product} />
                </div>
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{product.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.city}{product.district ? `, ${product.district}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={product.status}
                      onChange={(e) => handleStatusChange(product.id, e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white"
                    >
                      <option value="available">{t("product.status.available")}</option>
                      <option value="reserved">{t("product.status.reserved")}</option>
                      <option value="sold">{t("product.status.sold")}</option>
                    </select>
                    <Link
                      href={`/${locale}/product/${product.id}/edit`}
                      className="px-2 py-1 text-xs text-primary border border-primary/30 rounded-md hover:bg-primary/5 transition-colors"
                    >
                      {t("common.edit")}
                    </Link>
                    <button
                      onClick={() => handleDeleteRequest(product.id)}
                      className="px-2 py-1 text-xs text-red-500 border border-red-200 rounded-md hover:bg-red-50"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
          <p className="text-xs text-gray-400 mb-3">
            {keywordAlerts.length}/30 {locale === "mg" ? "teny fototra" : "mots-cl\u00e9s"}
          </p>

          {/* Alert chips */}
          {keywordAlerts.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
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
