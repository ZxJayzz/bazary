import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { randomBytes } from "crypto";
import { validatePassword } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// POST: Request password reset (generates a token)
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 reset requests per 15 minutes per IP
    const ip = getClientIp(request.headers);
    const limited = rateLimit(`reset-request:${ip}`, 3, 15 * 60 * 1000);
    if (limited) return limited;

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate secure random token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // In production: send email with reset link containing token
    // For MVP/development: return token in response
    return NextResponse.json({
      success: true,
      // Remove this in production - only for development
      resetToken: process.env.NODE_ENV === "development" ? token : undefined,
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Actually reset the password (requires valid token)
export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Find valid, unused, non-expired token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 });
    }

    if (resetToken.used) {
      return NextResponse.json({ error: "Token has already been used" }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Check new password is not same as current
    if (resetToken.user.password) {
      const isSame = await compare(newPassword, resetToken.user.password);
      if (isSame) {
        return NextResponse.json(
          { error: "New password must be different from current password" },
          { status: 400 }
        );
      }
    }

    // Hash and update password, mark token as used
    const hashedPassword = await hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
