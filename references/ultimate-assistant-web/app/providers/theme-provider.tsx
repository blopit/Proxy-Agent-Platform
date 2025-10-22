'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true)
    }
    return () => setMounted(false)
  }, [])

  if (!mounted || typeof window === 'undefined') {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    )
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
