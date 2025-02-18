"use client";

import { useEffect, FC } from "react";
import { Box, User2, Settings, Users, Database, ImageIcon, LogOut, Server } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile, setIsSidebarOpen]);

  return (
    <aside
      className={cn(
        "h-screen top-0 fixed left-0 pt-14 w-60 border-r bg-background transition-transform duration-300 ease-in-out sm:w-48 md:w-60",
        !isSidebarOpen && "-translate-x-full z-40"
      )}
    >
      <div className="flex flex-col h-full">
        {/* User Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/9.x/thumbs/svg?seed=4eplz" />
              <AvatarFallback>4E</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">4eplz</div>
              <div className="text-sm text-muted-foreground">No About Me</div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-2 space-y-1">
          <Button variant="secondary" className="w-full justify-start">
            <Box className="mr-2 h-4 w-4" />
            Servers
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <User2 className="mr-2 h-4 w-4" />
            Account
          </Button>
        </nav>

        {/* Admin Panel */}
        <div className="p-2 border-t mt-4">
          <div className="text-sm font-medium text-muted-foreground px-2 py-1.5">Admin Panel</div>
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Box className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Server className="mr-2 h-4 w-4" />
              Servers
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Database className="mr-2 h-4 w-4" />
              Nodes
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <ImageIcon className="mr-2 h-4 w-4" />
              Images
            </Button>
          </nav>
        </div>

        {/* Logout */}
        <div className="mt-auto p-2 border-t">
          <Button variant="destructive" className="w-full justify-start text-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
