'use client'

import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'

interface HeaderGlobal {
  themeSwitchEnabled: 'true' | 'false'
  defaultTheme: 'system' | 'dark' | 'light'
}

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  const defaultTheme = 'system'
  const enableSystem = defaultTheme === 'system'

  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem={enableSystem}>
      {children}
    </ThemeProvider>
  )
}
