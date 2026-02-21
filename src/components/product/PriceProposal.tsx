"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

interface PriceProposalProps {
  productId: string;
  productTitle: string;
  currentPrice: number;
  onClose: () => void;
  onSubmitted: () => void;
  locale: string;
}

export default function PriceProposal({
  productId,
  productTitle,
  currentPrice,
  onClose,
  onSubmitted,
  locale,
}: PriceProposalProps) {
  const { showToast } = useToast();
  const [proposedPrice, setProposedPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const discounts = [10, 20, 30];

  const applyDiscount = (percent: number) => {
    const discounted = Math.round(currentPrice * (1 - percent / 100));
    setProposedPrice(discounted.toString());
  };

  const priceValue = parseInt(proposedPrice) || 0;
  const isValid = priceValue > 0 && priceValue < currentPrice;

  const handleSubmit = async () => {
    if (!isValid) {
      showToast(
        locale === "mg"
          ? "Vidiny tsy mety. Tokony ho latsaky ny vidiny ankehitriny."
          : "Prix invalide. Il doit \u00eatre inf\u00e9rieur au prix actuel.",
        "warning"
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/price-proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          proposedPrice: priceValue,
        }),
      });

      if (res.ok) {
        showToast(
          locale === "mg" ? "Tolotra nalefa" : "Proposition envoy\u00e9e",
          "success"
        );
        onSubmitted();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(
          data.error || (locale === "mg" ? "Nisy olana" : "Erreur lors de l'envoi"),
          "error"
        );
      }
    } catch {
      showToast(locale === "mg" ? "Nisy olana" : "Erreur lors de l'envoi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-proposal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 id="price-proposal-title" className="text-lg font-semibold text-gray-800 mb-1">
          {locale === "mg" ? "Manolo-bidy" : "Proposer un prix"}
        </h3>
        <p className="text-xs text-gray-500 mb-4 truncate">{productTitle}</p>

        {/* Current price */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-0.5">
            {locale === "mg" ? "Vidiny ankehitriny" : "Prix actuel"}
          </p>
          <p className="text-lg font-bold text-gray-800">{formatPrice(currentPrice)}</p>
        </div>

        {/* Quick discount buttons */}
        <div className="flex gap-2 mb-4">
          {discounts.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => applyDiscount(d)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                priceValue === Math.round(currentPrice * (1 - d / 100))
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              -{d}%
            </button>
          ))}
        </div>

        {/* Custom price input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === "mg" ? "Vidiny toloranao" : "Votre prix"}
          </label>
          <div className="relative">
            <input
              type="number"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              min="1"
              max={currentPrice - 1}
              placeholder={locale === "mg" ? "Ampidiro ny vidiny" : "Entrez votre prix"}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12 ${
                proposedPrice && !isValid ? "border-red-400" : "border-gray-300"
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Ar</span>
          </div>
          {proposedPrice && !isValid && (
            <p className="text-red-500 text-xs mt-1">
              {priceValue <= 0
                ? (locale === "mg" ? "Vidiny tsy mety" : "Prix invalide")
                : (locale === "mg"
                    ? "Tokony ho latsaky ny vidiny ankehitriny"
                    : "Le prix doit \u00eatre inf\u00e9rieur au prix actuel")}
            </p>
          )}
          {proposedPrice && isValid && (
            <p className="text-green-600 text-xs mt-1">
              {locale === "mg" ? "Fihenana" : "R\u00e9duction"}: {Math.round((1 - priceValue / currentPrice) * 100)}%
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {locale === "mg" ? "Ajanony" : "Annuler"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {submitting
              ? (locale === "mg" ? "Mamatsy..." : "Envoi...")
              : (locale === "mg" ? "Manolo-bidy" : "Proposer")}
          </button>
        </div>
      </div>
    </div>
  );
}
