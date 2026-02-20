import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const userId = session.user.id;

    const count = await prisma.message.count({
      where: {
        senderId: { not: userId },
        read: false,
        conversation: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ count: 0 });
  }
}
