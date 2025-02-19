import { Edit, Trash2, TerminalIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Progress } from "@/components/shadcn/progress";
import { Server } from "@/lib/utils";
import { Badge } from "@/components/shadcn/badge";
interface ServerCardProps {
  server: Server;
}

const getStatusStyles = (status: "Online" | "Starting" | "Stopped") => {
  switch (status) {
    case "Online":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/15";
    case "Starting":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/15";
    case "Stopped":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/15";
    default:
      return "";
  }
};

const getProgressColor = (value: number) => {
  if (value >= 90) return "bg-red-500";
  if (value > 75) return "bg-yellow-500";
  return "bg-zinc-800";
};

const ServerCard: React.FC<ServerCardProps> = ({ server }) => {
  const memoryUsage = (parseInt(server.memoryUsage.split("/")[0]) / parseInt(server.memoryUsage.split("/")[1])) * 100;
  const diskUsage = (parseInt(server.diskUsage.split("/")[0]) / parseInt(server.diskUsage.split("/")[1])) * 100;
  const cpuUsage = server.status !== "Stopped" ? parseFloat(server.cpuUsage) : 0;

  return (
    <Card key={server.uuid} className="w-full text-white border-zinc-800 ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-medium">{server.name}</span>
          <span className="text-sm text-zinc-400">ID: {server.uuid}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusStyles(server.status)} transition-colors delay-200 cursor-pointer`}>{server.status.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
      <div className="space-y-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Memory</span>
            <span className="text-zinc-400">{server.memoryUsage}</span>
          </div>
          <Progress value={memoryUsage} className={`${getProgressColor(memoryUsage)}`} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">CPU</span>
            <span className="text-zinc-400">{server.cpuUsage}</span>
          </div>
          <Progress value={cpuUsage} className={`${getProgressColor(cpuUsage)}`} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Disk</span>
            <span className="text-zinc-400">{server.diskUsage}</span>
          </div>
          <Progress value={diskUsage} className={`${getProgressColor(diskUsage)}`} />
        </div>
       </div>
        <Button variant="outline" className="aspect-square max-sm:p-0 w-full mt-4">
          <TerminalIcon className="opacity-60 sm:-ms-1 sm:me-2" size={16} strokeWidth={2} aria-hidden="true" />
          <span>Manage Server</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServerCard;
