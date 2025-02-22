"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={props.forcedTheme}
      disableTransitionOnChange
      storageKey="airlink-theme"
    >
      {children}
    </NextThemesProvider>
  )
} 