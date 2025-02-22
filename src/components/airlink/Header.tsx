"use client";

import { FC } from "react";
import { Search, Menu, Command } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const Header: FC<HeaderProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 flex justify-between items-center gap-4 px-4 sm:px-6 md:px-8">
      <div className="flex flex-row gap-5 items-center">
        <div className="flex items-center gap-3 font-semibold">
          <div className="relative size-8">
            <Image 
              src={resolvedTheme === 'dark' ? "/logo-dark.png" : "/logo-light.png"}
              alt="AirLink Logo" 
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg tracking-tight">AirLink</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "hover:bg-primary/10 hover:text-primary transition-colors",
            isSidebarOpen && "text-primary"
          )}
        >
          <Menu className="size-5" />
        </Button>
      </div>

      <div className="flex-1 flex justify-start ml-10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 pr-12 h-9 w-full rounded-full border bg-muted/50 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">{isMac ? <Command className="size-3" /> : "Ctrl"}</span> K
          </kbd>
        </div>
      </div>
    </header>
  );
};

export default Header;
