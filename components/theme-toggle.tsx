'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'hm-theme'

function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function applyTheme(theme: Theme, remember: boolean) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  if (remember) {
    root.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {}
  }
}

function hasSavedChoice(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'dark' || saved === 'light'
  } catch {
    return false
  }
}

// The saved choice is applied before first paint by the inline script in app/layout.tsx.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(currentTheme())
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (hasSavedChoice()) return
      applyTheme(query.matches ? 'dark' : 'light', false)
      setTheme(currentTheme())
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const label = theme === 'dark' ? 'Switch to light theme' : theme === 'light' ? 'Switch to dark theme' : 'Switch theme'

  return (
    <button
      className="hm-theme-toggle"
      type="button"
      aria-label={label}
      title="Switch theme"
      onClick={() => {
        const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
        applyTheme(next, true)
        setTheme(next)
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3.5 A8.5 8.5 0 0 1 12 20.5 Z" fill="currentColor" />
      </svg>
    </button>
  )
}
