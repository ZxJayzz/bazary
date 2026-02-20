import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const buyerId = session.user.id;
    const body = await request.json();
    const { proposedPrice } = body;

    // Validate proposedPrice
    if (!proposedPrice || typeof proposedPrice !== "number" || proposedPrice <= 0) {
      return NextResponse.json({ error: "proposedPrice must be a positive number" }, { status: 400 });
    }

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, price: true, status: true, negotiable: true, userId: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validate product is available
    if (product.status !== "available") {
      return NextResponse.json({ error: "Product is not available" }, { status: 400 });
    }

    // Validate product is negotiable
    if (!product.negotiable) {
      return NextResponse.json({ error: "This product does not accept price proposals" }, { status: 400 });
    }

    // Buyer cannot be the seller
    if (buyerId === product.userId) {
      return NextResponse.json({ error: "You cannot propose a price on your own product" }, { status: 400 });
    }

    // Validate proposedPrice is less than product price
    if (proposedPrice >= product.price) {
      return NextResponse.json({ error: "Proposed price must be less than the product price" }, { status: 400 });
    }

    // Check if a pending proposal already exists from this buyer
    const existingProposal = await prisma.priceProposal.findUnique({
      where: {
        buyerId_productId: {
          buyerId,
          productId,
        },
      },
    });

    if (existingProposal && existingProposal.status === "pending") {
      return NextResponse.json({ error: "You already have a pending proposal for this product" }, { status: 409 });
    }

    // If a previous proposal exists but was rejected, we can create a new one by updating
    let proposal;
    if (existingProposal) {
      proposal = await prisma.priceProposal.update({
        where: { id: existingProposal.id },
        data: {
          proposedPrice: Math.round(proposedPrice),
          status: "pending",
        },
        include: {
          product: { select: { id: true, title: true, price: true } },
          buyer: { select: { id: true, name: true } },
        },
      });
    } else {
      proposal = await prisma.priceProposal.create({
        data: {
          productId,
          buyerId,
          sellerId: product.userId,
          proposedPrice: Math.round(proposedPrice),
        },
        include: {
          product: { select: { id: true, title: true, price: true } },
          buyer: { select: { id: true, name: true } },
        },
      });
    }

    // Create notification for seller
    await prisma.notification.create({
      data: {
        userId: product.userId,
        type: "price_proposal",
        title: "Proposition de prix",
        message: `Proposition de prix: ${Math.round(proposedPrice)} Ar pour ${product.title}`,
        link: `/product/${productId}`,
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Error creating price proposal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
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

    // Check if the user is the seller of this product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isSeller = product.userId === userId;

    const proposals = await prisma.priceProposal.findMany({
      where: {
        productId,
        ...(isSeller ? {} : { buyerId: userId }),
      },
      include: {
        buyer: { select: { id: true, name: true, image: true } },
        seller: { select: { id: true, name: true } },
        product: { select: { id: true, title: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
