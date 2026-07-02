import { create } from 'zustand'

interface ThemeState {
  dark: boolean
  toggle: () => void
}

function getInitial(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const initial = getInitial()
apply(initial)

export const useThemeStore = create<ThemeState>(() => ({
  dark: initial,
  toggle: () => {
    const next = !useThemeStore.getState().dark
    apply(next)
    useThemeStore.setState({ dark: next })
  }
}))
