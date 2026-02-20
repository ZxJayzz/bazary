import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId } = await params;
    const userId = session.user.id;

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, userId: true, status: true, bumpedAt: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Only the product owner can bump
    if (product.userId !== userId) {
      return NextResponse.json({ error: "Only the product owner can bump" }, { status: 403 });
    }

    // Product must be available
    if (product.status !== "available") {
      return NextResponse.json({ error: "Only available products can be bumped" }, { status: 400 });
    }

    // Check 24-hour cooldown
    if (product.bumpedAt) {
      const hoursSinceLastBump =
        (Date.now() - new Date(product.bumpedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastBump < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastBump);
        return NextResponse.json(
          { error: `You can bump again in ${hoursRemaining} hour(s)` },
          { status: 429 }
        );
      }
    }

    // Update bumpedAt and updatedAt
    const now = new Date();
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        bumpedAt: now,
        updatedAt: now,
      },
    });

    return NextResponse.json({ success: true, bumpedAt: updatedProduct.bumpedAt });
  } catch (error) {
    console.error("Error bumping product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
