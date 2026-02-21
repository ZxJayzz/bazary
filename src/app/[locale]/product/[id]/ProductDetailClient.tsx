"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, use, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatPrice, timeAgo, getImageUrls } from "@/lib/utils";
import type { Product, Review } from "@/types";
import { CATEGORIES } from "@/types";
import FavoriteButton from "@/components/product/FavoriteButton";
import ProductCard from "@/components/product/ProductCard";
import ImageLightbox from "@/components/ui/ImageLightbox";
import MannerTemp from "@/components/user/MannerTemp";
import ReviewForm from "@/components/review/ReviewForm";
import PriceProposal from "@/components/product/PriceProposal";
import { useToast } from "@/components/ui/Toast";

const BLUR_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+";

const REPORT_REASONS = [
  { value: "inappropriate", keyFr: "Contenu inappropri\u00e9", keyMg: "Votoaty tsy mety" },
  { value: "scam", keyFr: "Arnaque", keyMg: "Fitaka" },
  { value: "duplicate", keyFr: "Doublon", keyMg: "Miverina" },
  { value: "wrongCategory", keyFr: "Mauvaise cat\u00e9gorie", keyMg: "Sokajy diso" },
  { value: "other", keyFr: "Autre", keyMg: "Hafa" },
];

export default function ProductDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Share state
  const [shareToast, setShareToast] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Seller info state
  const [sellerTemp, setSellerTemp] = useState<number>(36.5);
  const [sellerReviews, setSellerReviews] = useState<Review[]>([]);
  const [sellerReviewCount, setSellerReviewCount] = useState(0);

  // Price proposal state
  const [showPriceProposal, setShowPriceProposal] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Bump state
  const [bumping, setBumping] = useState(false);

  // Report state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const reportModalRef = useRef<HTMLDivElement>(null);
  const reportTriggerRef = useRef<HTMLButtonElement>(null);

  // Escape key handler for modal and toasts
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (reportModalOpen) {
          closeReportModal();
        }
        setShareToast(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [reportModalOpen]);

  // Focus trap for report modal
  useEffect(() => {
    if (reportModalOpen && reportModalRef.current) {
      const focusableElements = reportModalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
    if (!reportModalOpen && reportTriggerRef.current) {
      reportTriggerRef.current.focus();
    }
  }, [reportModalOpen]);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            setLoading(false);
            return null;
          }
          throw new Error("Network error");
        }
        return res.json();
      })
      .then((data) => {
        if (data) setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        showToast("Erreur de chargement du produit", "error");
        setLoading(false);
      });
  }, [id, showToast]);

  // Fetch related products
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        // First try same category
        const res = await fetch(`/api/products?category=${encodeURIComponent(product.category)}&limit=5`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const filtered = (data.products || []).filter((p: Product) => p.id !== product.id).slice(0, 4);

        if (filtered.length > 0) {
          setRelatedProducts(filtered);
          return;
        }

        // Fallback: same city
        const cityRes = await fetch(`/api/products?city=${encodeURIComponent(product.city)}&limit=5`);
        if (!cityRes.ok) throw new Error("Failed");
        const cityData = await cityRes.json();
        const cityFiltered = (cityData.products || []).filter((p: Product) => p.id !== product.id).slice(0, 4);
        setRelatedProducts(cityFiltered);
      } catch {
        // silently fail
      }
    };

    fetchRelated();
  }, [product]);

  // Fetch seller public profile (mannerTemp, reviews)
  useEffect(() => {
    if (!product?.userId) return;
    const fetchSellerInfo = async () => {
      try {
        const res = await fetch(`/api/users/${product.userId}`);
        if (res.ok) {
          const data = await res.json();
          setSellerTemp(data.mannerTemp ?? 36.5);
          setSellerReviews(data.reviewsReceived?.slice(0, 3) ?? []);
          setSellerReviewCount(data._count?.reviewsReceived ?? data.reviewsReceived?.length ?? 0);
        }
      } catch {
        // silently fail
      }
    };
    fetchSellerInfo();
  }, [product?.userId]);

  const handleBump = async () => {
    if (!product || bumping) return;
    setBumping(true);
    try {
      const res = await fetch(`/api/products/${product.id}/bump`, { method: "POST" });
      if (res.ok) {
        showToast(locale === "mg" ? "Filazana nampakarina" : "Annonce remont\u00e9e", "success");
        setProduct({ ...product, bumpedAt: new Date() });
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || (locale === "mg" ? "Nisy olana" : "Erreur"), "error");
      }
    } catch {
      showToast(locale === "mg" ? "Nisy olana" : "Erreur", "error");
    } finally {
      setBumping(false);
    }
  };

  const canBump = (): boolean => {
    if (!product?.bumpedAt) return true;
    const lastBump = new Date(product.bumpedAt).getTime();
    const now = Date.now();
    return now - lastBump >= 24 * 60 * 60 * 1000;
  };

  const getBumpCooldown = (): string => {
    if (!product?.bumpedAt) return "";
    const lastBump = new Date(product.bumpedAt).getTime();
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - lastBump);
    if (diff <= 0) return "";
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h${mins.toString().padStart(2, "0")}`;
  };

  const handleStartChat = async () => {
    if (!session?.user?.id) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    setStartingChat(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          sellerId: product?.userId,
        }),
      });
      if (res.ok) {
        router.push(`/${locale}/chat`);
      }
    } catch {
      showToast("Impossible de d\u00e9marrer la conversation", "error");
    } finally {
      setStartingChat(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.title,
      text: product.description?.slice(0, 100) || product.title,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled - not an error
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      } catch {
        showToast("Impossible de partager", "error");
      }
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason || !product) return;
    setReportSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription,
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
        showToast("Signalement envoy\u00e9, merci", "success");
      } else {
        showToast("Erreur lors du signalement", "error");
      }
    } catch {
      showToast("Erreur lors du signalement", "error");
    } finally {
      setReportSubmitting(false);
    }
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportReason("");
    setReportDescription("");
    setReportSuccess(false);
    setReportSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-xl mb-6" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-500 mb-6">
          {locale === "mg" ? "Tsy hita ny entana" : "Produit non trouv\u00e9"}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          {locale === "mg" ? "Hiverina" : "Retour \u00e0 l'accueil"}
        </Link>
      </div>
    );
  }

  const images = getImageUrls(product.images);
  const category = CATEGORIES.find((c) => c.name === product.category);
  const categoryLabel = category
    ? locale === "mg" ? category.nameMg : category.nameFr
    : product.category;

  const statusColors: Record<string, string> = {
    available: "bg-accent text-white",
    reserved: "bg-amber-500 text-white",
    sold: "bg-gray-500 text-white",
  };

  const isOwnProduct = session?.user?.id === product.userId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Share toast */}
      {shareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-gray-800 text-white text-sm rounded-lg shadow-lg animate-fade-in">
          {t("product.linkCopied")}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href={`/${locale}`} className="hover:text-primary">
          {t("common.siteName")}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${locale}?category=${product.category}`} className="hover:text-primary">
          {categoryLabel}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Images */}
        <div className="md:col-span-3">
          <div
            className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3 cursor-pointer"
            onClick={() => setLightboxIndex(currentImage)}
            role="button"
            tabIndex={0}
            aria-label="Agrandir l'image"
            onKeyDown={(e) => { if (e.key === "Enter") setLightboxIndex(currentImage); }}
          >
            <Image
              src={images[currentImage] || "/images/placeholder.svg"}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-sm font-medium ${statusColors[product.status]}`}>
              {t(`product.status.${product.status}`)}
            </div>
          </div>

          {/* Image thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImage === idx ? "border-primary" : "border-gray-200"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="md:col-span-2">
          <h1 className="text-xl font-bold text-gray-800 mb-2">{product.title}</h1>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
            {product.negotiable && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                {locale === "mg" ? "Azo adim-barotra" : "Prix n\u00e9gociable"}
              </span>
            )}
          </div>
          {product.negotiable && !isOwnProduct && (
            <button
              onClick={() => {
                if (!session?.user?.id) {
                  router.push(`/${locale}/auth/login`);
                  return;
                }
                setShowPriceProposal(true);
              }}
              className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-2.5 border border-orange-400 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {locale === "mg" ? "Manolo-bidy" : "Proposer un prix"}
            </button>
          )}

          {/* Meta info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{product.district ? `${product.district}, ${product.city}` : product.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{categoryLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeAgo(product.createdAt, locale)}</span>
            </div>
            {product.views !== undefined && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{product.views} {locale === "mg" ? "nahita" : "vues"}</span>
              </div>
            )}
          </div>

          {/* Seller info */}
          {product.user && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h2 className="font-medium text-gray-800 mb-2">{t("product.postedBy")}</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {product.user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{product.user.name}</p>
                  <p className="text-xs text-gray-500">{product.user.city}</p>
                </div>
                <MannerTemp temperature={sellerTemp} size="sm" />
              </div>

              {/* Seller reviews summary */}
              {sellerReviewCount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">
                    {locale === "mg"
                      ? `${sellerReviewCount} hevitra`
                      : `${sellerReviewCount} avis`}
                  </p>
                  <div className="space-y-2">
                    {sellerReviews.map((review) => (
                      <div key={review.id} className="text-xs">
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3 h-3 ${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                          {review.reviewer && (
                            <span className="text-gray-400 ml-1">{review.reviewer.name}</span>
                          )}
                        </div>
                        {review.content && (
                          <p className="text-gray-600 line-clamp-1">{review.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit button (owner only) */}
          {isOwnProduct && (
            <Link
              href={`/${locale}/product/${product.id}/edit`}
              className="flex items-center justify-center gap-2 w-full mb-3 px-4 py-3 border border-primary text-primary rounded-xl font-medium hover:bg-primary/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t("product.edit")}
            </Link>
          )}

          {/* Bump button (owner only, available products) */}
          {isOwnProduct && product.status === "available" && (
            <button
              onClick={handleBump}
              disabled={bumping || !canBump()}
              className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-3 border border-accent text-accent rounded-xl font-medium hover:bg-accent/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {bumping
                ? (locale === "mg" ? "Mamatsy..." : "Chargement...")
                : !canBump()
                  ? `${locale === "mg" ? "Miandry" : "Attendre"} ${getBumpCooldown()}`
                  : (locale === "mg" ? "Hampakatra ny filazana" : "Remonter l'annonce")}
            </button>
          )}

          {/* Review button - show if product is sold and user was the buyer */}
          {product.status === "sold" && session?.user?.id && !isOwnProduct && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-2.5 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {locale === "mg" ? "Manome hevitra" : "Laisser un avis"}
            </button>
          )}

          {/* Favorite + Share + Report row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FavoriteButton productId={product.id} />
              <span className="text-sm text-gray-500">
                {locale === "mg" ? "Ampidiro amin'ny tiana" : "Ajouter aux favoris"}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Share button */}
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                title={t("product.share")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>

              {/* Report button - only for logged-in users, not own products */}
              {session?.user && !isOwnProduct && (
                <button
                  ref={reportTriggerRef}
                  onClick={() => setReportModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                  title={t("product.report")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Contact button */}
          {product.user?.phone && (
            <div>
              {showPhone ? (
                <a
                  href={`tel:${product.user.phone}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {product.user.phone}
                </a>
              ) : (
                <button
                  onClick={() => setShowPhone(true)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t("product.shareContact")}
                </button>
              )}
            </div>
          )}

          {/* Chat button */}
          {product.userId !== session?.user?.id && (
            <button
              onClick={handleStartChat}
              disabled={startingChat}
              className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {startingChat
                ? t("common.loading")
                : locale === "mg"
                  ? "Hiresaka"
                  : "Envoyer un message"}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-3">{t("product.description")}</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {locale === "mg" ? "Entana mitovy" : "Annonces similaires"}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible scrollbar-hide">
            {relatedProducts.map((rp) => (
              <div key={rp.id} className="min-w-[200px] md:min-w-0">
                <ProductCard product={rp} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Price Proposal Modal */}
      {showPriceProposal && product && (
        <PriceProposal
          productId={product.id}
          productTitle={product.title}
          currentPrice={product.price}
          onClose={() => setShowPriceProposal(false)}
          onSubmitted={() => setShowPriceProposal(false)}
          locale={locale}
        />
      )}

      {/* Review Form Modal */}
      {showReviewForm && product?.user && (
        <ReviewForm
          reviewedId={product.userId}
          reviewedName={product.user.name}
          productId={product.id}
          productTitle={product.title}
          onClose={() => setShowReviewForm(false)}
          onSubmitted={() => setShowReviewForm(false)}
          locale={locale}
        />
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 animate-backdrop-fade"
            onClick={closeReportModal}
          />

          {/* Modal */}
          <div ref={reportModalRef} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale-in">
            {/* Close button */}
            <button
              onClick={closeReportModal}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {reportSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 id="report-modal-title" className="text-lg font-semibold text-gray-800 mb-2">
                  {t("product.reportSuccess")}
                </h3>
                <button
                  onClick={closeReportModal}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
                >
                  {t("common.close")}
                </button>
              </div>
            ) : (
              <>
                <h3 id="report-modal-title" className="text-lg font-semibold text-gray-800 mb-1">
                  {t("product.report")}
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  {locale === "mg"
                    ? "Safidio ny antony hitatirana"
                    : "S\u00e9lectionnez la raison du signalement"}
                </p>

                {/* Reason radio buttons */}
                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                        reportReason === reason.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason.value}
                        checked={reportReason === reason.value}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-4 h-4 text-primary accent-primary"
                      />
                      <span className="text-sm text-gray-700">
                        {locale === "mg" ? reason.keyMg : reason.keyFr}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Description textarea */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("product.reportDescription")}
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder={locale === "mg" ? "Lazao bebe kokoa..." : "D\u00e9crivez le probl\u00e8me..."}
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    onClick={closeReportModal}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={!reportReason || reportSubmitting}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {reportSubmitting ? t("common.loading") : t("product.reportSubmit")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
