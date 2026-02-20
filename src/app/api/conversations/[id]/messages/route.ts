import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Mark unread messages from the other party as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: id },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId: id } }),
    ]);

    return NextResponse.json({
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId: id,
        senderId: userId,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Create notification for the recipient
    const recipientId =
      conversation.buyerId === userId
        ? conversation.sellerId
        : conversation.buyerId;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "new_message",
        title: message.sender.name,
        message: content.trim().substring(0, 50),
        link: "/chat",
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
