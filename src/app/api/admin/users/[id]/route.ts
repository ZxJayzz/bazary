import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isErrorResponse } from "@/lib/admin";

const VALID_ROLES = ["user", "moderator", "admin"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (isErrorResponse(authResult)) return authResult;
    const { userId } = authResult;

    const { id } = await params;

    // Prevent admin from changing their own role
    if (id === userId) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (isErrorResponse(authResult)) return authResult;
    const { userId } = authResult;

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cannot delete another admin
    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete another admin" },
        { status: 403 }
      );
    }

    // Delete all user data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete messages sent by user
      await tx.message.deleteMany({ where: { senderId: id } });

      // Delete conversations where user is buyer or seller (and their messages)
      const conversations = await tx.conversation.findMany({
        where: { OR: [{ buyerId: id }, { sellerId: id }] },
        select: { id: true },
      });
      const convIds = conversations.map((c) => c.id);
      if (convIds.length > 0) {
        await tx.message.deleteMany({ where: { conversationId: { in: convIds } } });
        await tx.conversation.deleteMany({ where: { id: { in: convIds } } });
      }

      // Delete user's products and related data
      const products = await tx.product.findMany({
        where: { userId: id },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);
      if (productIds.length > 0) {
        await tx.favorite.deleteMany({ where: { productId: { in: productIds } } });
        await tx.report.deleteMany({ where: { productId: { in: productIds } } });
        await tx.priceProposal.deleteMany({ where: { productId: { in: productIds } } });
        await tx.product.deleteMany({ where: { userId: id } });
      }

      // Delete other user data
      await tx.favorite.deleteMany({ where: { userId: id } });
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.report.deleteMany({ where: { reporterId: id } });
      await tx.review.deleteMany({ where: { OR: [{ reviewerId: id }, { reviewedId: id }] } });
      await tx.priceProposal.deleteMany({ where: { OR: [{ buyerId: id }, { sellerId: id }] } });
      await tx.keywordAlert.deleteMany({ where: { userId: id } });

      // Finally delete the user
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, name: targetUser.name });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
