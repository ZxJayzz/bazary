"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import type { Product } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function FavoritesPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    fetch("/api/favorites")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        // Backend returns array of favorites with product relation
        const favorites = Array.isArray(data) ? data : data.products || [];
        const extractedProducts = favorites
          .map((fav: { product?: Product }) => fav.product)
          .filter(Boolean);
        setProducts(extractedProducts);
        setLoading(false);
      })
      .catch(() => {
        showToast("Erreur de chargement des favoris", "error");
        setLoading(false);
      });
  }, [session?.user?.id]);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          {locale === "mg" ? "Mila miditra aloha ianao" : "Connexion requise"}
        </h1>
        <p className="text-gray-500 mb-6">
          {locale === "mg"
            ? "Mila miditra ianao vao afaka mijery ny tiananao"
            : "Vous devez vous connecter pour voir vos favoris"}
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {locale === "mg" ? "Tiana" : "Mes favoris"}
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {locale === "mg" ? "Tiana" : "Mes favoris"}
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">
            {locale === "mg"
              ? "Tsy mbola misy entana tiana"
              : "Aucun favori pour le moment"}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {locale === "mg"
              ? "Tsindrio ny fo amin'ny entana tianao"
              : "Appuyez sur le coeur pour sauvegarder vos articles preferes"}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
          >
            {locale === "mg" ? "Hijery entana" : "Parcourir les annonces"}
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
