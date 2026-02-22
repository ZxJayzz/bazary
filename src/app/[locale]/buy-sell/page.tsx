"use client";

import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProductGrid, { ProductGridSkeleton } from "@/components/product/ProductGrid";
import ProductCard from "@/components/product/ProductCard";
import SearchBar from "@/components/search/SearchBar";
import type { Product } from "@/types";
import { CATEGORIES } from "@/types";

function BuySellContent() {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "fr";
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  const cityParam = searchParams.get("city") || "";

  // Build page title
  const getTitle = () => {
    if (searchQuery) return `"${searchQuery}"`;
    if (categoryParam) {
      const cat = CATEGORIES.find((c) => c.name === categoryParam);
      if (cat) return locale === "mg" ? cat.nameMg : cat.nameFr;
    }
    if (cityParam) return cityParam;
    return t("home.allListings");
  };

  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      params.set("limit", "20");

      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (page === 1) {
          setProducts(data.products);
          // If no results and there was a search/filter, fetch suggestions
          if (data.products.length === 0 && (searchQuery || categoryParam || cityParam)) {
            try {
              const sugRes = await fetch("/api/products?limit=8");
              if (sugRes.ok) {
                const sugData = await sugRes.json();
                setSuggestedProducts(sugData.products || []);
              }
            } catch { /* ignore */ }
          } else {
            setSuggestedProducts([]);
          }
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }
        setTotal(data.total);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Main content: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Sidebar />

        <div className="flex-1">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-800">
              {getTitle()}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({total} {locale === "mg" ? "valiny" : "résultats"})
              </span>
            </h1>
          </div>

          {loading && page === 1 ? (
            <ProductGridSkeleton />
          ) : (
            <>
              <ProductGrid
                products={products}
                showMore={products.length < total}
                onLoadMore={() => setPage((p) => p + 1)}
                loadingMore={loading && page > 1}
              />
              {products.length === 0 && suggestedProducts.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {locale === "mg" ? "Entana mety hahafinaritra anao" : "Ces annonces pourraient vous intéresser"}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {suggestedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuySellPage() {
  return (
    <Suspense>
      <BuySellContent />
    </Suspense>
  );
}
