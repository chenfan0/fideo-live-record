import UseThemeIcon from '@/components/UseThemeIcon'

import lightMinIcon from '@/assets/images/light/min.svg'
import darkMinIcon from '@/assets/images/dark/min.svg'
import lightRestoreIcon from '@/assets/images/light/restore.svg'
import darkRestoreIcon from '@/assets/images/dark/restore.svg'
import lightCloseIcon from '@/assets/images/light/close.svg'
import darkCloseIcon from '@/assets/images/dark/close.svg'

export default function TitleBar() {
  const handleMinimizeWindow = () => {
    window.api.minimizeWindow()
  }

  const handleMaxRestoreWindow = () => {
    window.api.maxRestoreWindow()
  }

  const handleCloseWindow = () => {
    window.api.closeWindow()
  }

  return (
    <div id="title-bar">
      <div id="drag-region">
        <div id="window-controls">
          <div id="min-button" className="window-hover">
            <UseThemeIcon
              dark={darkMinIcon}
              light={lightMinIcon}
              handleClick={handleMinimizeWindow}
            />
          </div>
          <div id="restore-button" className="window-hover">
            <UseThemeIcon
              dark={darkRestoreIcon}
              light={lightRestoreIcon}
              handleClick={handleMaxRestoreWindow}
            />
          </div>
          <div id="close-button" className="window-hover-close">
            <UseThemeIcon
              dark={darkCloseIcon}
              light={lightCloseIcon}
              handleClick={handleCloseWindow}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
