import { Edit, Trash2, TerminalIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Progress } from "@/components/shadcn/progress";
import { Server } from "@/lib/utils";

interface ServerCardProps {
  server: Server;
}
const getStatusStyles = (status: 'Online' | 'Starting' | 'Stopped') => {
    switch (status) {
      case 'Online':
        return 'bg-green-500/10 text-green-500';
      case 'Starting':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Stopped':
        return 'bg-red-500/10 text-red-500';
      default:
        return '';
    }
  };

const ServerCard: React.FC<ServerCardProps> = ({ server }) => {
  return (
    <Card key={server.uuid} className="w-full text-white border-zinc-800 ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{server.name}</span>
          <span className="text-xs text-zinc-500">UUID: {server.uuid}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Memory</span>
            <span className="text-zinc-400">{server.memoryUsage}</span>
          </div>
          <Progress value={(parseInt(server.memoryUsage.split('/')[0]) / parseInt(server.memoryUsage.split('/')[1])) * 100} className="h-1 bg-zinc-800" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">CPU</span>
            <span className="text-zinc-400">{server.cpuUsage}</span>
          </div>
          <Progress value={server.status !== 'Stopped' ? parseFloat(server.cpuUsage) : 0} className="h-1 bg-zinc-800" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Disk</span>
            <span className="text-zinc-400">{server.diskUsage}</span>
          </div>
          <Progress value={(parseInt(server.diskUsage.split('/')[0]) / parseInt(server.diskUsage.split('/')[1])) * 100} className="h-1 bg-zinc-800" />
        </div>
        <div className={`rounded py-1.5 text-center text-xs font-medium   ${getStatusStyles(server.status)}`}>
          {server.status.toUpperCase()}
        </div>
        <Button variant="outline" className="aspect-square max-sm:p-0 w-full">
          <TerminalIcon className="opacity-60 sm:-ms-1 sm:me-2" size={16} strokeWidth={2} aria-hidden="true" />
          <span className="max-sm:sr-only">Manage Server</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServerCard;
