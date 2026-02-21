"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CITIES, CATEGORIES } from "@/types";
import ImageUpload, { uploadImages } from "@/components/product/ImageUpload";
import { useToast } from "@/components/ui/Toast";

export default function NewProductPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    city: "Antananarivo",
    district: "",
    negotiable: false,
  });

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {};
    switch (name) {
      case "title":
        if (value.length < 3) errors.title = locale === "mg" ? "Lohateny fohy loatra (3 litera farafahakeliny)" : "Titre trop court (3 caract\u00e8res minimum)";
        if (value.length > 100) errors.title = locale === "mg" ? "Lohateny lava loatra (100 litera farafahabetsany)" : "Titre trop long (100 caract\u00e8res maximum)";
        break;
      case "price":
        if (!value || parseInt(value) <= 0) errors.price = locale === "mg" ? "Vidiny tsy mety" : "Prix invalide";
        break;
      case "description":
        if (value.length < 10) errors.description = locale === "mg" ? "Famaritana fohy loatra" : "Description trop courte (10 caract\u00e8res minimum)";
        break;
    }
    return errors;
  };

  const handleBlur = (name: string, value: string) => {
    if (!value) return;
    const errors = validateField(name, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return { ...next, ...errors };
    });
  };

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "city") {
      setForm((prev) => ({ ...prev, district: "" }));
    }
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      let imageUrls: string[] = ["/images/placeholder.svg"];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages(imageFiles);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price) || 0,
          negotiable: form.negotiable,
          images: JSON.stringify(imageUrls),
          userId: session.user.id,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        showToast(locale === "mg" ? "Filazana nalefa" : "Annonce publi\u00e9e avec succ\u00e8s", "success");
        setTimeout(() => router.push(`/${locale}`), 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || (locale === "mg" ? "Nisy olana" : "Erreur lors de la publication");
        setError(msg);
        showToast(msg, "error");
      }
    } catch {
      const msg = locale === "mg" ? "Nisy olana" : "Erreur lors de la publication";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          {locale === "mg" ? "Mila miditra aloha ianao" : "Connexion requise"}
        </h1>
        <p className="text-gray-500 mb-6">
          {locale === "mg"
            ? "Mila miditra ianao vao afaka mandefa filazana"
            : "Vous devez vous connecter pour publier une annonce"}
        </p>
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
        >
          {t("common.login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("sell.title")}</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          {t("sell.success")}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="product-title" className="block text-sm font-medium text-gray-700 mb-1">{t("sell.productTitle")}</label>
          <input
            id="product-title"
            type="text"
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            onBlur={(e) => handleBlur("title", e.target.value)}
            required
            placeholder={t("sell.productTitlePlaceholder")}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${fieldErrors.title ? "border-red-400" : "border-gray-300"}`}
          />
          {fieldErrors.title && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">{t("sell.category")}</label>
          <select
            id="product-category"
            value={form.category}
            onChange={(e) => updateForm("category", e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">{t("sell.selectCategory")}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.icon} {locale === "mg" ? cat.nameMg : cat.nameFr}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">{t("sell.price")}</label>
          <div className="relative">
            <input
              id="product-price"
              type="number"
              value={form.price}
              onChange={(e) => updateForm("price", e.target.value)}
              onBlur={(e) => handleBlur("price", e.target.value)}
              required
              min="0"
              placeholder={t("sell.pricePlaceholder")}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12 ${fieldErrors.price ? "border-red-400" : "border-gray-300"}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Ar</span>
          </div>
          {fieldErrors.price && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>
          )}
          {/* Negotiable toggle */}
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={form.negotiable}
              onChange={(e) => setForm((prev) => ({ ...prev, negotiable: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-checked:bg-primary rounded-full relative transition-colors">
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.negotiable ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm text-gray-600">
              {locale === "mg" ? "Azo adim-barotra" : "Prix n\u00e9gociable"}
            </span>
          </label>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">{t("sell.description")}</label>
            <span className="text-xs text-gray-500">{form.description.length}/2000</span>
          </div>
          <textarea
            id="product-description"
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            onBlur={(e) => handleBlur("description", e.target.value)}
            required
            rows={5}
            maxLength={2000}
            placeholder={t("sell.descriptionPlaceholder")}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${fieldErrors.description ? "border-red-400" : "border-gray-300"}`}
          />
          {fieldErrors.description && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
          )}
        </div>

        {/* Images */}
        <ImageUpload images={imageFiles} onChange={setImageFiles} />

        {/* City & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-city" className="block text-sm font-medium text-gray-700 mb-1">{t("sell.city")}</label>
            <select
              id="product-city"
              value={form.city}
              onChange={(e) => updateForm("city", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {Object.keys(CITIES).map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-district" className="block text-sm font-medium text-gray-700 mb-1">{t("sell.district")}</label>
            <select
              id="product-district"
              value={form.district}
              onChange={(e) => updateForm("district", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">{t("sell.selectDistrict")}</option>
              {CITIES[form.city]?.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? t("common.loading") : t("sell.publish")}
        </button>
      </form>
    </div>
  );
}
