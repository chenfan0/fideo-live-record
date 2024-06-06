import UseThemeIcon from '@/components/UseThemeIcon'

import { useStreamConfigStore } from '@/store/useStreamConfigStore'

import darkPreviewIcon from '@/assets/images/dark/preview.svg'
import lightPreviewIcon from '@/assets/images/light/preview.svg'
import darkPlayIcon from '@/assets/images/dark/play.svg'
import lightPlayIcon from '@/assets/images/light/play.svg'
import darkPauseIcon from '@/assets/images/dark/pause.svg'
import lightPauseIcon from '@/assets/images/light/pause.svg'
import darkSettingIcon from '@/assets/images/dark/setting.svg'
import lightSettingIcon from '@/assets/images/light/setting.svg'
import darkDeleteIcon from '@/assets/images/dark/close.svg'
import lightDeleteIcon from '@/assets/images/light/close.svg'

interface OperationBarProps {
  index: number
}

export default function OperationBar(props: OperationBarProps) {
  const { index } = props
  const { setActiveStreamConfigIndex, setStreamConfigSheetOpen } = useStreamConfigStore(
    (state) => state
  )

  const handleEditSettingClick = () => {
    setActiveStreamConfigIndex(index)
    setStreamConfigSheetOpen(true)
  }

  return (
    <div className="flex absolute right-0 gap-2">
      <UseThemeIcon
        className="w-[21px] cursor-pointer"
        dark={darkPreviewIcon}
        light={lightPreviewIcon}
      />
      <UseThemeIcon className="w-[20px] cursor-pointer" dark={darkPlayIcon} light={lightPlayIcon} />
      <UseThemeIcon
        className="w-[20px] cursor-pointer"
        dark={darkPauseIcon}
        light={lightPauseIcon}
      />
      <UseThemeIcon
        className="w-[20px] cursor-pointer"
        dark={darkSettingIcon}
        light={lightSettingIcon}
        handleClick={handleEditSettingClick}
      />
      <UseThemeIcon
        className="w-[20px] cursor-pointer"
        dark={darkDeleteIcon}
        light={lightDeleteIcon}
      />
    </div>
  )
}
