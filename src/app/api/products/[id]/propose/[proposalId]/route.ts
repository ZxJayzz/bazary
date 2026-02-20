import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId, proposalId } = await params;
    const userId = session.user.id;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'accepted' or 'rejected'" }, { status: 400 });
    }

    // Fetch the proposal
    const proposal = await prisma.priceProposal.findUnique({
      where: { id: proposalId },
      include: {
        product: { select: { id: true, title: true, userId: true } },
        buyer: { select: { id: true, name: true } },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Verify proposal belongs to this product
    if (proposal.productId !== productId) {
      return NextResponse.json({ error: "Proposal does not belong to this product" }, { status: 400 });
    }

    // Only the seller can accept/reject
    if (proposal.sellerId !== userId) {
      return NextResponse.json({ error: "Only the seller can accept or reject proposals" }, { status: 403 });
    }

    // Check if proposal is still pending
    if (proposal.status !== "pending") {
      return NextResponse.json({ error: "This proposal has already been processed" }, { status: 400 });
    }

    // Update proposal status
    const updatedProposal = await prisma.priceProposal.update({
      where: { id: proposalId },
      data: { status },
      include: {
        product: { select: { id: true, title: true, price: true } },
        buyer: { select: { id: true, name: true, image: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    if (status === "accepted") {
      // Set product status to reserved
      await prisma.product.update({
        where: { id: productId },
        data: { status: "reserved" },
      });

      // Create notification for buyer
      await prisma.notification.create({
        data: {
          userId: proposal.buyerId,
          type: "proposal_accepted",
          title: "Proposition acceptée",
          message: "Votre proposition a été acceptée!",
          link: `/product/${productId}`,
        },
      });

      // Start a conversation if one doesn't exist
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          productId,
          buyerId: proposal.buyerId,
          sellerId: proposal.sellerId,
        },
      });

      if (!existingConversation) {
        await prisma.conversation.create({
          data: {
            productId,
            buyerId: proposal.buyerId,
            sellerId: proposal.sellerId,
          },
        });
      }
    } else {
      // Rejected - notify buyer
      await prisma.notification.create({
        data: {
          userId: proposal.buyerId,
          type: "proposal_rejected",
          title: "Proposition refusée",
          message: "Votre proposition a été refusée",
          link: `/product/${productId}`,
        },
      });
    }

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
