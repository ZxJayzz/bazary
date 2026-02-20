"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { CITIES, CATEGORIES } from "@/types";
import { uploadImages } from "@/components/product/ImageUpload";
import { getImageUrls } from "@/lib/utils";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Existing image URLs from the product
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // New files to upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    city: "Antananarivo",
    district: "",
  });

  // Fetch existing product data
  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        // Check ownership
        if (session?.user?.id && data.userId !== session.user.id) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          category: data.category || "",
          city: data.city || "Antananarivo",
          district: data.district || "",
        });

        const imgs = getImageUrls(data.images);
        setExistingImages(imgs.filter((img: string) => img !== "/images/placeholder.svg"));
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id, session]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "city") {
      setForm((prev) => ({ ...prev, district: "" }));
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const totalImages = existingImages.length + newImageFiles.length;

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const newFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      const remaining = MAX_IMAGES - totalImages;
      if (remaining <= 0) return;
      const filesToAdd = newFiles.slice(0, remaining);
      setNewImageFiles((prev) => [...prev, ...filesToAdd]);
    },
    [totalImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setError("");
    setSaving(true);

    try {
      // Upload any new images
      let newImageUrls: string[] = [];
      if (newImageFiles.length > 0) {
        newImageUrls = await uploadImages(newImageFiles);
      }

      // Combine existing + new image URLs
      let allImages = [...existingImages, ...newImageUrls];
      if (allImages.length === 0) {
        allImages = ["/images/placeholder.svg"];
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseInt(form.price) || 0,
          category: form.category,
          city: form.city,
          district: form.district || null,
          images: JSON.stringify(allImages),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push(`/${locale}/product/${id}`), 1500);
      } else {
        setError(
          locale === "mg" ? "Nisy olana tamin'ny fanovana" : "Erreur lors de la modification"
        );
      }
    } catch {
      setError(
        locale === "mg" ? "Nisy olana tamin'ny fanovana" : "Erreur lors de la modification"
      );
    } finally {
      setSaving(false);
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
            ? "Mila miditra ianao vao afaka manova filazana"
            : "Vous devez vous connecter pour modifier une annonce"}
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-500 mb-6">
          {locale === "mg" ? "Tsy hita ny entana" : "Produit non trouve"}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          {t("error.goHome")}
        </Link>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          {locale === "mg" ? "Tsy manana alalana" : "Non autorise"}
        </h1>
        <p className="text-gray-500 mb-6">
          {locale === "mg"
            ? "Tsy afaka manova ity filazana ity ianao"
            : "Vous ne pouvez pas modifier cette annonce"}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          {t("error.goHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("product.edit")}</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          {t("product.editSuccess")}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("sell.productTitle")}</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            required
            placeholder={t("sell.productTitlePlaceholder")}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("sell.category")}</label>
          <select
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
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("sell.price")}</label>
          <div className="relative">
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateForm("price", e.target.value)}
              required
              min="0"
              placeholder={t("sell.pricePlaceholder")}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Ar</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("sell.description")}</label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            required
            rows={5}
            placeholder={t("sell.descriptionPlaceholder")}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("sell.images")}
          </label>

          {/* Image preview grid: existing URLs + new files */}
          {(existingImages.length > 0 || newImageFiles.length > 0) && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
              {/* Existing images (URLs) */}
              {existingImages.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <Image
                    src={url}
                    alt={`${locale === "mg" ? "Sary" : "Photo"} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 20vw"
                  />
                  {idx === 0 && newImageFiles.length === 0 && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-white text-[10px] font-medium rounded">
                      {locale === "mg" ? "Voalohany" : "Principal"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* New file images */}
              {newImageFiles.map((file, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`${locale === "mg" ? "Sary" : "Photo"} ${existingImages.length + idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 20vw"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded">
                    {locale === "mg" ? "Vaovao" : "Nouveau"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone */}
          {totalImages < MAX_IMAGES && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  handleFiles(e.target.files);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="hidden"
              />
              <svg
                className="w-10 h-10 mx-auto text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500 mb-1">{t("sell.addImages")}</p>
              <p className="text-xs text-gray-400">
                {locale === "mg"
                  ? `${totalImages}/${MAX_IMAGES} sary`
                  : `${totalImages}/${MAX_IMAGES} photos`}
              </p>
            </div>
          )}
        </div>

        {/* City & District */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("sell.city")}</label>
            <select
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("sell.district")}</label>
            <select
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

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? t("common.loading") : t("profile.save")}
          </button>
          <Link
            href={`/${locale}/product/${id}`}
            className="px-6 py-3 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm text-center"
          >
            {t("common.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
