"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import Header from "@/components/airlink/Header";
import Sidebar from "@/components/airlink/Sidebar";
import LoadingScreen from "@/components/airlink/LoadingScreen";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
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
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="mb-4">
                    <Box className="h-16 w-16 text-muted-foreground/20" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    Oops! We couldn&apos;t find any servers associated with your account.
                  </h2>
                  <p className="text-muted-foreground mb-4">You don&apos;t have any servers yet. Why not create one now?</p>
                  <Button>Create a server</Button>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
