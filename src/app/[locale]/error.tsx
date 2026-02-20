"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          {/* Warning triangle */}
          <path
            d="M100 55L135 120H65L100 55Z"
            stroke="#FF6F0F"
            strokeWidth="3"
            fill="none"
            strokeLinejoin="round"
          />
          <line x1="100" y1="80" x2="100" y2="100" stroke="#FF6F0F" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="110" r="2.5" fill="#FF6F0F" />
          {/* Gears */}
          <circle cx="155" cy="150" r="15" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <circle cx="155" cy="150" r="5" fill="currentColor" opacity="0.3" />
          <circle cx="135" cy="165" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="135" cy="165" r="3" fill="currentColor" opacity="0.3" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-3">
        {t("error.serverError")}
      </h1>

      <p className="text-gray-500 mb-8 max-w-md">
        {t("error.serverErrorMessage")}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t("error.retry")}
        </button>

        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {t("error.goHome")}
        </Link>
      </div>
    </div>
  );
}
