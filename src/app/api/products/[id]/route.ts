import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, phone: true, city: true, district: true, image: true, mannerTemp: true, createdAt: true },
        },
        _count: {
          select: {
            favorites: true,
            conversations: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Increment views count (fire and forget)
    prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({
      ...product,
      favoriteCount: product._count.favorites,
      conversationCount: product._count.conversations,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const VALID_STATUSES = ["available", "reserved", "sold"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify product exists
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Only the product owner can edit
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: you can only edit your own products" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, price, category, city, district, images, status, negotiable } = body;

    // Validate title
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json({ error: "Title must be a non-empty string" }, { status: 400 });
      }
      if (title.trim().length > 200) {
        return NextResponse.json({ error: "Title must be 200 characters or less" }, { status: 400 });
      }
    }

    // Validate description
    if (description !== undefined) {
      if (typeof description !== "string") {
        return NextResponse.json({ error: "Description must be a string" }, { status: 400 });
      }
    }

    // Validate price
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0 || !Number.isFinite(numPrice)) {
        return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
      }
    }

    // Validate category
    if (category !== undefined) {
      if (typeof category !== "string" || category.trim().length === 0) {
        return NextResponse.json({ error: "Category must be a non-empty string" }, { status: 400 });
      }
    }

    // Validate city
    if (city !== undefined) {
      if (typeof city !== "string" || city.trim().length === 0) {
        return NextResponse.json({ error: "City must be a non-empty string" }, { status: 400 });
      }
    }

    // Validate district
    if (district !== undefined && district !== null && typeof district !== "string") {
      return NextResponse.json({ error: "District must be a string" }, { status: 400 });
    }

    // Validate images (should be a JSON string of array or an array)
    if (images !== undefined) {
      if (typeof images === "string") {
        try {
          const parsed = JSON.parse(images);
          if (!Array.isArray(parsed)) {
            return NextResponse.json({ error: "Images must be a JSON array of URLs" }, { status: 400 });
          }
        } catch {
          return NextResponse.json({ error: "Images must be a valid JSON array string" }, { status: 400 });
        }
      } else if (Array.isArray(images)) {
        // Accept array and convert to JSON string
      } else {
        return NextResponse.json({ error: "Images must be a JSON array string or an array" }, { status: 400 });
      }
    }

    // Validate status
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Math.round(Number(price));
    if (category !== undefined) updateData.category = category.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (district !== undefined) updateData.district = district ? district.trim() : null;
    if (status !== undefined) updateData.status = status;
    if (images !== undefined) {
      updateData.images = Array.isArray(images) ? JSON.stringify(images) : images;
    }
    if (negotiable !== undefined) {
      updateData.negotiable = negotiable === true;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, city: true },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify product exists and check ownership
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: you can only delete your own products" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
