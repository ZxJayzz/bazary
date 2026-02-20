"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || "fr";

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
      <button
        onClick={() => switchLocale("fr")}
        className={`px-2.5 py-1.5 transition-colors ${
          currentLocale === "fr"
            ? "bg-primary text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        FR
      </button>
      <button
        onClick={() => switchLocale("mg")}
        className={`px-2.5 py-1.5 transition-colors ${
          currentLocale === "mg"
            ? "bg-accent text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        MG
      </button>
    </div>
  );
}
