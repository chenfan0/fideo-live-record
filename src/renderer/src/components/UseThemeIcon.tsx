import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shadcn/ui/tooltip'

import { useThemeStore } from '@/store/useThemeStore'
import { useLocalStorage } from 'react-use'

interface UseThemeIconProps {
  dark: string
  light: string
  handleClick?: () => void
  className?: string
  tooltipContent?: string
}

export default function UseThemeIcon(props: UseThemeIconProps) {
  const { dark, light, handleClick, className = '', tooltipContent } = props

  const [localTheme] = useLocalStorage('theme', 'light')
  const theme = useThemeStore((state) => state.theme || (localTheme as 'dark' | 'light'))

  return tooltipContent ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <img
            src={theme === 'dark' ? dark : light}
            className={className ? className : 'w-[24px] h-[24px] cursor-pointer'}
            onClick={handleClick}
          />
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <img
      src={theme === 'dark' ? dark : light}
      className={className ? className : 'w-[24px] h-[24px] cursor-pointer'}
      onClick={handleClick}
    />
  )
}
