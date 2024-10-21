import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
  Tray,
  Menu,
  nativeImage
} from 'electron'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import { lt } from 'semver'
import pkg from '../../package.json'

import {
  CLOSE_WINDOW,
  DOWNLOAD_DEP_PROGRESS_INFO,
  FFMPEG_PROGRESS_INFO,
  FORCE_CLOSE_WINDOW,
  GET_LIVE_URLS,
  MAXIMIZE_RESTORE_WINDOW,
  MINIMIZE_WINDOW,
  NAV_BY_DEFAULT_BROWSER,
  OPEN_LOGS_DIR,
  RECORD_DUMMY_PROCESS,
  RETRY_DOWNLOAD_DEP,
  SELECT_DIR,
  SHOW_NOTIFICATION,
  SHOW_UPDATE_DIALOG,
  START_FRPC_PROCESS,
  START_STREAM_RECORD,
  STOP_FRPC_PROCESS,
  STOP_STREAM_RECORD,
  STREAM_RECORD_END,
  USER_CLOSE_WINDOW
} from '../const'
import { getLiveUrls } from './crawler/index'
import { FFMPEG_ERROR_CODE, SUCCESS_CODE } from '../code'
import {
  recordStream,
  recordStreamFfmpegProgressInfo,
  recordStreamFfmpegProcessMap,
  killRecordStreamFfmpegProcess,
  setRecordStreamFfmpegProcessMap
} from './ffmpeg/record'
import { setFfmpegAndFfprobePath } from './ffmpeg'
import {
  checkFfmpegExist,
  checkFfprobeExist,
  checkFrpcExist,
  downloadDepProgressInfo,
  makeSureDependenciesExist,
  downloadReq
} from './download-dep'

import { writeLogWrapper } from './log/index'
import { startFrpcProcess, stopFrpc, frpcObj } from './frpc'

export const writeLog = writeLogWrapper(app.getPath('userData'))

async function checkUpdate() {
  try {
    const json = await fetch(
      'https://api.github.com/repos/chenfan0/fideo-live-record/releases/latest'
    )
    const { tag_name } = await json.json()
    if (lt(pkg.version, tag_name)) {
      win?.webContents.send(SHOW_UPDATE_DIALOG)
    }
  } catch {
    // ignore
  }
}

let ffmpegProcessTimer: NodeJS.Timeout | undefined
const startFfmpegProcessTimerWhenFirstFfmpegProcessStart = () => {
  if (ffmpegProcessTimer === undefined) {
    ffmpegProcessTimer = setInterval(() => {
      win?.webContents.send(FFMPEG_PROGRESS_INFO, recordStreamFfmpegProgressInfo)
    }, 1000)
  }
}

const isAllFfmpegProcessEnd = () =>
  Object.keys(recordStreamFfmpegProcessMap).every(
    (key) =>
      Object.keys(recordStreamFfmpegProcessMap[key as keyof typeof recordStreamFfmpegProcessMap])
        .length === 0
  ) &&
  Object.keys(recordStreamFfmpegProgressInfo).every(
    (key) =>
      Object.keys(
        recordStreamFfmpegProgressInfo[key as keyof typeof recordStreamFfmpegProgressInfo]
      ).length === 0
  )
export const clearTimerWhenAllFfmpegProcessEnd = () => {
  if (isAllFfmpegProcessEnd()) {
    win?.webContents.send(FFMPEG_PROGRESS_INFO, recordStreamFfmpegProgressInfo)

    clearInterval(ffmpegProcessTimer)
    ffmpegProcessTimer = undefined
  }
}

let downloadDepTimer: NodeJS.Timeout | undefined
const startDownloadDepTimerWhenFirstDownloadDepStart = () => {
  if (downloadDepTimer === undefined) {
    downloadDepTimer = setInterval(() => {
      win?.webContents.send(DOWNLOAD_DEP_PROGRESS_INFO, downloadDepProgressInfo)
    }, 1000)
  }
}

const stopDownloadDepTimerWhenAllDownloadDepEnd = () => {
  win?.webContents.send(DOWNLOAD_DEP_PROGRESS_INFO, downloadDepProgressInfo)
  clearInterval(downloadDepTimer)
  downloadDepTimer = undefined
}

let win: BrowserWindow | null
let tray: Tray | null

function hideTaskbar() {
  if (process.platform === 'darwin') {
    app.dock.hide()
  } else {
    win?.setSkipTaskbar(true)
  }
}

function showTaskbar() {
  if (process.platform === 'darwin') {
    app.dock.show()
  } else {
    win?.setSkipTaskbar(false)
  }
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    titleBarStyle: 'hidden',
    title: 'Fideo',
    autoHideMenuBar: true,
    frame: process.platform === 'darwin',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: is.dev
    }
  })

  win = mainWindow

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('close', (e) => {
    e.preventDefault()

    mainWindow.hide()
    hideTaskbar()
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  await handleMakeSureDependenciesExist()
}

async function createTray() {
  const isChinese = ['zh', 'zh-CN', 'zh-TW', 'zh-HK'].includes(app.getLocale())
  const iconPath = is.dev
    ? join(__dirname, '../../resources/iconTemplate.png')
    : join(process.resourcesPath, 'iconTemplate.png')

  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: isChinese ? '打开Fideo' : 'Open Fideo',
      click: () => {
        win?.show()
        showTaskbar()
      }
    },
    {
      label: isChinese ? '退出' : 'Quit',
      click: () => {
        if (!isAllFfmpegProcessEnd() || frpcObj !== null) {
          win?.show()
        }
        win?.webContents.send(USER_CLOSE_WINDOW)
      }
    }
  ])
  tray.setToolTip('Fideo')
  tray.setContextMenu(contextMenu)

  tray.addListener('double-click', function () {
    win?.show()
    showTaskbar()
  })
}

