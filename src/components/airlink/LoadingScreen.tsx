"use client";

import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

interface LoadingScreenProps {
  loading: boolean;
}

const LoadingScreen: FC<LoadingScreenProps> = ({ loading }) => {
  const [isVisible, setIsVisible] = useState(loading);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    isVisible && (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground"
      >
        <LoaderCircle className="h-12 w-12 animate-spin" />
      </motion.div>
    )
  );
};

export default LoadingScreen;
