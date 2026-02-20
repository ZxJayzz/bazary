"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NotFoundPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center text-center">
      {/* Illustration */}
      <div className="mb-8">
        <svg
          className="w-48 h-48 text-gray-300"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="4" strokeDasharray="8 8" />
          <circle cx="100" cy="100" r="60" fill="currentColor" opacity="0.1" />
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="fill-primary"
            fontSize="48"
            fontWeight="bold"
            fontFamily="system-ui"
          >
            404
          </text>
          <text
            x="100"
            y="125"
            textAnchor="middle"
            fill="currentColor"
            fontSize="14"
            fontFamily="system-ui"
          >
            {locale === "mg" ? "Tsy hita" : "Non trouve"}
          </text>
          {/* Search icon */}
          <circle cx="145" cy="55" r="18" stroke="#FF6F0F" strokeWidth="3" fill="none" />
          <line x1="158" y1="68" x2="172" y2="82" stroke="#FF6F0F" strokeWidth="3" strokeLinecap="round" />
          {/* X in search */}
          <line x1="139" y1="49" x2="151" y2="61" stroke="#FF6F0F" strokeWidth="2" strokeLinecap="round" />
          <line x1="151" y1="49" x2="139" y2="61" stroke="#FF6F0F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-3">
        {t("error.notFound")}
      </h1>

      <p className="text-gray-500 mb-8 max-w-md">
        {t("error.notFoundMessage")}
      </p>

      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        {t("error.goHome")}
      </Link>
    </div>
  );
}
