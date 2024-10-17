import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Theme from '@/components/NavBar/components/Theme'
import UseThemeIcon from '@/components/UseThemeIcon'
import StreamConfigSheet from '@/components/StreamConfigSheet'

import DefaultSettingSheet from './components/DefaultSettingSheet'
import WebControlSettingSheet from './components/WebControlSettingSheet'

import darkAddIcon from '@/assets/images/dark/add.svg'
import lightAddIcon from '@/assets/images/light/add.svg'
import darkSettingIcon from '@/assets/images/dark/setting.svg'
import lightSettingIcon from '@/assets/images/light/setting.svg'
import darkLogo from '@/assets/images/dark/logo.png'
import lightLogo from '@/assets/images/light/logo.png'
import darkQQIcon from '@/assets/images/dark/qq.svg'
import lightQQIcon from '@/assets/images/light/qq.svg'
import darkDiscordIcon from '@/assets/images/dark/discord.svg'
import lightDiscordIcon from '@/assets/images/light/discord.svg'
import darkPhoneIcon from '@/assets/images/dark/phone.svg'
import lightPhoneIcon from '@/assets/images/light/phone.svg'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@renderer/shadcn/ui/select'

import { useNavSelectedStatusStore } from '@renderer/store/useNavSelectedStatusStore'

export default function NavBar() {
  const { t } = useTranslation()

  const { navSelectedStatus, setNavSelectedStatus } = useNavSelectedStatusStore((state) => ({
    navSelectedStatus: state.navSelectedStatus,
    setNavSelectedStatus: state.setNavSelectedStatus
  }))

  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [settingSheetOpen, setSettingSheetOpen] = useState(false)
  //
  const [webControlSheetOpen, setWebControlSheetOpen] = useState(false)

  const handleLogoClick = () => {
    window.api.navByDefaultBrowser('https://www.fideo.site')
  }

  const handleQQClick = () => {
    window.api.navByDefaultBrowser(
      'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=6J5_9669aU4Dxjb_mWGpAhNvQ7JGrh0h&authKey=HiUtMqFPDEbO9xZFS6V2kNo3rBv3L%2B764z5o9zepXFI%2Bf1h4HkA8%2F2eTZ4F4TdQH&noverify=0&group_code=891116727'
    )
  }

  const handleDiscordClick = () => {
    window.api.navByDefaultBrowser('https://discord.gg/md5HqyGW')
  }

  return (
    <div className="flex items-center justify-between px-[24px]">
      <div className="flex items-center gap-4">
        <UseThemeIcon
          dark={darkLogo}
          light={lightLogo}
          className="w-[64px] cursor-pointer select-none"
          handleClick={handleLogoClick}
          tooltipContent={t('nav_bar.go_to_website')}
        />
        <UseThemeIcon
          dark={darkQQIcon}
          light={lightQQIcon}
          className="w-[24px] h-[24px] cursor-pointer select-none"
          handleClick={handleQQClick}
          tooltipContent={t('nav_bar.qq')}
        />
        <UseThemeIcon
          dark={darkDiscordIcon}
          light={lightDiscordIcon}
          className="w-[24px] h-[24px] cursor-pointer select-none"
          handleClick={handleDiscordClick}
          tooltipContent={t('nav_bar.discord')}
        />

        <UseThemeIcon
          dark={darkPhoneIcon}
          light={lightPhoneIcon}
          className="w-[22px] h-[22px] cursor-pointer select-none"
          tooltipContent={t('nav_bar.web_control')}
          handleClick={() => setWebControlSheetOpen(true)}
        />
      </div>

      <div className="flex items-center gap-[12px]">
        <Select
          defaultValue={navSelectedStatus}
          key={navSelectedStatus}
          onValueChange={(val) => {
            setNavSelectedStatus(val)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="-1">{t('stream_config.all')}</SelectItem>
              <SelectItem value="2">{t('stream_config.monitoring')}</SelectItem>
              <SelectItem value="3">{t('stream_config.recording')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <UseThemeIcon
          dark={darkAddIcon}
          light={lightAddIcon}
          className="w-[22px] h-[22px] cursor-pointer select-none ml-6"
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

      <WebControlSettingSheet
        setSheetOpen={setWebControlSheetOpen}
        sheetOpen={webControlSheetOpen}
      />
    </div>
  )
}
