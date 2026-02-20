import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            user: {
              select: { id: true, name: true, city: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already in favorites" }, { status: 409 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        productId,
      },
      include: {
        product: {
          include: {
            user: {
              select: { id: true, name: true, city: true },
            },
          },
        },
      },
    });

    // Create notification for the product owner
    if (product.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: product.userId,
          type: "product_favorited",
          title: "Nouveau favori",
          message: product.title,
          link: `/product/${productId}`,
        },
      });
    }

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
