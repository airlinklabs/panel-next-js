import { NextRequest, NextResponse } from 'next/server';
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
  const nodeId = toInt(id);
  if (isNaN(nodeId)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    include: { servers: true },
  });

  if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ node });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const nodeId = toInt(id);
  if (isNaN(nodeId)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { name, ram, cpu, disk, address, port, allocatedPorts } = body;

  if (!name || isNaN(parseInt(ram)) || isNaN(parseInt(cpu)) || isNaN(parseInt(disk)) || !address || isNaN(parseInt(port))) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  try {
    const parsed = JSON.parse(allocatedPorts || '[]');
    if (!Array.isArray(parsed)) throw new Error('Must be array');
    for (const p of parsed) {
      if (typeof p !== 'number' || p < 1024 || p > 65535) throw new Error('Invalid port range');
    }
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Invalid allocated ports: ' + (e as Error).message }, { status: 400 });
  }

  const node = await prisma.node.update({
    where: { id: nodeId },
    data: {
      name,
      ram: parseInt(ram),
      cpu: parseInt(cpu),
      disk: parseInt(disk),
      address,
      port: parseInt(port),
      allocatedPorts: allocatedPorts || '[]',
    },
  });

  return NextResponse.json({ success: true, node });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const nodeId = toInt(id);
  if (isNaN(nodeId)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const url = new URL(req.url);
  const deleteInstances = url.searchParams.get('deleteInstances') === 'true';

  if (deleteInstances) {
    await prisma.server.deleteMany({ where: { nodeId } });
  }

  await prisma.node.delete({ where: { id: nodeId } });
  return NextResponse.json({ success: true });
}
