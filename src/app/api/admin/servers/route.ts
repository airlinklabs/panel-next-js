import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'
import { daemonUrl, daemonScheme } from '@/lib/daemon'
import axios from 'axios'
import { Buffer } from 'buffer'
import { toInt, badInt } from '@/lib/rateLimit'

async function requireAdmin(req: NextRequest) {
  const res = NextResponse.next()
  const session = await getSessionFromRequest(req, res)
  if (!session.user?.isAdmin) return null
  return session.user
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const servers = await prisma.server.findMany({
    include: { node: true, owner: true, image: true },
  })
  return NextResponse.json({ servers })
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { name, description, nodeId, imageId, Ports, Memory, Cpu, Storage, dockerImage, variables, ownerId, allowStartupEdit } = body

  if (!name || !nodeId || !imageId || !Ports || !Memory || !Cpu || !Storage || !ownerId) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const node = await prisma.node.findUnique({ where: { id: toInt(nodeId) } })
  if (!node) return NextResponse.json({ error: 'Node not found.' }, { status: 404 })

  const image = await prisma.images.findUnique({ where: { id: toInt(imageId) } })
  if (!image) return NextResponse.json({ error: 'Image not found.' }, { status: 404 })

  // Ports comes in as a plain port number string like "25565"
  const portNumber = parseInt(String(Ports).split(':')[0])
  if (isNaN(portNumber)) {
    return NextResponse.json({ error: 'Invalid port.' }, { status: 400 })
  }

  // Check the port is allocated to this node
  let allocatedPorts: number[] = []
  try {
    allocatedPorts = JSON.parse(node.allocatedPorts || '[]')
  } catch {}

  if (!allocatedPorts.includes(portNumber)) {
    return NextResponse.json({ error: `Port ${portNumber} is not allocated to this node.` }, { status: 400 })
  }

  // Check the port is not already taken by another server on this node
  const nodeServers = await prisma.server.findMany({ where: { nodeId: toInt(nodeId) } })
  for (const srv of nodeServers) {
    try {
      const srvPorts = JSON.parse(srv.Ports || '[]')
      for (const p of srvPorts) {
        const used = parseInt(String(p.Port).split(':')[0])
        if (used === portNumber) {
          return NextResponse.json({ error: `Port ${portNumber} is already in use by server "${srv.name}".` }, { status: 400 })
        }
      }
    } catch {}
  }

  // Find the docker image object from the image's dockerImages list
  let dockerImages: { [key: string]: string }[] = []
  try {
    dockerImages = JSON.parse(image.dockerImages || '[]')
  } catch {}

  const matchedDockerEntry = dockerImages.find(entry => Object.keys(entry).includes(dockerImage))
  if (!matchedDockerEntry) {
    return NextResponse.json({ error: 'Selected Docker image not found in this image.' }, { status: 400 })
  }

  if (!image.startup) {
    return NextResponse.json({ error: 'Image has no startup command.' }, { status: 400 })
  }

  // Merge submitted variable values into the image variable definitions
  let imageVariables: Record<string, unknown>[] = []
  try {
    imageVariables = JSON.parse(image.variables || '[]')
  } catch {}

  const submittedVars: { env_variable?: string; env?: string; value?: unknown }[] = Array.isArray(variables) ? variables : []
  const mergedVariables = imageVariables.map(imgVar => {
    const envKey = String(imgVar.env_variable ?? imgVar.env ?? '')
    const submitted = submittedVars.find(sv => String(sv.env_variable ?? sv.env ?? '') === envKey)
    return { ...imgVar, value: submitted?.value ?? imgVar.default_value ?? '' }
  })

  const portsJson = JSON.stringify([{ Port: `${portNumber}:${portNumber}`, primary: true }])

  const nOwnerId = toInt(ownerId);
  const nNodeId = toInt(nodeId);
  const nImageId = toInt(imageId);
  const nMemory = toInt(Memory);
  const nCpu = toInt(Cpu);
  const nStorage = toInt(Storage);

  if (badInt(nOwnerId, nNodeId, nImageId, nMemory, nCpu, nStorage)) {
    return NextResponse.json({ error: 'Invalid numeric fields.' }, { status: 400 });
  }

  const server = await prisma.server.create({
    data: {
      name,
      description: description || '',
      ownerId: nOwnerId,
      nodeId: nNodeId,
      imageId: nImageId,
      Ports: portsJson,
      Memory: nMemory,
      Cpu: nCpu,
      Storage: nStorage,
      dockerImage: JSON.stringify(matchedDockerEntry),
      Variables: JSON.stringify(mergedVariables),
      StartCommand: image.startup,
      allowStartupEdit: allowStartupEdit === true || allowStartupEdit === 'true',
      Installing: true,
      Queued: true,
    },
    include: { node: true, image: true },
  })

  // Run the install asynchronously so the response returns immediately
  runInstall(server, portNumber).catch(() => {})

  return NextResponse.json({ success: true, server })
}

