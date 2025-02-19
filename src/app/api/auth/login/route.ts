import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Missing credentials. Please try again.' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.users.findFirst({
        where: { OR: [{ email: username }, { username }] },
      });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: 'Login successful' });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' + error },
      { status: 500 }
    );
  }
}
