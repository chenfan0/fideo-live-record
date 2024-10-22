import { useTranslation } from 'react-i18next'

import { useStreamConfigStore } from '@/store/useStreamConfigStore'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shadcn/ui/dropdown-menu'
import UseThemeIcon from '@renderer/components/UseThemeIcon'

import darkDot from '@/assets/images/dark/dot.svg'
import lightDot from '@/assets/images/light/dot.svg'

export function MoveCardDropdownMenu({ streamConfig }: { streamConfig: IStreamConfig }) {
  const { t } = useTranslation()

  const { streamConfigList, replaceStreamConfig } = useStreamConfigStore((state) => ({
    streamConfigList: state.streamConfigList,
    replaceStreamConfig: state.replaceStreamConfig
  }))

  const index = streamConfigList.findIndex((stream) => stream.id === streamConfig.id)

  const handleMoveToTop = () => {
    const newStreamConfigList = [
      streamConfigList[index],
      ...streamConfigList.slice(0, index),
      ...streamConfigList.slice(index + 1)
    ]
    replaceStreamConfig(newStreamConfigList)
  }
  const handleMoveUp = () => {
    const newStreamConfigList = [
      ...streamConfigList.slice(0, index - 1),
      streamConfigList[index],
      streamConfigList[index - 1],
      ...streamConfigList.slice(index + 1)
    ]
    replaceStreamConfig(newStreamConfigList)
  }
  const handleMoveDown = () => {
    const newStreamConfigList = [
      ...streamConfigList.slice(0, index),
      streamConfigList[index + 1],
      streamConfigList[index],
      ...streamConfigList.slice(index + 2)
    ]
    replaceStreamConfig(newStreamConfigList)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className=" absolute right-6 bottom-4">
        <UseThemeIcon
          className="w-[24px] h-[24px] cursor-pointer"
          dark={darkDot}
          light={lightDot}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="left" align="end">
        <DropdownMenuLabel>{t('stream_config.position_adjust')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {index !== 0 && index !== 1 && (
            <DropdownMenuItem onClick={handleMoveToTop}>
              {t('stream_config.move_top')}
            </DropdownMenuItem>
          )}
          {index !== 0 && (
            <DropdownMenuItem onClick={handleMoveUp}>{t('stream_config.move_up')}</DropdownMenuItem>
          )}
          {index !== streamConfigList.length - 1 && (
            <DropdownMenuItem onClick={handleMoveDown}>
              {t('stream_config.move_down')}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
