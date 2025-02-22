"use client";

import { useEffect, FC } from "react";
import { Home, Settings, LogOut, Activity, ScrollText, Folder, Database, Network, Shield } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/lib/store/auth-store";
import { useRouter, usePathname } from "next/navigation";

interface ConsoleSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const ConsoleSidebar: FC<ConsoleSidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setUser(null);
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
        "h-screen top-0 fixed left-0 pt-14 w-60 border-r bg-background transition-transform duration-300 ease-in-out sm:w-48 md:w-60",
        !isSidebarOpen && "-translate-x-full z-40"
      )}
    >
      <div className="flex flex-col h-full">
        {/* User Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.username || 'guest'}`} />
              <AvatarFallback>{user?.username?.[0]?.toUpperCase() || 'G'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user?.username || 'Unknown'}</div>
              <div className="text-sm text-muted-foreground">{user?.description || 'No description'}</div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-2 space-y-1">
          <Button variant="secondary" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>

        {/* Server Management */}
        <div className="p-2 border-t mt-4">
          <div className="text-sm font-medium text-muted-foreground px-2 py-1.5">Management</div>
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Activity className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <ScrollText className="mr-2 h-4 w-4" />
              Logs
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Folder className="mr-2 h-4 w-4" />
              File Manager
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Database className="mr-2 h-4 w-4" />
              Databases
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Network className="mr-2 h-4 w-4" />
              Networking
            </Button>
            <Button variant="ghost" className="w-full justify-start text-foreground">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </Button>
          </nav>
        </div>

        {/* Logout */}
        <div className="mt-auto p-2 border-t">
          <Button 
            variant="destructiveSecondary" 
            className="w-full justify-start text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default ConsoleSidebar;