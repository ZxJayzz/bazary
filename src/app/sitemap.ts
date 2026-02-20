import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bazary.mg";
  const locales = ["fr", "mg"];

  // Static pages per locale
  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/${locale}/buy-sell`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
  ]);

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { status: "available" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    productPages = locales.flatMap((locale) =>
      products.map((product) => ({
        url: `${baseUrl}/${locale}/product/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    );
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  return [...staticPages, ...productPages];
}
