import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'agentbuilder-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

const getSystemTheme = (): Theme =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'

const getStoredTheme = (): Theme | null => {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return null
}

const applyThemeClass = (theme: Theme) => {
  const isDark = theme === 'dark'
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.style.colorScheme = isDark ? 'dark' : 'light'
  document.body?.classList.toggle('dark', isDark)
}

const resolveInitialTheme = () => {
  const stored = getStoredTheme()
  if (stored) {
    return { theme: stored, followSystem: false }
  }
  return { theme: getSystemTheme(), followSystem: true }
}

export const useTheme = () => {
  const [initial] = useState(resolveInitialTheme)
  const [theme, setTheme] = useState<Theme>(initial.theme)
  const [followSystem, setFollowSystem] = useState(initial.followSystem)

  useEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  useEffect(() => {
    if (!followSystem) return
    const media = window.matchMedia(DARK_QUERY)
    const onChange = () => setTheme(getSystemTheme())
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [followSystem])

  const setExplicitTheme = (next: Theme) => {
    setTheme(next)
    setFollowSystem(false)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  const toggleTheme = () => {
    setExplicitTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  }
}
