"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStep(2);
      } else {
        setError(locale === "mg" ? "Nisy olana" : "Une erreur est survenue");
      }
    } catch {
      setError(locale === "mg" ? "Nisy olana" : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError(locale === "mg" ? "Tsy mitovy ny tenimiafina" : "Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      setError(locale === "mg" ? "Tenimiafina fohy loatra" : "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (res.ok) {
        showToast(locale === "mg" ? "Tenimiafina voaova" : "Mot de passe réinitialisé avec succès", "success");
        router.push(`/${locale}/auth/login`);
      } else {
        const data = await res.json();
        setError(data.error || (locale === "mg" ? "Nisy olana" : "Erreur"));
      }
    } catch {
      setError(locale === "mg" ? "Nisy olana" : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {locale === "mg" ? "Adino ny tenimiafina?" : "Mot de passe oublié ?"}
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {step === 1
            ? (locale === "mg" ? "Ampidiro ny mailaka" : "Entrez votre adresse email")
            : (locale === "mg" ? "Ampidiro ny tenimiafina vaovao" : "Entrez votre nouveau mot de passe")}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? "..." : (locale === "mg" ? "Tohizo" : "Continuer")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <div className="mb-4">
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                {locale === "mg" ? "Tenimiafina vaovao" : "Nouveau mot de passe"}
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
                minLength={6}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">
                {locale === "mg" ? "Hamafiso ny tenimiafina" : "Confirmer le mot de passe"}
              </label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? "..." : (locale === "mg" ? "Hanova ny tenimiafina" : "Réinitialiser")}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link href={`/${locale}/auth/login`} className="text-sm text-primary hover:underline">
            {locale === "mg" ? "Hiverina miditra" : "Retour à la connexion"}
          </Link>
        </div>
      </div>
    </div>
  );
}
