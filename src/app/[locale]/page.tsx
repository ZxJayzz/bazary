"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, CITIES } from "@/types";

const POPULAR_SEARCHES_FR = [
  "iPhone", "Samsung", "Ordinateur", "Moto", "Voiture", "Terrain",
  "Appartement", "Meuble", "Télévision", "Machine à laver",
  "Climatiseur", "PlayStation", "Vélo", "Guitare",
];

const POPULAR_SEARCHES_MG = [
  "iPhone", "Samsung", "Solosaina", "Moto", "Fiara", "Tany",
  "Trano", "Fanaka", "Televiziona", "Milina fanasana",
  "Climatiseur", "PlayStation", "Bisikileta", "Gitara",
];

export default function HomePage() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const [searchQuery, setSearchQuery] = useState("");

  const popularSearches = locale === "mg" ? POPULAR_SEARCHES_MG : POPULAR_SEARCHES_FR;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/buy-sell?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/${locale}/buy-sell`);
    }
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center">
          {/* Slogan */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 leading-tight">
            {locale === "mg" ? (
              <>Ny <span className="text-primary">Bazary</span> akaikinao</>
            ) : (
              <>Votre <span className="text-primary">Bazary</span> de proximité</>
            )}
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            {t("home.heroSubtitle")}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center">
              <svg
                className="absolute left-4 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("common.search")}
                className="w-full pl-12 pr-12 sm:pr-32 py-4 text-base border border-gray-300 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-3 sm:px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors text-sm"
              >
                <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">{locale === "mg" ? "Tadiavo" : "Rechercher"}</span>
              </button>
            </div>
          </form>

          {/* Popular searches */}
          <div>
            <p className="text-sm text-gray-400 mb-3">{t("home.popularSearches")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularSearches.map((keyword) => (
                <Link
                  key={keyword}
                  href={`/${locale}/buy-sell?search=${encodeURIComponent(keyword)}`}
                  className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-primary hover:text-primary hover:bg-orange-50 transition-all"
                >
                  {keyword}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-5xl mx-auto px-4 py-14" id="categories">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          {t("nav.categories")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/${locale}/buy-sell?category=${cat.name}`}
              className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-md transition-all"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors text-center">
                {locale === "mg" ? cat.nameMg : cat.nameFr}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Locations Section */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            {locale === "mg" ? "Tanàna malaza" : "Villes populaires"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(CITIES).map(([city, districts]) => (
              <div key={city}>
                <Link
                  href={`/${locale}/buy-sell?city=${city}`}
                  className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-sm transition-all text-center group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-800 text-sm group-hover:text-primary transition-colors">
                    {city}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {districts.length} {locale === "mg" ? "faritra" : "quartiers"}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
          {t("nav.howItWorks")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              titleFr: "Recherchez",
              titleMg: "Tadiavo",
              descFr: "Trouvez ce que vous cherchez parmi des milliers d'annonces près de chez vous.",
              descMg: "Tadiavo izay tadiavinao amin'ny filazana an'arivony eo akaikinao.",
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ),
              titleFr: "Contactez",
              titleMg: "Mifandraisa",
              descFr: "Contactez directement le vendeur par téléphone pour convenir d'un rendez-vous.",
              descMg: "Mifandraisa mivantana amin'ny mpivarotra amin'ny telefaonina.",
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              titleFr: "Achetez",
              titleMg: "Vidio",
              descFr: "Rencontrez le vendeur, vérifiez l'article et finalisez la transaction en toute confiance.",
              descMg: "Mihaotra ny mpivarotra, jereo ny entana ary vitao ny varotra amim-pitokisana.",
            },
          ].map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {locale === "mg" ? step.titleMg : step.titleFr}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {locale === "mg" ? step.descMg : step.descFr}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {locale === "mg"
              ? "Manana entana hivarotra ve ianao?"
              : "Vous avez quelque chose à vendre ?"
            }
          </h2>
          <p className="text-orange-100 mb-6">
            {locale === "mg"
              ? "Arotsahy ny filazanao amin'ny minitra vitsy monja"
              : "Publiez votre annonce en quelques minutes"
            }
          </p>
          <Link
            href={`/${locale}/product/new`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-orange-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("sell.title")}
          </Link>
        </div>
      </section>
    </div>
  );
}
