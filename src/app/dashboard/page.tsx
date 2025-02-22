"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/shadcn/button";
import { cn, Server } from "@/lib/utils";
import Header from "@/components/airlink/Header";
import Sidebar from "@/components/airlink/Sidebar";
import LoadingScreen from "@/components/airlink/LoadingScreen";
import ServerCard from "@/components/airlink/dashboard/ServerCard";
import { useRouter } from "next/navigation";
import { Server as ServerIcon } from "lucide-react";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [servers, setServers] = useState<Server[]>([
    { name: "Server1", uuid: "123e4567", ram: "8GB", cpu: "400%", disk: "50GB", memoryUsage: "8/16GB", cpuUsage: "50%", diskUsage: "25/50GB", status: 'Online' },
    { name: "Server2", uuid: "223e4567", ram: "6GB", cpu: "800%", disk: "100GB", memoryUsage: "16/32GB", cpuUsage: "70%", diskUsage: "50/100GB", status: 'Starting' },
    { name: "Server3", uuid: "323e4567", ram: "12GB", cpu: "1600%", disk: "200GB", memoryUsage: "32/64GB", cpuUsage: "90%", diskUsage: "100/200GB", status: 'Stopped' }
  ]);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (!response.ok) {
          router.push("/auth/login");
        }
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push("/auth/login");
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setServers(prevServers => prevServers.map(server => {
        if (server.status !== 'Stopped') {
          return {
            ...server,
            memoryUsage: `${Math.floor(Math.random() * parseInt(server.ram))}/${server.ram}`,
            cpuUsage: `${(Math.random() * 100).toFixed(1)}%`,
            diskUsage: `${Math.floor(Math.random() * parseInt(server.disk))}/${server.disk}`
          };
        }
        return server;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LoadingScreen loading={loading} />
      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <main 
              className={cn(
                "pt-16 min-h-screen transition-all duration-300 ease-in-out",
                isSidebarOpen ? "pl-64" : "pl-0"
              )}
            >
              <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground mt-1">Manage your server infrastructure</p>
                </div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  {servers.length === 0 ? (
                    <div className="rounded-lg border bg-card p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <ServerIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="mt-4 text-lg font-semibold">No servers found</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Get started by creating your first server
                      </p>
                      <Button className="mt-6" size="sm">
                        Create Server
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {servers.map(server => (
                        <motion.div
                          key={server.uuid}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ServerCard server={server} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
