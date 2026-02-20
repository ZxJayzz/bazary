import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice, getImageUrls } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import ProductDetailClient from "./ProductDetailClient";

const SITE_NAME = "Bazary";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bazary.mg";

function getAvailabilitySchema(status: string): string {
  switch (status) {
    case "available":
      return "https://schema.org/InStock";
    case "reserved":
      return "https://schema.org/LimitedAvailability";
    case "sold":
      return "https://schema.org/SoldOut";
    default:
      return "https://schema.org/InStock";
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      price: true,
      images: true,
      category: true,
    },
  });

  if (!product) {
    return {
      title: locale === "mg"
        ? "Tsy hita ny entana"
        : "Produit non trouvé",
    };
  }

  const priceFormatted = formatPrice(product.price);
  const title = `${product.title} - ${priceFormatted}`;
  const description = product.description.length > 160
    ? product.description.slice(0, 157) + "..."
    : product.description;

  const images = getImageUrls(product.images);
  const ogImage = images.length > 0
    ? images[0]
    : `${BASE_URL}/api/og?title=${encodeURIComponent(product.title)}&price=${encodeURIComponent(priceFormatted)}`;

  const category = CATEGORIES.find((c) => c.name === product.category);
  const categoryLabel = category
    ? locale === "mg" ? category.nameMg : category.nameFr
    : product.category;

  const ogTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      locale: locale === "mg" ? "mg_MG" : "fr_FR",
      siteName: SITE_NAME,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: product.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    keywords: [
      product.title,
      categoryLabel,
      SITE_NAME,
      "Madagascar",
      locale === "mg" ? "mivarotra" : "vente",
      locale === "mg" ? "mividiana" : "achat",
    ],
    alternates: {
      canonical: `${BASE_URL}/${locale}/product/${id}`,
      languages: {
        fr: `${BASE_URL}/fr/product/${id}`,
        mg: `${BASE_URL}/mg/product/${id}`,
      },
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  // Fetch product on the server for JSON-LD structured data
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, city: true },
      },
    },
  });

  // Build JSON-LD structured data
  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description,
        image: getImageUrls(product.images),
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "MGA",
          availability: getAvailabilitySchema(product.status),
          itemCondition: "https://schema.org/UsedCondition",
          seller: product.user
            ? {
                "@type": "Person",
                name: product.user.name,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: product.user.city,
                  addressCountry: "MG",
                },
              }
            : undefined,
        },
        category: (() => {
          const cat = CATEGORIES.find((c) => c.name === product.category);
          return cat
            ? locale === "mg" ? cat.nameMg : cat.nameFr
            : product.category;
        })(),
        url: `${BASE_URL}/${locale}/product/${id}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient params={params} />
    </>
  );
}
