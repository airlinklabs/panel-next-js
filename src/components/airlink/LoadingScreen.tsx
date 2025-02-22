"use client";

import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle, Server as ServerIcon } from "lucide-react";

interface LoadingScreenProps {
  loading: boolean;
}

const LoadingScreen: FC<LoadingScreenProps> = ({ loading }) => {
  const [isVisible, setIsVisible] = useState(loading);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    isVisible && (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="relative flex flex-col items-center">
          <div className="relative size-24 mb-8 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <ServerIcon className="size-12 text-primary animate-pulse" />
          </div>
          <LoaderCircle className="size-8 animate-spin text-primary" />
        </div>
      </motion.div>
    )
  );
};

export default LoadingScreen;
