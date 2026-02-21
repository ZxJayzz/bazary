"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { formatPrice, timeAgo, getImageUrls } from "@/lib/utils";
import type { Product } from "@/types";
import FavoriteButton from "./FavoriteButton";

interface ProductWithCounts extends Product {
  favoriteCount?: number;
  chatCount?: number;
}

export default function ProductCard({ product, priority = false }: { product: ProductWithCounts; priority?: boolean }) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";
  const images = getImageUrls(product.images);
  const firstImage = images[0] || "/images/placeholder.svg";

  const statusColors: Record<string, string> = {
    available: "bg-accent text-white",
    reserved: "bg-amber-500 text-white",
    sold: "bg-gray-500 text-white",
  };

  return (
    <Link
      href={`/${locale}/product/${product.id}`}
      className="group block bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:shadow-gray-200/60 hover:border-gray-300 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <Image
          src={firstImage}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
        {product.status !== "available" && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold ${statusColors[product.status]}`}>
            {t(`product.status.${product.status}`)}
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton productId={product.id} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="text-base font-bold text-primary mb-2">
          {formatPrice(product.price)}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 truncate">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {product.district ? `${product.district}, ${product.city}` : product.city}
          </span>
          <span className="shrink-0 ml-2">{timeAgo(product.createdAt, locale)}</span>
        </div>
        {((product.favoriteCount && product.favoriteCount > 0) || (product.chatCount && product.chatCount > 0)) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
            {product.favoriteCount !== undefined && product.favoriteCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {product.favoriteCount}
              </span>
            )}
            {product.chatCount !== undefined && product.chatCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {product.chatCount}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
