import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import BackToTop from "@/components/ui/BackToTop";
import SessionProvider from "@/components/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_NAME = "Bazary";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bazary.mg";

const SITE_DESCRIPTIONS = {
  fr: "Achetez et vendez près de chez vous à Madagascar",
  mg: "Mividiana sy mivarotra eo akaikinao eto Madagasikara",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const description = SITE_DESCRIPTIONS[locale as keyof typeof SITE_DESCRIPTIONS] || SITE_DESCRIPTIONS.fr;
  const title = `${SITE_NAME} - Marketplace Madagascar`;

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    keywords: [
      "Bazary",
      "Madagascar",
      "marketplace",
      "vente",
      "achat",
      "petites annonces",
      "mivarotra",
      "mividiana",
      "Antananarivo",
      "Toamasina",
      "occasion",
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    openGraph: {
      type: "website",
      locale: locale === "mg" ? "mg_MG" : "fr_FR",
      alternateLocale: locale === "mg" ? "fr_FR" : "mg_MG",
      url: `${BASE_URL}/${locale}`,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: `${BASE_URL}/api/og`,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} - Marketplace Madagascar`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/api/og`],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180" },
      ],
    },
    manifest: "/manifest.json",
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        fr: `${BASE_URL}/fr`,
        mg: `${BASE_URL}/mg`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "mg")) {
    notFound();
  }

  const messages = await getMessages();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    description: SITE_DESCRIPTIONS[locale as keyof typeof SITE_DESCRIPTIONS] || SITE_DESCRIPTIONS.fr,
    areaServed: {
      "@type": "Country",
      name: "Madagascar",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/${locale}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-primary focus:font-medium">
          {locale === "mg" ? "Mandehana any amin'ny votoatiny" : "Aller au contenu principal"}
        </a>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <ToastProvider>
              <Navbar />
              <main id="main-content" className="flex-1 pb-20 lg:pb-0">{children}</main>
              <Footer />
              <BackToTop />
              <BottomNav />
            </ToastProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
