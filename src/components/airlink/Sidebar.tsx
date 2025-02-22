"use client";

import { useEffect, FC } from "react";
import { Box, User2, LogOutIcon, Users, Database, ImageIcon, Sliders, Server } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/lib/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { Separator } from "@/components/shadcn/separator";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const user = useAuth((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        useAuth.getState().setUser(null);
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile, setIsSidebarOpen]);

  return (
    <aside
      className={cn(
        "h-screen top-0 fixed left-0 pt-14 w-60 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out z-40",
        !isSidebarOpen && "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* User Profile */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="ring-1 ring-border">
              <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.username || 'guest'}`} />
              <AvatarFallback>{user?.username?.[0]?.toUpperCase() || 'G'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium tracking-tight">{user?.username || 'Unknown'}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{user?.description || 'No description'}</div>
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Main Navigation */}
        <nav className="px-2 space-y-1">
          <Button 
            variant={isActive('/dashboard') ? "secondary" : "ghost"} 
            className={cn(
              "w-full justify-start font-medium",
              isActive('/dashboard') && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            onClick={() => router.push('/dashboard')}
          >
            <Box className="mr-2.5 size-4" />
            Servers
          </Button>
          <Button 
            variant={isActive('/account') ? "secondary" : "ghost"} 
            className={cn(
              "w-full justify-start font-medium",
              isActive('/account') && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            onClick={() => router.push('/account')}
          >
            <User2 className="mr-2.5 size-4" />
            Account
          </Button>
        </nav>

        {/* Admin Panel */}
        <div className="px-2 mt-6">
          <div className="text-sm font-medium text-muted-foreground px-3 mb-2">Admin Panel</div>
          <nav className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground/90 font-medium hover:bg-primary/10 hover:text-primary"
            >
              <Box className="mr-2.5 size-4" />
              Overview
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground/90 font-medium hover:bg-primary/10 hover:text-primary"
            >
              <Sliders className="mr-2.5 size-4" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground/90 font-medium hover:bg-primary/10 hover:text-primary"
            >
              <Server className="mr-2.5 size-4" />
              Servers
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground/90 font-medium hover:bg-primary/10 hover:text-primary"
            >
              <Users className="mr-2.5 size-4" />
              Users
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground/90 font-medium hover:bg-primary/10 hover:text-primary"
            >
              <Database className="mr-2.5 size-4" />
              Nodes
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground/90 font-medium hover:bg-primary/10 hover:text-primary"
            >
              <ImageIcon className="mr-2.5 size-4" />
              Images
            </Button>
          </nav>
        </div>

        <Separator className="mt-6" />

        <div className="mt-auto p-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2.5 size-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
