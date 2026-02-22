"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

const RECENT_SEARCHES_KEY = "bazary_recent_searches";
const MAX_RECENT = 5;

const SUGGESTED_KEYWORDS = [
  { fr: "iPhone", mg: "iPhone" },
  { fr: "Samsung", mg: "Samsung" },
  { fr: "Voiture", mg: "Fiara" },
  { fr: "Moto", mg: "Moto" },
  { fr: "Appartement", mg: "Trano" },
  { fr: "Ordinateur", mg: "Solosaina" },
  { fr: "Télévision", mg: "Televiziona" },
  { fr: "Réfrigérateur", mg: "Firaiketana" },
  { fr: "Meuble", mg: "Fanaka" },
  { fr: "Vélo", mg: "Bisikileta" },
];

const SORT_OPTIONS = [
  { value: "newest", labelFr: "Plus récent", labelMg: "Vaovao indrindra" },
  { value: "price_asc", labelFr: "Prix croissant", labelMg: "Vidiny mitombo" },
  { value: "price_desc", labelFr: "Prix décroissant", labelMg: "Vidiny mihena" },
  { value: "oldest", labelFr: "Plus ancien", labelMg: "Taloha indrindra" },
];

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  try {
    let searches = getRecentSearches();
    // Remove duplicates and add to front
    searches = [query, ...searches.filter((s) => s !== query)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // silently fail
  }
}

function removeRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  try {
    const searches = getRecentSearches().filter((s) => s !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // silently fail
  }
}

function clearAllRecentSearches() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // silently fail
  }
}

interface SearchBarProps {
  redirectTo?: string;
  hideSort?: boolean;
  hideRecent?: boolean;
  className?: string;
  inputClassName?: string;
}

export default function SearchBar({ redirectTo, hideSort, hideRecent, className, inputClassName }: SearchBarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "fr";
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sortOpen, setSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSort = searchParams.get("sort") || "newest";

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key handler for search and sort dropdowns
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocused(false);
        setSortOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const buildSearchUrl = useCallback((search: string) => {
    const basePath = redirectTo || pathname;
    const params = redirectTo ? new URLSearchParams() : new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    return `${basePath}?${params.toString()}`;
  }, [redirectTo, pathname, searchParams]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
    }
    router.push(buildSearchUrl(query.trim()));
    setFocused(false);
    inputRef.current?.blur();
  }, [query, buildSearchUrl, router]);

  const handleRecentClick = (search: string) => {
    setQuery(search);
    saveRecentSearch(search);
    setRecentSearches(getRecentSearches());
    router.push(buildSearchUrl(search));
    setFocused(false);
  };

  const handleRemoveRecent = (e: React.MouseEvent, search: string) => {
    e.stopPropagation();
    removeRecentSearch(search);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAll = () => {
    clearAllRecentSearches();
    setRecentSearches([]);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`);
    setSortOpen(false);
  };

  // Filter recent searches by current query
  const filteredRecent = query.trim()
    ? recentSearches.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : recentSearches;

  const visibleRecent = hideRecent ? [] : filteredRecent;
  const showSuggestions = focused && !query.trim() && visibleRecent.length === 0;
  const showDropdown = focused && (visibleRecent.length > 0 || showSuggestions);

  const currentSortOption = SORT_OPTIONS.find((o) => o.value === currentSort) || SORT_OPTIONS[0];

  return (
    <div className={className || "flex items-center gap-3 w-full max-w-2xl mx-auto"}>
      {/* Search input with dropdown */}
      <div className="relative flex-1" ref={dropdownRef}>
        <form onSubmit={handleSubmit} className="relative" role="search" aria-label={locale === "mg" ? "Tadiavo entana" : "Rechercher des produits"}>
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder={t("common.search")}
              className={inputClassName || "w-full pl-11 pr-12 sm:pr-28 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  router.push(buildSearchUrl(""));
                }}
                className="absolute right-12 sm:right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={locale === "mg" ? "Fafao ny fikarohana" : "Effacer la recherche"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 sm:px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
            >
              <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">{locale === "mg" ? "Tadiavo" : "Rechercher"}</span>
            </button>
          </div>
        </form>

        {/* Search dropdown: recent searches + suggested keywords */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-40 overflow-hidden">
            {visibleRecent.length > 0 && (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {t("search.recentSearches")}
                  </span>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-primary hover:text-primary-hover font-medium"
                  >
                    {t("search.clearAll")}
                  </button>
                </div>
                <div>
                  {visibleRecent.map((search) => (
                    <div
                      key={search}
                      onClick={() => handleRecentClick(search)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="flex-1 text-sm text-gray-700 truncate">{search}</span>
                      <button
                        onClick={(e) => handleRemoveRecent(e, search)}
                        className="shrink-0 p-0.5 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {showSuggestions && (
              <div className="px-4 py-3">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {locale === "mg" ? "Teny alefa" : "Suggestions"}
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUGGESTED_KEYWORDS.map((kw) => (
                    <button
                      key={kw.fr}
                      onClick={() => handleRecentClick(locale === "mg" ? kw.mg : kw.fr)}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {locale === "mg" ? kw.mg : kw.fr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sort dropdown */}
      {!hideSort && <div className="relative shrink-0" ref={sortRef}>
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-1.5 px-3 py-3 border border-gray-300 rounded-xl text-sm bg-white hover:bg-gray-50 transition-colors text-gray-700 whitespace-nowrap"
          aria-label={locale === "mg" ? "Alaharo" : "Trier"}
          aria-expanded={sortOpen}
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span className="hidden sm:inline">
            {locale === "mg" ? currentSortOption.labelMg : currentSortOption.labelFr}
          </span>
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {sortOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-40 overflow-hidden">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  currentSort === option.value
                    ? "text-primary font-medium bg-primary/5"
                    : "text-gray-700"
                }`}
              >
                {locale === "mg" ? option.labelMg : option.labelFr}
              </button>
            ))}
          </div>
        )}
      </div>}
    </div>
  );
}
