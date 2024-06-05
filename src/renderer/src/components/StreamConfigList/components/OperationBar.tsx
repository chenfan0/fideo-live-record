import { useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/shadcn/ui/sheet'
import { Button } from '@/shadcn/ui/button'
import { Label } from '@/shadcn/ui/label'
import { Input } from '@/shadcn/ui/input'

import UseThemeIcon from '@/components/UseThemeIcon'

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

export default function OperationBar() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleSheetOpen = (status: boolean) => setSheetOpen(status)
  return (
    <div className="flex absolute right-0 gap-2">
      <UseThemeIcon
        className="w-[21px] cursor-pointer"
        dark={darkPreviewIcon}
        light={lightPreviewIcon}
        handleClick={() => setSheetOpen(!sheetOpen)}
      />
      <UseThemeIcon className="w-[20px] cursor-pointer" dark={darkPlayIcon} light={lightPlayIcon} />
      <UseThemeIcon
        className="w-[20px] cursor-pointer"
        dark={darkPauseIcon}
        light={lightPauseIcon}
      />
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpen}>
        <SheetTrigger>
          <UseThemeIcon
            className="w-[20px] cursor-pointer"
            dark={darkSettingIcon}
            light={lightSettingIcon}
          />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>1111</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <Button>Save changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <UseThemeIcon
        className="w-[20px] cursor-pointer"
        dark={darkDeleteIcon}
        light={lightDeleteIcon}
      />
    </div>
  )
}
