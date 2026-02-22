"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("bazary_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Save or remove email based on remember me
    if (rememberMe) {
      localStorage.setItem("bazary_remember_email", email);
    } else {
      localStorage.removeItem("bazary_remember_email");
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const msg = locale === "mg" ? "Mailaka na tenimiafina diso" : "Email ou mot de passe incorrect";
        setError(msg);
        showToast(msg, "error");
      } else {
        router.push(`/${locale}`);
        router.refresh();
      }
    } catch {
      const msg = locale === "mg" ? "Nisy olana" : "Une erreur est survenue";
      setError(msg);
      showToast(msg, "error");
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
              <Image src="/images/logo.svg" alt="Bazary" width={44} height={44} className="rounded-lg" />
              <span className="text-2xl font-bold text-gray-800">{t("common.siteName")}</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">{t("auth.loginTitle")}</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Facebook Login */}
          <button
            type="button"
            onClick={() => signIn("facebook", { callbackUrl: `/${locale}` })}
            className="flex items-center justify-center gap-3 w-full py-2.5 bg-[#1877F2] text-white font-medium rounded-lg hover:bg-[#166FE5] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {locale === "mg" ? "Hiditra amin'ny Facebook" : "Se connecter avec Facebook"}
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">
                {locale === "mg" ? "na" : "ou"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">{t("auth.email")}</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="exemple@email.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">{t("auth.password")}</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="text-sm text-gray-600">
                  {locale === "mg" ? "Tadidio aho" : "Se souvenir de moi"}
                </span>
              </label>
              <Link href={`/${locale}/auth/forgot-password`} className="text-xs text-primary hover:underline">
                {locale === "mg" ? "Adino ny tenimiafina?" : "Mot de passe oublié ?"}
              </Link>
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
