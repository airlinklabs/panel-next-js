"use client";

import { FC } from "react";
import { Search, Menu, Box } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Header: FC<HeaderProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b z-50 flex justify-between items-center gap-4 px-4 sm:px-6 md:px-8">
      <div className="flex flex-row gap-5">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center justify-center gap-2 font-semibold">
          <Box className="h-5 w-5" />
          AirLink
        </div>
      </div>

      <div className="flex-1 justify-end max-w-xl ml-4 sm:ml-6 md:ml-8">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-8 w-full bg-muted" />
          <kbd className="absolute right-2 top-2.5 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">CTRL</span>K
          </kbd>
        </div>
      </div>
    </header>
  );
};

export default Header;
