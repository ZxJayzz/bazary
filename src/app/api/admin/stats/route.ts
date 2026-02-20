import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireModerator, isErrorResponse } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireModerator();
    if (isErrorResponse(authResult)) return authResult;
    const { userId, role } = authResult;

    const isAdmin = role === "admin";

    // Basic stats (available to both admin and moderator)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalProducts, newUsersToday, pendingReports] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.user.count({
          where: { createdAt: { gte: today } },
        }),
        prisma.report.count({
          where: { status: "pending" },
        }),
      ]);

    const basicStats = {
      totalUsers,
      totalProducts,
      newUsersToday,
      pendingReports,
    };

    // Admin gets extended stats
    if (isAdmin) {
      const [categoryStats, recentReports, recentUsers] = await Promise.all([
        prisma.product.groupBy({
          by: ["category"],
          _count: { id: true },
        }),
        prisma.report.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            product: { select: { id: true, title: true } },
            reporter: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        }),
      ]);

      return NextResponse.json({
        ...basicStats,
        categoryStats: categoryStats.map((c) => ({
          category: c.category,
          count: c._count.id,
        })),
        recentReports,
        recentUsers,
      });
    }

    // Moderator gets basic stats only
    return NextResponse.json(basicStats);
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
