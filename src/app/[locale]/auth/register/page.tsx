"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CITIES } from "@/types";

export default function RegisterPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "Antananarivo",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError(locale === "mg" ? "Tsy mitovy ny tenimiafina" : "Les mots de passe ne correspondent pas");
      return;
    }

    if (form.password.length < 6) {
      setError(locale === "mg" ? "6 litera farafahakeliny ny tenimiafina" : "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          city: form.city,
        }),
      });

      if (res.ok) {
        router.push(`/${locale}/auth/login`);
      } else {
        const data = await res.json();
        setError(data.error === "Email already registered"
          ? (locale === "mg" ? "Efa nampiasaina io mailaka io" : "Cet email est déjà utilisé")
          : (locale === "mg" ? "Nisy olana" : "Une erreur est survenue")
        );
      }
    } catch {
      setError(locale === "mg" ? "Nisy olana" : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">{t("common.siteName")}</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">{t("auth.registerTitle")}</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.name")}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.email")}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.phone")}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="+261 34 00 000 00"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === "mg" ? "Tanàna" : "Ville"}
              </label>
              <select
                value={form.city}
                onChange={(e) => updateForm("city", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {Object.keys(CITIES).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.password")}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.confirmPassword")}</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateForm("confirmPassword", e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? t("common.loading") : t("auth.registerButton")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("auth.hasAccount")}{" "}
            <Link href={`/${locale}/auth/login`} className="text-primary font-medium hover:underline">
              {t("auth.loginButton")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
