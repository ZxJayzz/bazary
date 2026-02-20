import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await prisma.keywordAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching keyword alerts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyword } = await request.json();
    if (!keyword || keyword.trim().length < 2) {
      return NextResponse.json({ error: "Keyword must be at least 2 characters" }, { status: 400 });
    }

    // Check max 30 alerts
    const count = await prisma.keywordAlert.count({
      where: { userId: session.user.id },
    });
    if (count >= 30) {
      return NextResponse.json({ error: "Maximum 30 keyword alerts allowed" }, { status: 400 });
    }

    const alert = await prisma.keywordAlert.create({
      data: {
        userId: session.user.id,
        keyword: keyword.trim().toLowerCase(),
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Keyword already exists" }, { status: 409 });
    }
    console.error("Error creating keyword alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    const alert = await prisma.keywordAlert.findUnique({ where: { id } });
    if (!alert || alert.userId !== session.user.id) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    await prisma.keywordAlert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting keyword alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
