"use client"

import type React from "react"
import { Terminal, Cpu, MemoryStickIcon as Memory, HardDrive, Server as ServerIcon, Activity } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/shadcn/card"
import { Progress } from "@/components/shadcn/progress"
import { Badge } from "@/components/shadcn/badge"
import type { Server } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"

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
      return <Activity className="size-4" />
    case "Starting":
      return <Activity className="size-4 animate-pulse" />
    case "Stopped":
      return <Activity className="size-4" />
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Link href={`/server/${server.uuid}/console`} className="block w-full">
        <Card className="w-full text-card-foreground border-border group relative overflow-hidden bg-gradient-to-br from-card to-card/95 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="transition-all duration-300 group-hover:blur-[1px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                  <ServerIcon className="size-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold tracking-tight">{server.name}</span>
                  <span className="text-xs text-muted-foreground font-mono mt-0.5">ID: {server.uuid}</span>
                </div>
              </div>
              <Badge
                className={`${getStatusStyles(server.status)} transition-colors duration-300 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium`}
              >
                {getStatusIcon(server.status)}
                {server.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Memory className="size-4" />
                      <span>Memory</span>
                    </div>
                    <span className="font-mono text-xs">{server.memoryUsage}</span>
                  </div>
                  <Progress
                    value={memoryUsage}
                    className="h-2 bg-muted"
                    indicatorClassName={getProgressColor(memoryUsage)}
                  />
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Cpu className="size-4" />
                      <span>CPU</span>
                    </div>
                    <span className="font-mono text-xs">{server.cpuUsage}</span>
                  </div>
                  <Progress 
                    value={cpuUsage} 
                    className="h-2 bg-muted" 
                    indicatorClassName={getProgressColor(cpuUsage)} 
                  />
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HardDrive className="size-4" />
                      <span>Disk</span>
                    </div>
                    <span className="font-mono text-xs">{server.diskUsage}</span>
                  </div>
                  <Progress
                    value={diskUsage}
                    className="h-2 bg-muted"
                    indicatorClassName={getProgressColor(diskUsage)}
                  />
                </div>
              </div>
            </CardContent>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-black/60 to-black/70 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 scale-90 group-hover:scale-100 transition-transform duration-300">
              <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/20">
                <Terminal className="size-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white">Open Console</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

export default ServerCard

