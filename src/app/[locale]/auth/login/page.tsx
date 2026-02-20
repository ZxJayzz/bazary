"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(locale === "mg" ? "Mailaka na tenimiafina diso" : "Email ou mot de passe incorrect");
      } else {
        router.push(`/${locale}`);
        router.refresh();
      }
    } catch {
      setError(locale === "mg" ? "Nisy olana" : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
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
            <h1 className="text-xl font-semibold text-gray-800">{t("auth.loginTitle")}</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="exemple@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? t("common.loading") : t("auth.loginButton")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("auth.noAccount")}{" "}
            <Link href={`/${locale}/auth/register`} className="text-primary font-medium hover:underline">
              {t("auth.registerButton")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
