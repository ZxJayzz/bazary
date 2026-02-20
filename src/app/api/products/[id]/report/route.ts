import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_REASONS = [
  "inappropriate",
  "scam",
  "duplicate",
  "wrong_category",
  "other",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId } = await params;
    const { reason, description } = await request.json();

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: `Invalid reason. Must be one of: ${VALID_REASONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prevent duplicate reports (same user + same product)
    const existingReport = await prisma.report.findFirst({
      where: {
        productId,
        reporterId: session.user.id,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this product" },
        { status: 409 }
      );
    }

    const report = await prisma.report.create({
      data: {
        productId,
        reporterId: session.user.id,
        reason,
        description: description || null,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