function showNotification(title: string, body: string) {
  const notification = new Notification({
    title,
    body
  })
  notification.show()
}

async function handleMakeSureDependenciesExist() {
  const userDataPath = app.getPath('userData')
  const [isFFmpegExist, isFfprobeExist, isFrpcExist] = await Promise.all([
    checkFfmpegExist(userDataPath),
    checkFfprobeExist(userDataPath),
    checkFrpcExist(userDataPath)
  ])

  if (!isFFmpegExist || !isFfprobeExist || !isFrpcExist) {
    startDownloadDepTimerWhenFirstDownloadDepStart()
  }

  makeSureDependenciesExist(userDataPath)
    .then(() => {
      setFfmpegAndFfprobePath(userDataPath)
      stopDownloadDepTimerWhenAllDownloadDepEnd()
    })
    .catch(() => {
      stopDownloadDepTimerWhenAllDownloadDepEnd()
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('site.fideo.app')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle(SELECT_DIR, async () => {
    const dir = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return dir
  })

  ipcMain.handle(
    GET_LIVE_URLS,
    async (_, info: { roomUrl: string; proxy?: string; cookie?: string; title: string }) => {
      const { roomUrl, proxy, cookie, title } = info
      return getLiveUrls({ roomUrl, proxy, cookie }, writeLog.bind(null, title))
    }
  )

  ipcMain.handle(NAV_BY_DEFAULT_BROWSER, (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle(START_STREAM_RECORD, async (_, streamConfigStr: string) => {
    const streamConfig = JSON.parse(streamConfigStr) as IStreamConfig
    const { roomUrl, proxy, cookie, title } = streamConfig

    /**
     * When requesting the live stream address,
     * first set the ffmpeg process of the live stream to RECORD_DUMMY_PROCESS
     *
     * Prevent clicking the stop recording button while requesting the live stream address,
     * causing the page to display that the recording has stopped, but the ffmpeg process is still running
     */
    setRecordStreamFfmpegProcessMap(title, RECORD_DUMMY_PROCESS)

    const { code: liveUrlsCode, liveUrls } = await getLiveUrls(
      { roomUrl, proxy, cookie },
      writeLog.bind(null, title)
    )

    if (liveUrlsCode !== SUCCESS_CODE) {
      return {
        code: liveUrlsCode
      }
    }
    streamConfig.liveUrls = liveUrls

    const { code: recordStreamCode } = await recordStream(
      streamConfig,
      writeLog,
      (code: number, errMsg?: string) => {
        win?.webContents.send(STREAM_RECORD_END, title, code, errMsg)
        clearTimerWhenAllFfmpegProcessEnd()
      }
    )

    startFfmpegProcessTimerWhenFirstFfmpegProcessStart()

    return {
      code: recordStreamCode
    }
  })

  ipcMain.handle(STOP_STREAM_RECORD, async (_, title: string) => {
    /**
     * If the ffmpeg process is RECORD_DUMMY_PROCESS when stopping recording,
     * need to send the STREAM_RECORD_END event to display the information that the recording has stopped on the page.
     *
     * If it is not RECORD_DUMMY_PROCESS, it means that the ffmpeg process is running.
     * At this time, you do not need to send the STREAM_RECORD_END event,
     * because the ffmpeg process will send the STREAM_RECORD_END event when it is finished running.
     */
    const shouldSend = killRecordStreamFfmpegProcess(title)
    shouldSend &&
      win?.webContents.send(STREAM_RECORD_END, title, FFMPEG_ERROR_CODE.USER_KILL_PROCESS)
    clearTimerWhenAllFfmpegProcessEnd()

    return {
      code: SUCCESS_CODE
    }
  })

  ipcMain.handle(SHOW_NOTIFICATION, (_, title: string, body: string) => {
    showNotification(title, body)
  })

  ipcMain.handle(OPEN_LOGS_DIR, () => {
    shell.openPath(resolve(app.getPath('userData'), 'logs'))
  })

  ipcMain.handle(MINIMIZE_WINDOW, () => {
    win?.minimize()
  })

  ipcMain.handle(MAXIMIZE_RESTORE_WINDOW, () => {
    if (win?.isFullScreen()) {
      win?.setFullScreen(false)
    } else {
      win?.setFullScreen(true)
    }
  })

  ipcMain.handle(RETRY_DOWNLOAD_DEP, async () => {
    await handleMakeSureDependenciesExist()
  })

  ipcMain.handle(CLOSE_WINDOW, () => {
    win?.close()
  })

  ipcMain.handle(FORCE_CLOSE_WINDOW, () => {
    const stillRecordStreamKeys = Object.keys(recordStreamFfmpegProcessMap)

    stillRecordStreamKeys.forEach((key) => {
      killRecordStreamFfmpegProcess(key)
    })

    downloadReq.destroy()
    clearTimerWhenAllFfmpegProcessEnd()
    stopDownloadDepTimerWhenAllDownloadDepEnd()

    stopFrpc()

    win?.destroy()
  })

  ipcMain.handle(START_FRPC_PROCESS, async (_, code: string) => {
    if (frpcObj) {
      return false
    }
    return await startFrpcProcess(code, writeLog, win!)
  })

  ipcMain.handle(STOP_FRPC_PROCESS, async () => {
    stopFrpc()
  })

  await createWindow()
  await createTray()

  setTimeout(() => {
    checkUpdate()
  }, 1000)

  app.on('activate', async function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin' || is.dev) {
  app.quit()
  // }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
