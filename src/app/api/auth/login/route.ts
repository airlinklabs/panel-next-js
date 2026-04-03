import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { RateLimiter } from '@/lib/rateLimit';

const loginLimiter = new RateLimiter(20, 60_000);

function checkRateLimit(ip: string): boolean {
  return loginLimiter.check(ip);
}

async function getSecuritySettings() {
  try {
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    return {
      maxAttempts: s?.loginMaxAttempts ?? 5,
      lockoutMinutes: s?.loginLockoutMinutes ?? 15,
    };
  } catch {
    return { maxAttempts: 5, lockoutMinutes: 15 };
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }

  const res = NextResponse.next();
  const body = await req.json().catch(() => ({}));
  const { identifier, password } = body as { identifier: string; password: string };

  if (!identifier || !password) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 400 });
  }

  const { maxAttempts, lockoutMinutes } = await getSecuritySettings();

  const user = await prisma.users.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  if (user && user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json({ error: 'account_locked', wait: minutesLeft }, { status: 403 });
  }

  const DUMMY_HASH = '$2b$10$abcdefghijklmnopqrstuvuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu';
  const hash = user?.password ?? DUMMY_HASH;
  const passwordValid = await bcrypt.compare(password, hash);

  if (!user || !passwordValid) {
    if (user) {
      const newAttempts = (user.loginAttempts ?? 0) + 1;
      const shouldLock = newAttempts >= maxAttempts;
      await prisma.users.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + lockoutMinutes * 60 * 1000) : null,
        },
      });
    }
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  await prisma.users.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockedUntil: null },
  });

  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || null;
  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      ipAddress,
      userAgent: req.headers.get('user-agent') || null,
    },
  });

  const response = NextResponse.json({ success: true });
  const session = await getSessionFromRequest(req, response);
  session.user = {
    id: user.id,
    email: user.email,
    username: user.username ?? '',
    isAdmin: user.isAdmin,
    description: user.description ?? '',
    avatar: user.avatar ?? null,
  };
  await session.save();
  return response;
}
