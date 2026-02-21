"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

interface ReviewFormProps {
  reviewedId: string;
  reviewedName: string;
  productId: string;
  productTitle: string;
  onClose: () => void;
  onSubmitted: () => void;
  locale: string;
}

const MANNER_ITEMS = [
  { id: "polite", fr: "Sympathique et poli(e)", mg: "Tsara fanahy sy mahalala fomba" },
  { id: "punctual", fr: "Ponctuel(le)", mg: "Mahatoky fotoana" },
  { id: "fast_reply", fr: "R\u00e9ponse rapide", mg: "Mamaly haingana" },
  { id: "as_described", fr: "Produit conforme", mg: "Entana mitovy amin'ny famaritana" },
  { id: "good_price", fr: "Bon prix", mg: "Vidiny mety" },
  { id: "detailed", fr: "Description d\u00e9taill\u00e9e", mg: "Famaritana amin'ny antsipiriany" },
];

export default function ReviewForm({
  reviewedId,
  reviewedName,
  productId,
  productTitle,
  onClose,
  onSubmitted,
  locale,
}: ReviewFormProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0].focus();
    }
  }, []);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast(locale === "mg" ? "Misafidiana isa azafady" : "Veuillez donner une note", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewedId,
          productId,
          rating,
          mannerItems: JSON.stringify(selectedItems),
          content: content.trim() || null,
        }),
      });

      if (res.ok) {
        showToast(locale === "mg" ? "Misaotra ny fanehoanao hevitra" : "Merci pour votre avis", "success");
        onSubmitted();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || (locale === "mg" ? "Nisy olana" : "Erreur lors de l'envoi"), "error");
      }
    } catch {
      showToast(locale === "mg" ? "Nisy olana" : "Erreur lors de l'envoi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div ref={modalRef} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 id="review-modal-title" className="text-lg font-semibold text-gray-800 mb-1">
          {locale === "mg" ? "Manome hevitra" : "Laisser un avis"}
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          {locale === "mg"
            ? `Momba ny fifanakalozana amin'i ${reviewedName}`
            : `\u00C0 propos de votre transaction avec ${reviewedName}`}
        </p>
        <p className="text-xs text-gray-500 mb-4 truncate">
          {productTitle}
        </p>

        {/* Star Rating */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {locale === "mg" ? "Isa" : "Note"}
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= displayRating ? "text-yellow-400" : "text-gray-300"
                  } transition-colors`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Manner Items */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {locale === "mg" ? "Inona no tsara tamin'ny mpivarotra?" : "Qu'avez-vous appr\u00e9ci\u00e9 ?"}
          </p>
          <div className="flex flex-wrap gap-2">
            {MANNER_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedItems.includes(item.id)
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {selectedItems.includes(item.id) && (
                  <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {locale === "mg" ? item.mg : item.fr}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === "mg" ? "Hevitra fanampiny (tsy voatery)" : "Commentaire (optionnel)"}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder={locale === "mg" ? "Lazao ny fanandramanao..." : "Partagez votre exp\u00e9rience..."}
          />
          <p className="text-xs text-gray-500 text-right mt-1">{content.length}/500</p>
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
            disabled={rating === 0 || submitting}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {submitting
              ? (locale === "mg" ? "Mamatsy..." : "Envoi...")
              : (locale === "mg" ? "Handefa" : "Envoyer")}
          </button>
        </div>
      </div>
    </div>
  );
}
