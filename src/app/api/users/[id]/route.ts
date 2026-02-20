import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        city: true,
        district: true,
        image: true,
        mannerTemp: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
          },
        },
        reviewsReceived: {
          include: {
            reviewer: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate review stats
    const reviewStats = await prisma.review.aggregate({
      where: { reviewedId: id },
      _count: { id: true },
      _avg: { rating: true },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      city: user.city,
      district: user.district,
      image: user.image,
      mannerTemp: user.mannerTemp,
      createdAt: user.createdAt,
      productCount: user._count.products,
      reviewCount: reviewStats._count.id,
      averageRating: reviewStats._avg.rating ? Math.round(reviewStats._avg.rating * 10) / 10 : null,
      reviews: user.reviewsReceived,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
