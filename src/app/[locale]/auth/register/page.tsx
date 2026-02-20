"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CITIES } from "@/types";
import { useToast } from "@/components/ui/Toast";

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
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0-5
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score === 0) return "";
    if (score <= 2) return locale === "mg" ? "Malemy" : "Faible";
    if (score <= 3) return locale === "mg" ? "Antonony" : "Moyen";
    return locale === "mg" ? "Matanjaka" : "Fort";
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const passwordStrength = getPasswordStrength(form.password);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: locale === "mg" ? "Endiriky ny mailaka tsy mety" : "Format d'email invalide",
      }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  };

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
        showToast(locale === "mg" ? "Kaonty voaforona, mba midira" : "Compte cr\u00e9\u00e9 avec succ\u00e8s, connectez-vous", "success");
        router.push(`/${locale}/auth/login`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error === "Email already registered"
          ? (locale === "mg" ? "Efa nampiasaina io mailaka io" : "Cet email est d\u00e9j\u00e0 utilis\u00e9")
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

  const passwordMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <Image src="/images/logo.svg" alt="Bazary" width={44} height={44} className="rounded-lg" />
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
              <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">{t("auth.name")}</label>
              <input
                id="register-name"
                type="text"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">{t("auth.email")}</label>
              <input
                id="register-email"
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                onBlur={() => form.email && validateEmail(form.email)}
                required
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${fieldErrors.email ? "border-red-400" : "border-gray-300"}`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">{t("auth.phone")}</label>
              <input
                id="register-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="+261 34 00 000 00"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                {locale === "mg" ? "Endrika: +261 XX XX XXX XX" : "Format: +261 XX XX XXX XX"}
              </p>
            </div>
            <div>
              <label htmlFor="register-city" className="block text-sm font-medium text-gray-700 mb-1">
                {locale === "mg" ? "Tan\u00e0na" : "Ville"}
              </label>
              <select
                id="register-city"
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
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">{t("auth.password")}</label>
              <input
                id="register-password"
                type="password"
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength <= 2 ? "text-red-500" : passwordStrength <= 3 ? "text-yellow-600" : "text-green-600"}`}>
                      {getPasswordStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">{t("auth.confirmPassword")}</label>
              <input
                id="register-confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateForm("confirmPassword", e.target.value)}
                required
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${passwordMismatch ? "border-red-400" : "border-gray-300"}`}
              />
              {passwordMismatch && (
                <p className="text-red-500 text-xs mt-1">
                  {locale === "mg" ? "Tsy mitovy ny tenimiafina" : "Les mots de passe ne correspondent pas"}
                </p>
              )}
              {form.confirmPassword.length > 0 && !passwordMismatch && (
                <p className="text-green-600 text-xs mt-1">
                  {locale === "mg" ? "Mitovy ny tenimiafina" : "Les mots de passe correspondent"}
                </p>
              )}
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
