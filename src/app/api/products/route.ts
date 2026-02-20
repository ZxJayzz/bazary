import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const city = searchParams.get("city");
  const district = searchParams.get("district");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};

  if (city) where.city = city;
  if (district) where.district = district;
  if (category) where.category = category;

  // Default to "available" unless status is explicitly set
  if (status) {
    where.status = status;
  } else {
    where.status = "available";
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseInt(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseInt(maxPrice);
  }

  // Determine sort order
  let orderBy: Record<string, string>;
  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { user: { select: { id: true, name: true, city: true } } },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, price, images, category, city, district, userId } = body;

    if (!title || !description || price === undefined || !category || !city || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseInt(price),
        images: images || JSON.stringify(["/images/placeholder.svg"]),
        category,
        city,
        district: district || null,
        userId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
