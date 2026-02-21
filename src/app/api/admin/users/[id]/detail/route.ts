import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isErrorResponse } from "@/lib/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (isErrorResponse(authResult)) return authResult;

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        district: true,
        image: true,
        role: true,
        mannerTemp: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            reviewsReceived: true,
            reviewsGiven: true,
            reports: true,
            favorites: true,
            buyerConversations: true,
            sellerConversations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's products
    const products = await prisma.product.findMany({
      where: { userId: id },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        hidden: true,
        category: true,
        views: true,
        createdAt: true,
        _count: { select: { favorites: true, reports: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Get reviews received
    const reviewsReceived = await prisma.review.findMany({
      where: { reviewedId: id },
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        reviewer: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Get reports made by or against this user's products
    const reportsReceived = await prisma.report.findMany({
      where: { product: { userId: id } },
      select: {
        id: true,
        reason: true,
        description: true,
        status: true,
        createdAt: true,
        reporter: { select: { id: true, name: true } },
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const reportsMade = await prisma.report.findMany({
      where: { reporterId: id },
      select: {
        id: true,
        reason: true,
        description: true,
        status: true,
        createdAt: true,
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Get conversations (just metadata, not message content for privacy)
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: id }, { sellerId: id }] },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        product: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      user,
      products,
      reviewsReceived,
      reportsReceived,
      reportsMade,
      conversations,
    });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
