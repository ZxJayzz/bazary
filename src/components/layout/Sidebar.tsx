"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CITIES, CATEGORIES } from "@/types";

export default function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "fr";
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedCity = searchParams.get("city") || "";
  const selectedCategory = searchParams.get("category") || "";
  const availableOnly = searchParams.get("available") === "true";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset district when city changes
    if (key === "city") {
      params.delete("district");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleAvailable = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (availableOnly) {
      params.delete("available");
    } else {
      params.set("available", "true");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push(pathname);
  };

  const hasFilters = selectedCity || selectedCategory || availableOnly;
  const activeFilterCount = [selectedCity, selectedCategory, availableOnly].filter(Boolean).length;

  const filterContent = (
    <>
      {/* Available only toggle */}
      <div className="mb-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={toggleAvailable}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              availableOnly ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                availableOnly ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm text-gray-700">{t("home.availableOnly")}</span>
        </label>
      </div>

      {/* City filter */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{t("filters.city")}</h3>
        <select
          value={selectedCity}
          onChange={(e) => updateFilter("city", e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">{t("filters.allCities")}</option>
          {Object.keys(CITIES).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* District filter (shown when city is selected) */}
      {selectedCity && CITIES[selectedCity] && (
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {locale === "mg" ? "Fokontany" : "Quartier"}
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {CITIES[selectedCity].map((district) => (
              <label
                key={district}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="district"
                  value={district}
                  checked={searchParams.get("district") === district}
                  onChange={(e) => updateFilter("district", e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">{district}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{t("filters.category")}</h3>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          <label className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="category"
              value=""
              checked={selectedCategory === ""}
              onChange={() => updateFilter("category", "")}
              className="text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">{t("filters.allCategories")}</span>
          </label>
          {CATEGORIES.map((cat) => (
            <label
              key={cat.name}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                value={cat.name}
                checked={selectedCategory === cat.name}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-600">
                {cat.icon} {locale === "mg" ? cat.nameMg : cat.nameFr}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">{t("filters.priceRange")}</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t("filters.minPrice")}
            value={searchParams.get("minPrice") || ""}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <input
            type="number"
            placeholder={t("filters.maxPrice")}
            value={searchParams.get("maxPrice") || ""}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
    </>
  );

  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Mobile: collapsible toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 mb-3"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">{t("filters.title")}</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${mobileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Mobile: collapsible content */}
      {mobileOpen && (
        <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4 mb-4 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">{t("filters.title")}</h2>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-primary hover:text-primary-hover font-medium"
              >
                {t("filters.reset")}
              </button>
            )}
          </div>
          {filterContent}
        </div>
      )}

      {/* Desktop: always visible */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">{t("filters.title")}</h2>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-primary hover:text-primary-hover font-medium"
            >
              {t("filters.reset")}
            </button>
          )}
        </div>
        {filterContent}
      </div>
    </aside>
  );
}
