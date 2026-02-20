import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        district: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, city, district, image } = body;

    // Validate fields
    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
    }

    if (name !== undefined && name.trim().length > 100) {
      return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
    }

    if (phone !== undefined && phone !== null && typeof phone !== "string") {
      return NextResponse.json({ error: "Phone must be a string" }, { status: 400 });
    }

    if (city !== undefined && (typeof city !== "string" || city.trim().length === 0)) {
      return NextResponse.json({ error: "City must be a non-empty string" }, { status: 400 });
    }

    if (district !== undefined && district !== null && typeof district !== "string") {
      return NextResponse.json({ error: "District must be a string" }, { status: 400 });
    }

    if (image !== undefined && image !== null && typeof image !== "string") {
      return NextResponse.json({ error: "Image must be a URL string" }, { status: 400 });
    }

    // Build update data with only provided fields
    const updateData: Record<string, string | null> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (city !== undefined) updateData.city = city.trim();
    if (district !== undefined) updateData.district = district ? district.trim() : null;
    if (image !== undefined) updateData.image = image || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        district: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
