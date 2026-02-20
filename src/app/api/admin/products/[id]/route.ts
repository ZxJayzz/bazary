import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireModerator, isErrorResponse } from "@/lib/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireModerator();
    if (isErrorResponse(authResult)) return authResult;

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { hidden, status } = body;

    const data: Record<string, unknown> = {};

    if (typeof hidden === "boolean") {
      data.hidden = hidden;
    }

    if (typeof status === "string" && status) {
      const validStatuses = ["available", "reserved", "sold"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update. Provide hidden (boolean) or status (string)." },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (isErrorResponse(authResult)) return authResult;

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete product and all related records in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete messages in conversations related to this product
      await tx.message.deleteMany({
        where: {
          conversation: { productId: id },
        },
      });

      // Delete conversations related to this product
      await tx.conversation.deleteMany({
        where: { productId: id },
      });

      // Delete favorites
      await tx.favorite.deleteMany({
        where: { productId: id },
      });

      // Delete reports
      await tx.report.deleteMany({
        where: { productId: id },
      });

      // Delete price proposals
      await tx.priceProposal.deleteMany({
        where: { productId: id },
      });

      // Delete the product itself
      await tx.product.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: `Product "${product.title}" has been permanently deleted`,
    });
  } catch (error) {
    console.error("Admin product delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
