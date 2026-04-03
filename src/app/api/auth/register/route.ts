import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { RateLimiter } from '@/lib/rateLimit';

const registerLimiter = new RateLimiter(20, 60_000);

function checkRateLimit(ip: string): boolean {
  return registerLimiter.check(ip);
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { email, username, password } = body as Record<string, string>;

  if (!email || !username || !password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  if (!emailRegex.test(email) || !passwordRegex.test(password)) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  if (!usernameRegex.test(username)) {
    return NextResponse.json({ error: 'invalid_username' }, { status: 400 });
  }

  const userCount = await prisma.users.count();
  const isFirstUser = userCount === 0;

  if (!isFirstUser) {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings?.allowRegistration) {
      return NextResponse.json({ error: 'registration_disabled' }, { status: 403 });
    }
  }

  const existing = await prisma.users.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    return NextResponse.json({ error: 'user_exists' }, { status: 409 });
  }

  await prisma.users.create({
    data: {
      email,
      username,
      password: await bcrypt.hash(password, 12),
      description: 'No About Me',
      isAdmin: isFirstUser,
    },
  });

  return NextResponse.json({ success: true });
}
