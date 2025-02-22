import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export interface Server {
  name: string;
  uuid: string;
  ram: string;
  cpu: string;
  disk: string;
  memoryUsage: string;
  cpuUsage: string;
  diskUsage: string;
  status: 'Online' | 'Starting' | 'Stopped';
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
