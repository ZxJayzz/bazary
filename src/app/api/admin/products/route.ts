import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator, isErrorResponse } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireModerator();
    if (isErrorResponse(authResult)) return authResult;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const hiddenParam = searchParams.get("hidden");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (hiddenParam !== null) {
      where.hidden = hiddenParam === "true";
    }

    const [products, total, categoryCounts] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          category: true,
          status: true,
          hidden: true,
          views: true,
          city: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: { reports: true, favorites: true, conversations: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.product.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      categoryCounts: categoryCounts.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
    });
  } catch (error) {
    console.error("Admin products list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
