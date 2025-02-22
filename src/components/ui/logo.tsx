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
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeClasses = {
    sm: "w-32 h-12",
    default: "w-48 h-16",
    lg: "w-64 h-20"
  }

  // Always render a consistent initial state
  if (!mounted) {
    return (
      <div className={cn("relative mb-2", sizeClasses[size], className)}>
        <Image 
          src="/logo-light.png"
          alt="AirLink Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    )
  }

  return (
    <div className={cn("relative mb-2", sizeClasses[size], className)}>
      <Image 
        src={resolvedTheme === 'dark' ? "/logo-dark.png" : "/logo-light.png"}
        alt="AirLink Logo"
        fill
        className="object-contain dark:invert"
        priority
      />
    </div>
  )
} 