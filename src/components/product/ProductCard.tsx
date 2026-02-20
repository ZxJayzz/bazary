"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { formatPrice, timeAgo, getImageUrls } from "@/lib/utils";
import type { Product } from "@/types";
import FavoriteButton from "./FavoriteButton";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";
  const images = getImageUrls(product.images);
  const firstImage = images[0] || "/images/placeholder.svg";

  const statusColors: Record<string, string> = {
    available: "bg-accent text-white",
    reserved: "bg-yellow-500 text-white",
    sold: "bg-gray-500 text-white",
  };

  return (
    <Link
      href={`/${locale}/product/${product.id}`}
      className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
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
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[product.status]}`}>
            {t(`product.status.${product.status}`)}
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton productId={product.id} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1.5">
          {product.title}
        </h3>
        <p className="text-base font-bold text-gray-900 mb-1.5">
          {formatPrice(product.price)}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{product.district ? `${product.district}, ${product.city}` : product.city}</span>
          <span>{timeAgo(product.createdAt, locale)}</span>
        </div>
      </div>
    </Link>
  );
}
