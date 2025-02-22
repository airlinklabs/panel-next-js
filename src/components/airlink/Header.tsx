"use client";

import { FC } from "react";
import { Search, Menu, Command } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import Image from "next/image";
import { useTheme } from "next-themes";

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const Header: FC<HeaderProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b z-50 flex justify-between items-center gap-4 px-4 sm:px-6 md:px-8">
      <div className="flex flex-row gap-5">
        <div className="flex items-center justify-center gap-2 font-semibold">
          <Image 
            src={resolvedTheme === 'dark' ? "/logo-dark.png" : "/logo-light.png"}
            alt="AirLink Logo" 
            width={40} 
            height={40}
            className="object-contain"
          />
          AirLink
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex justify-start ml-10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 pr-12 py-2 w-full rounded-xl border bg-muted text-sm focus:ring-2 focus:ring-primary"
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-6 items-center rounded-md bg-neutral-800 px-2 text-sm font-medium text-muted-foreground shadow border border-neutral-700">
            {isMac ? <Command className="h-4 w-4 mr-2" /> : "Ctrl"} + K
          </kbd>
        </div>
      </div>
    </header>
  );
};

export default Header;
