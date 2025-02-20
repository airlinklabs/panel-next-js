import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json();
    const user = await prisma.users.findFirst({
      where: { id: id },
      select: { password: true }
    });

    if (!user) {
      return NextResponse.json({ valid: false });
    }

    const isValid = await bcrypt.compare(password, user.password);
    return NextResponse.json({ valid: isValid });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred validating the password' },
      { status: 500 }
    );
  }
} 