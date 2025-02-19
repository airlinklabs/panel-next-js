import { clsx, type ClassValue } from "clsx"
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

export const getStatusStyles = (status: 'Online' | 'Starting' | 'Stopped') => {
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
