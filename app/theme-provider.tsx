'use client'

import { Theme } from '@radix-ui/themes'
import type { ReactNode } from 'react'

// appearance="inherit": the dark/light class on <html> is set by app/layout.tsx and components/theme-toggle.tsx.
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <Theme appearance="inherit" accentColor="blue">
      {children}
    </Theme>
  )
}
