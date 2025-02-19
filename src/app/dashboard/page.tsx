// components/Dashboard.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/shadcn/button";
import { cn, getStatusStyles, Server } from "@/lib/utils";
import Header from "@/components/airlink/Header";
import Sidebar from "@/components/airlink/Sidebar";
import LoadingScreen from "@/components/airlink/LoadingScreen";
import ServerCard from "@/components/airlink/dashboard/ServerCard";

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [servers, setServers] = useState<Server[]>([
    { name: "Server1", uuid: "123e4567", ram: "8GB", cpu: "400%", disk: "50GB", memoryUsage: "8/16GB", cpuUsage: "50%", diskUsage: "25/50GB", status: 'Online' },
    { name: "Server2", uuid: "223e4567", ram: "6GB", cpu: "800%", disk: "100GB", memoryUsage: "16/32GB", cpuUsage: "70%", diskUsage: "50/100GB", status: 'Starting' },
    { name: "Server3", uuid: "323e4567", ram: "12GB", cpu: "1600%", disk: "200GB", memoryUsage: "32/64GB", cpuUsage: "90%", diskUsage: "100/200GB", status: 'Stopped' }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
        return {
          ...server,
          memoryUsage: `0/${server.ram}`,
          cpuUsage: `0%`,
          diskUsage: `0/${server.disk}`
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen dark bg-background text-foreground">
      <LoadingScreen loading={loading} />
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(5px)" }}
            transition={{ duration: 0.5 }}
          >
            <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <main className={cn("pt-14 transition-all duration-300 ease-in-out", isSidebarOpen ? "pl-60" : "pl-0")}>
              <div className="p-6 sm:p-4 md:p-6">
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold">Dashboard</h1>
                  <p className="text-muted-foreground">View and manage your servers.</p>
                </div>
                {servers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="mb-4">
                      <div className="spinner">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      Oops! We couldn&apos;t find any servers associated with your account.
                    </h2>
                    <p className="text-muted-foreground mb-4">You don&apos;t have any servers yet. Why not create one now?</p>
                    <Button>Create a server</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {servers.map(server => (
                      <ServerCard key={server.uuid} server={server} />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
