import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviewerId = session.user.id;
    const body = await request.json();
    const { reviewedId, productId, rating, mannerItems, content } = body;

    // Validate required fields
    if (!reviewedId || !productId || !rating || !mannerItems) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate rating range
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
    }

    // Validate mannerItems is an array of strings
    if (!Array.isArray(mannerItems)) {
      return NextResponse.json({ error: "mannerItems must be an array of strings" }, { status: 400 });
    }

    // Cannot review yourself
    if (reviewerId === reviewedId) {
      return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 });
    }

    // Check if review already exists for this product by this user
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_productId: {
          reviewerId,
          productId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
    }

    // Validate that both users were part of a conversation about this product
    const conversation = await prisma.conversation.findFirst({
      where: {
        productId,
        OR: [
          { buyerId: reviewerId, sellerId: reviewedId },
          { buyerId: reviewedId, sellerId: reviewerId },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "You can only review users you have transacted with" },
        { status: 403 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        reviewerId,
        reviewedId,
        productId,
        rating,
        mannerItems: JSON.stringify(mannerItems),
        content: content || null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Update manner temperature based on rating
    const tempDelta: Record<number, number> = {
      5: 0.3,
      4: 0.1,
      3: 0,
      2: -0.2,
      1: -0.5,
    };

    const delta = tempDelta[rating] || 0;

    if (delta !== 0) {
      const reviewedUser = await prisma.user.findUnique({
        where: { id: reviewedId },
        select: { mannerTemp: true },
      });

      if (reviewedUser) {
        const newTemp = Math.min(99, Math.max(0, reviewedUser.mannerTemp + delta));
        await prisma.user.update({
          where: { id: reviewedId },
          data: { mannerTemp: newTemp },
        });
      }
    }

    // Create notification for the reviewed user
    await prisma.notification.create({
      data: {
        userId: reviewedId,
        type: "review",
        title: "Nouvel avis",
        message: `${session.user.name || "Un utilisateur"} vous a laissé un avis`,
        link: `/profile/${reviewedId}`,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    const reviews = await prisma.review.findMany({
      where: { reviewedId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
