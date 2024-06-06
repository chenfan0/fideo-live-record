import { useTranslation } from 'react-i18next'

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
import { StreamStatus } from '@renderer/lib/utils'
import StreamConfigSheet from '@renderer/components/StreamConfigSheet'
import { useState } from 'react'
import DeleteRecordDialog from './DeleteRecordDialog'

interface OperationBarProps {
  index: number
}

export default function OperationBar(props: OperationBarProps) {
  const { index } = props
  const { t } = useTranslation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { streamConfigList, removeStreamConfig } = useStreamConfigStore((state) => ({
    streamConfigList: state.streamConfigList,
    removeStreamConfig: state.removeStreamConfig
  }))
  const streamConfig = streamConfigList[index]

  const handleConfirmDelete = () => {
    removeStreamConfig(index)
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <div className="flex absolute right-0 gap-2">
        <UseThemeIcon
          className="w-[21px] cursor-pointer"
          dark={darkPreviewIcon}
          light={lightPreviewIcon}
          tooltipContent={t('stream_config.preview')}
        />

        {streamConfig.status === StreamStatus.NOT_STARTED ? (
          <UseThemeIcon
            className="w-[20px] cursor-pointer"
            dark={darkPlayIcon}
            light={lightPlayIcon}
          />
        ) : (
          <UseThemeIcon
            className="w-[20px] cursor-pointer"
            dark={darkPauseIcon}
            light={lightPauseIcon}
          />
        )}
        <UseThemeIcon
          className="w-[20px] cursor-pointer"
          dark={darkSettingIcon}
          light={lightSettingIcon}
          handleClick={() => setSheetOpen(true)}
          tooltipContent={t('stream_config.edit_record')}
        />
        <UseThemeIcon
          className="w-[20px] cursor-pointer"
          dark={darkDeleteIcon}
          light={lightDeleteIcon}
          handleClick={() => setDeleteDialogOpen(true)}
        />
      </div>

      <StreamConfigSheet
        streamConfig={streamConfig}
        setSheetOpen={setSheetOpen}
        sheetOpen={sheetOpen}
        index={index}
        type="edit"
      />

      <DeleteRecordDialog
        title={streamConfig.title}
        dialogOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  )
}
