"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const POPULAR_KEYWORDS_FR = [
  "iPhone", "Samsung", "Ordinateur", "Moto", "Voiture", "Appartement",
  "Terrain", "Meuble", "Télévision", "Vélo", "Machine à laver",
  "Climatiseur", "PlayStation", "Guitare", "Livre",
];

const POPULAR_KEYWORDS_MG = [
  "iPhone", "Samsung", "Solosaina", "Moto", "Fiara", "Trano",
  "Tany", "Fanaka", "Televiziona", "Bisikileta", "Milina fanasana",
  "Climatiseur", "PlayStation", "Gitara", "Boky",
];

export default function PopularKeywords() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";
  const keywords = locale === "mg" ? POPULAR_KEYWORDS_MG : POPULAR_KEYWORDS_FR;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">
        {t("home.popularSearches")}
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <Link
            key={keyword}
            href={`/${locale}?search=${encodeURIComponent(keyword)}`}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors"
          >
            {keyword}
          </Link>
        ))}
      </div>
    </div>
  );
}
