import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { toInt } from '@/lib/rateLimit';

async function requireAdmin(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSessionFromRequest(req, res);
  if (!session.user?.isAdmin) return null;
  return session.user;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const userId = toInt(id);
  if (isNaN(userId)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const target = await prisma.users.findUnique({
    where: { id: userId },
    include: { servers: { include: { node: true } }, loginHistory: { orderBy: { timestamp: 'desc' }, take: 10 } },
  });

  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { password: _, ...safe } = target;
  return NextResponse.json({ user: safe });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const targetId = toInt(id);
  if (isNaN(targetId)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const target = await prisma.users.findUnique({ where: { id: targetId } });
  if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { email, username, description, isAdmin, password, serverLimit, maxMemory, maxCpu, maxStorage } = body;

  if (email && email !== target.email) {
    const clash = await prisma.users.findFirst({ where: { email, id: { not: targetId } } });
    if (clash) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
  }

  if (username && username !== target.username) {
    const clash = await prisma.users.findFirst({ where: { username, id: { not: targetId } } });
    if (clash) return NextResponse.json({ error: 'Username already in use.' }, { status: 409 });
  }

  const data: Record<string, unknown> = {};
  if (email) data.email = email;
  if (username) data.username = username;
  if (description !== undefined) data.description = description;
  if (isAdmin !== undefined) data.isAdmin = isAdmin === true || isAdmin === 'true';
  if (serverLimit !== undefined) data.serverLimit = serverLimit === '' || serverLimit === null ? null : toInt(serverLimit);
  if (maxMemory !== undefined) data.maxMemory = maxMemory === '' || maxMemory === null ? null : toInt(maxMemory);
  if (maxCpu !== undefined) data.maxCpu = maxCpu === '' || maxCpu === null ? null : toInt(maxCpu);
  if (maxStorage !== undefined) data.maxStorage = maxStorage === '' || maxStorage === null ? null : toInt(maxStorage);
  if (password && password.trim()) data.password = await bcrypt.hash(password, 10);

  await prisma.users.update({ where: { id: targetId }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const userId = toInt(id);
  if (isNaN(userId)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  await prisma.users.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
