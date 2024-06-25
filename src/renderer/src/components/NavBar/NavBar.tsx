import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Theme from '@/components/NavBar/components/Theme'
import UseThemeIcon from '@/components/UseThemeIcon'
import StreamConfigSheet from '@/components/StreamConfigSheet'

import darkAddIcon from '@/assets/images/dark/add.svg'
import lightAddIcon from '@/assets/images/light/add.svg'
import darkSettingIcon from '@/assets/images/dark/setting.svg'
import lightSettingIcon from '@/assets/images/light/setting.svg'
import darkLogo from '@/assets/images/dark/logo.png'
import lightLogo from '@/assets/images/light/logo.png'
import DefaultSettingSheet from './components/DefaultSettingSheet'

export default function NavBar() {
  const { t } = useTranslation()
  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [settingSheetOpen, setSettingSheetOpen] = useState(false)

  return (
    <div className="flex items-center justify-between px-[24px]">
      <UseThemeIcon
        dark={darkLogo}
        light={lightLogo}
        className="w-[64px] cursor-pointer select-none"
      />

      <div className="flex items-center gap-[12px]">
        <UseThemeIcon
          dark={darkAddIcon}
          light={lightAddIcon}
          className="w-[22px] h-[22px] cursor-pointer select-none"
          tooltipContent={t('nav_bar.create')}
          handleClick={() => setCreateSheetOpen(true)}
        />

        <UseThemeIcon
          dark={darkSettingIcon}
          light={lightSettingIcon}
          className="w-[24px] h-[24px] cursor-pointer select-none"
          tooltipContent={t('nav_bar.setting')}
          handleClick={() => setSettingSheetOpen(true)}
        />
        <Theme />
      </div>

      <StreamConfigSheet
        sheetOpen={createSheetOpen}
        setSheetOpen={setCreateSheetOpen}
        type="create"
        streamConfig={null}
      />

      <DefaultSettingSheet setSheetOpen={setSettingSheetOpen} sheetOpen={settingSheetOpen} />
    </div>
  )
}