async function runInstall(
  server: Awaited<ReturnType<typeof prisma.server.create>> & {
    node: { address: string; port: number; key: string }
    image: { scripts: string | null; stop: string | null }
  },
  portNumber: number
) {
  // Build env vars the same way Express does
  let envVars: Record<string, unknown>[] = []
  try {
    envVars = JSON.parse(server.Variables || '[]')
    envVars = envVars.map((v: Record<string, unknown>) => ({
      env: String(v.env_variable ?? v.env ?? ''),
      value: v.value ?? v.default_value ?? '',
    }))
    envVars.push({ env: 'SERVER_PORT', value: String(portNumber) })
    envVars.push({ env: 'SERVER_MEMORY', value: String(server.Memory) })
    envVars.push({ env: 'SERVER_CPU', value: String(server.Cpu) })
  } catch {
    await prisma.server.update({ where: { id: server.id }, data: { Queued: false } })
    return
  }

  const env = (envVars as { env: string; value: unknown }[]).reduce<Record<string, unknown>>((acc, curr) => {
    acc[curr.env] = curr.value
    return acc
  }, {})

  const scheme = await daemonScheme()
  const base = `${scheme}://${server.node.address}:${server.node.port}`
  const authHeader = `Basic ${Buffer.from(`Airlink:${server.node.key}`).toString('base64')}`
  const headers = { 'Content-Type': 'application/json', Authorization: authHeader }

  let scripts: Record<string, unknown> = {}
  try {
    scripts = JSON.parse(server.image?.scripts || '{}')
  } catch {
    await prisma.server.update({ where: { id: server.id }, data: { Queued: false } })
    return
  }

  try {
    if (scripts.installation && typeof scripts.installation === 'object') {
      // Pterodactyl egg format
      const installation = scripts.installation as { script: string; container: string; entrypoint: string }
      await axios.post(
        `${base}/container/installer`,
        {
          id: server.UUID,
          script: installation.script,
          container: installation.container,
          entrypoint: installation.entrypoint || 'bash',
          env,
        },
        { headers, timeout: 600000 },
      )
    } else if (Array.isArray(scripts.install)) {
      // Legacy ALC format
      let dockerImageValue: string | undefined
      try {
        const parsed = JSON.parse(server.dockerImage || '{}')
        dockerImageValue = Object.values(parsed)[0] as string | undefined
      } catch {}

      await axios.post(
        `${base}/container/install`,
        {
          id: server.UUID,
          image: dockerImageValue,
          env,
          scripts: (scripts.install as { url: string; onStart: boolean; ALVKT: string; fileName: string }[]).map(s => ({
            url: s.url,
            onStartup: s.onStart,
            ALVKT: s.ALVKT,
            fileName: s.fileName,
          })),
        },
        { headers },
      )

      if (scripts.native && typeof scripts.native === 'object') {
        const native = scripts.native as { CMD: string; container: string }
        await axios.post(
          `${base}/container/installer`,
          { id: server.UUID, env, script: native.CMD, container: native.container, entrypoint: 'bash' },
          { headers, timeout: 600000 },
        )
      }
    }
    // If no scripts at all, just mark as done
  } catch {}

  await prisma.server.update({ where: { id: server.id }, data: { Queued: false } })
}
