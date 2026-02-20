import { NextResponse } from "next/server";
import { auth } from "./auth";
import { prisma } from "./prisma";

interface AdminAuthResult {
  userId: string;
  role: string;
}

export async function requireAdmin(): Promise<AdminAuthResult | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { userId: user.id, role: user.role };
}

export async function requireModerator(): Promise<AdminAuthResult | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { userId: user.id, role: user.role };
}

export function isErrorResponse(result: AdminAuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
