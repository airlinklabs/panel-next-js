"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { SessionProvider } from "next-auth/react"

interface ProvidersProps extends ThemeProviderProps {
  children: React.ReactNode
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <SessionProvider>
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
    </SessionProvider>
  )
} 