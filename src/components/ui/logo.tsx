"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "default" | "lg"
  className?: string
}

export function Logo({ size = "default", className }: LogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeClasses = {
    sm: "w-32 h-12",
    default: "w-48 h-16",
    lg: "w-64 h-20"
  }

  // Prevent hydration mismatch by rendering a simple div until mounted
  if (!mounted) {
    return <div className={cn("relative mb-2", sizeClasses[size], className)} />
  }

  return (
    <div className={cn("relative mb-2", sizeClasses[size], className)}>
      <Image 
        src={theme === 'dark' ? "/logo-dark.png" : "/logo-light.png"}
        alt="AirLink Logo"
        fill
        className="object-contain dark:invert"
        priority
      />
    </div>
  )
} 