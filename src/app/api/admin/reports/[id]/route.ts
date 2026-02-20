import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator, isErrorResponse } from "@/lib/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireModerator();
    if (isErrorResponse(authResult)) return authResult;
    const { role } = authResult;

    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, productId: true, status: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, hideProduct } = body;

    // Validate status
    const validStatuses = ["reviewed", "resolved"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Moderators can only mark as reviewed, not resolved
    if (role === "moderator" && status === "resolved") {
      return NextResponse.json(
        { error: "Moderators can only mark reports as reviewed. Only admins can resolve reports." },
        { status: 403 }
      );
    }

    // Update report and optionally hide the product
    const updatedReport = await prisma.$transaction(async (tx) => {
      if (hideProduct === true) {
        await tx.product.update({
          where: { id: report.productId },
          data: { hidden: true },
        });
      }

      return tx.report.update({
        where: { id },
        data: { status },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              status: true,
              hidden: true,
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Admin report update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
