import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.users.update({
      where: { email: email },
      data: { password: hashedNewPassword },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        description: true
      }
    });

    return NextResponse.json({
      message: "Password updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the password" },
      { status: 500 }
    );
  }
}
