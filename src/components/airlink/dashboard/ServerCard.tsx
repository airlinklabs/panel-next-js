"use client"

import type React from "react"
import { Terminal, Cpu, MemoryStickIcon as Memory, HardDrive, ServerIcon, Activity } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/shadcn/card"
import { Progress } from "@/components/shadcn/progress"
import { Badge } from "@/components/shadcn/badge"
import type { Server } from "@/lib/utils"

interface ServerCardProps {
  server: Server
}

const getStatusStyles = (status: "Online" | "Starting" | "Stopped") => {
  switch (status) {
    case "Online":
      return "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20"
    case "Starting":
      return "bg-amber-500/15 text-amber-500 hover:bg-amber-500/20"
    case "Stopped":
      return "bg-destructive/15 text-destructive hover:bg-destructive/20"
    default:
      return ""
  }
}

const getProgressColor = (value: number) => {
  if (value >= 95) return "!bg-red-500"
  if (value >= 80) return "!bg-amber-500"
  return "!bg-primary"
}

const getStatusIcon = (status: "Online" | "Starting" | "Stopped") => {
  switch (status) {
    case "Online":
      return <Activity className="w-4 h-4" />
    case "Starting":
      return <Activity className="w-4 h-4 animate-pulse" />
    case "Stopped":
      return <Activity className="w-4 h-4" />
    default:
      return null
  }
}

const ServerCard: React.FC<ServerCardProps> = ({ server }) => {
  const memoryUsage =
    server.status === "Stopped"
      ? 0
      : (Number.parseInt(server.memoryUsage.split("/")[0]) / Number.parseInt(server.memoryUsage.split("/")[1])) * 100

  const diskUsage =
    server.status === "Stopped"
      ? 0
      : (Number.parseInt(server.diskUsage.split("/")[0]) / Number.parseInt(server.diskUsage.split("/")[1])) * 100

  const cpuUsage = server.status === "Stopped" ? 0 : Number.parseFloat(server.cpuUsage)

  return (
    <a href={`/dashboard/server/${server.uuid}/console`} className="block w-full">
      <Card className="w-full text-card-foreground border-border hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-card to-card/95">
        <div className="transition-all duration-300 group-hover:blur-[2px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <ServerIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold">{server.name}</span>
                <span className="text-xs text-muted-foreground font-mono">ID: {server.uuid}</span>
              </div>
            </div>
            <Badge
              className={`${getStatusStyles(server.status)} transition-colors duration-300 flex items-center gap-1.5`}
            >
              {getStatusIcon(server.status)}
              {server.status.toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Memory className="w-4 h-4" />
                    <span>Memory</span>
                  </div>
                  <span className="font-mono text-xs">{server.memoryUsage}</span>
                </div>
                <Progress
                  value={memoryUsage}
                  className="bg-zinc-950/50"
                  indicatorClassName={getProgressColor(memoryUsage)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cpu className="w-4 h-4" />
                    <span>CPU</span>
                  </div>
                  <span className="font-mono text-xs">{server.cpuUsage}</span>
                </div>
                <Progress value={cpuUsage} className="bg-zinc-950/50" indicatorClassName={getProgressColor(cpuUsage)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <HardDrive className="w-4 h-4" />
                    <span>Disk</span>
                  </div>
                  <span className="font-mono text-xs">{server.diskUsage}</span>
                </div>
                <Progress
                  value={diskUsage}
                  className="bg-zinc-950/50"
                  indicatorClassName={getProgressColor(diskUsage)}
                />
              </div>
            </div>
          </CardContent>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-black/60 to-black/70 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2">
            <Terminal className="w-10 h-10 text-white" />
            <span className="text-sm font-medium text-white">Open Console</span>
          </div>
        </div>
      </Card>
    </a>
  )
}

export default ServerCard

