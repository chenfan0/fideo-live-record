import module from 'module'
import os from 'node:os'
import path from 'node:path'
import fsp from 'node:fs/promises'

import type Ffmpeg from 'fluent-ffmpeg'

import debug from 'debug'

import download from 'download'

const log = debug('fideo-ffmpeg')

const require = module.createRequire(import.meta.url)
const ffmpeg = require('fluent-ffmpeg') as typeof Ffmpeg

export const isMac = os.platform() === 'darwin'

const ffmpegMacUrl = 'https://gitlab.com/chenfan0/ffmpeg-resource/-/raw/main/ffmpeg-mac.zip'
const ffmpegWinUrl = 'https://gitlab.com/chenfan0/ffmpeg-resource/-/raw/main/ffmpeg-win.zip'

export async function checkFfmpegExist(dirname: string) {
  const ffmpegPath = isMac
    ? path.resolve(dirname, 'ffmpeg-mac/ffmpeg')
    : path.resolve(dirname, 'ffmpeg-win/ffmpeg.exe')
  return fsp
    .access(ffmpegPath, fsp.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

export async function checkFfprobeExist(dirname: string) {
  const ffprobePath = isMac
    ? path.resolve(dirname, 'ffmpeg-mac/ffprobe')
    : path.resolve(dirname, 'ffmpeg-win/ffprobe.exe')
  return fsp
    .access(ffprobePath, fsp.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

export const downloadDepProgressInfo: IDownloadDepProgressInfo = {
  downloading: false,
  progress: 0
}

export async function makeSureDependenciesExist(
  dirname: string,
  isFfmpegExist: boolean,
  isFFprobeExist: boolean
) {
  if (isFfmpegExist && isFFprobeExist) {
    const ffmpegPath = isMac
      ? path.resolve(dirname, 'ffmpeg-mac/ffmpeg')
      : path.resolve(dirname, 'ffmpeg-win/ffmpeg.exe')
    const ffprobePath = isMac
      ? path.resolve(dirname, 'ffmpeg-mac/ffprobe')
      : path.resolve(dirname, 'ffmpeg-win/ffprobe.exe')
    ffmpeg.setFfmpegPath(ffmpegPath)
    ffmpeg.setFfprobePath(ffprobePath)
    return true
  }

  let _resolve: (value: unknown) => void, _reject: (reason?: any) => void
  const p = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  if (isMac) {
    if (!isFfmpegExist) {
      downloadDepProgressInfo.downloading = true
      download(ffmpegMacUrl, dirname, { extract: true })
        .on('downloadProgress', ({ percent }) => {
          downloadDepProgressInfo.progress = percent
          log(`ffmpeg download progress: ${percent}`)
        })
        .then(() => {
          downloadDepProgressInfo.downloading = false
          downloadDepProgressInfo.progress = 0
          _resolve(true)
        })
        .catch(() => {
          // _reject()
        })
    }
  } else {
    downloadDepProgressInfo.downloading = true
    download(ffmpegWinUrl, dirname, { extract: true })
      .on('downloadProgress', ({ percent }) => {
        downloadDepProgressInfo.progress = percent
        log(`ffmpeg download progress: ${percent}`)
      })
      .then(() => {
        downloadDepProgressInfo.downloading = false
        downloadDepProgressInfo.progress = 0
        _resolve(true)
      })
      .catch(() => {})
  }

  return p
}

// const isDev = import.meta.env.MODE === 'development'
// const ffmpegPath = isDev
//   ? path.join(__dirname, '../../resources/ffmpeg', 'ffmpeg')
//   : isMac
//     ? path.join(process.resourcesPath, 'ffmpeg')
//     : path.join(process.resourcesPath, 'ffmpeg.exe')
// ffmpeg.setFfmpegPath(ffmpegPath)
export default ffmpeg
