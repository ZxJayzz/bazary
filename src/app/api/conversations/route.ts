import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        product: {
          select: { id: true, title: true, price: true, images: true, status: true },
        },
        buyer: {
          select: { id: true, name: true, image: true, city: true },
        },
        seller: {
          select: { id: true, name: true, image: true, city: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, senderId: true, read: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, sellerId, message } = await request.json();

    if (!productId || !sellerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buyerId = session.user.id;

    if (buyerId === sellerId) {
      return NextResponse.json({ error: "Cannot start conversation with yourself" }, { status: 400 });
    }

    // Check if conversation already exists for this buyer-seller-product combo
    const existing = await prisma.conversation.findFirst({
      where: { productId, buyerId, sellerId },
    });

    if (existing) {
      // If a message was provided, add it to the existing conversation
      if (message) {
        await prisma.message.create({
          data: {
            content: message,
            conversationId: existing.id,
            senderId: buyerId,
          },
        });
        await prisma.conversation.update({
          where: { id: existing.id },
          data: { updatedAt: new Date() },
        });
      }
      return NextResponse.json(existing);
    }

    // Create new conversation with optional first message
    const conversation = await prisma.conversation.create({
      data: {
        productId,
        buyerId,
        sellerId,
        ...(message
          ? {
              messages: {
                create: {
                  content: message,
                  senderId: buyerId,
                },
              },
            }
          : {}),
      },
      include: {
        product: {
          select: { id: true, title: true, price: true, images: true, status: true },
        },
        buyer: {
          select: { id: true, name: true, image: true, city: true },
        },
        seller: {
          select: { id: true, name: true, image: true, city: true },
        },
        messages: true,
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
