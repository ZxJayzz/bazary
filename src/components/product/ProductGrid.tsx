"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/types";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-2/5" />
          <div className="h-3 bg-gray-200 rounded w-1/5" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ProductGrid({
  products,
  showMore,
  onLoadMore,
  loadingMore,
}: {
  products: Product[];
  showMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}) {
  const t = useTranslations();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!showMore || !onLoadMore || loadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showMore, onLoadMore, loadingMore]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-5xl mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">{t("common.noResults")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>

      {/* Loading spinner for infinite scroll */}
      {loadingMore && (
        <div className="flex justify-center mt-8">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Sentinel div for IntersectionObserver */}
      {showMore && <div ref={sentinelRef} className="h-1" />}

      {/* Fallback button */}
      {showMore && onLoadMore && !loadingMore && (
        <div className="text-center mt-4">
          <noscript>
            <button
              onClick={onLoadMore}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {t("common.seeMore")}
            </button>
          </noscript>
        </div>
      )}
    </div>
  );
}
