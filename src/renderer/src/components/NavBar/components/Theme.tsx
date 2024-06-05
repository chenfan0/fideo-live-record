import { useLocalStorage, useMount } from 'react-use'
import { useTranslation } from 'react-i18next'

import { useThemeStore } from '@/store/useThemeStore'

import UseThemeIcon from '@/components/UseThemeIcon'

import lightIcon from '@/assets/images/light/light.svg'
import darkIcon from '@/assets/images/dark/dark.svg'

export default function Theme() {
  const { t } = useTranslation()

  const [localTheme, setLocalTheme] = useLocalStorage('theme', 'light')
  const { theme, toggleTheme } = useThemeStore((state) => ({
    theme: state.theme || (localTheme as 'dark' | 'light'),
    toggleTheme: state.toggleTheme
  }))

  const toggleClass = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  useMount(() => {
    toggleClass(theme!)
  })

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'

    toggleClass(newTheme)
    toggleTheme(newTheme)
    setLocalTheme(newTheme)
  }

  return (
    <UseThemeIcon
      dark={darkIcon}
      light={lightIcon}
      handleClick={handleToggleTheme}
      tooltipContent={t('nav_bar.toggle_theme')}
    />
  )
}
