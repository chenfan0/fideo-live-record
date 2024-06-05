import { create } from 'zustand'

interface IThemeStore {
  theme: 'light' | 'dark' | ''
  toggleTheme: (newTheme: 'light' | 'dark') => void
}

export const useThemeStore = create<IThemeStore>((set) => ({
  theme: '',
  toggleTheme: (newTheme) => set(() => ({ theme: newTheme }))
}))
