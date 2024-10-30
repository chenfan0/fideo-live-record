import os from 'node:os'
import path from 'node:path'
import fsp from 'node:fs/promises'

import download from 'download'

import debug from 'debug'
const log = debug('fideo-download-dep')

export let downloadReq = {
  destroy: () => {}
}

export const downloadDepProgressInfo: IDownloadDepProgressInfo = {
  title: '',
  downloading: false,
  progress: 0,
  showRetry: false
}

const isMac = os.platform() === 'darwin'
const isArm = ['arm64', 'arm'].includes(os.arch())

const ffmpegMacUrl = 'https://gitlab.com/chenfan0/ffmpeg-resource/-/raw/main/ffmpeg-mac.zip'
const ffmpegWinUrl = 'https://gitlab.com/chenfan0/ffmpeg-resource/-/raw/main/ffmpeg-win.zip'

// const frpMacArmUrl = 'https://gitlab.com/chenfan0/ffmpeg-resource/-/raw/main/frp-mac-arm64.zip'
// const frpMacAmdUrl = 'https://gitlab.com/chenfan0/ffmpeg-resource/-/raw/main/frp-mac-amd64.zip'
// const frpWinArmUrl = 'https://gitlab.com/chenfan0/ffmpeg-resource/-/raw/main/frp-win-arm64.zip'
// const frpWinAmdUrl = 'https://gitlab.com/chenfan0/ffmpeg-resource/-/raw/main/frp-win-amd64.zip'

async function checkFileExist(filepath: string) {
  return fsp
    .access(filepath, fsp.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}
export function checkFfmpegExist(dirname: string) {
  const ffmpegPath = isMac
    ? path.resolve(dirname, 'ffmpeg-mac/ffmpeg')
    : path.resolve(dirname, 'ffmpeg-win/ffmpeg.exe')
  return checkFileExist(ffmpegPath)
}

export function checkFfprobeExist(dirname: string) {
  const ffprobePath = isMac
    ? path.resolve(dirname, 'ffmpeg-mac/ffprobe')
    : path.resolve(dirname, 'ffmpeg-win/ffprobe.exe')
  return checkFileExist(ffprobePath)
}

export function checkFrpcExist(dirname: string) {
  const frpPath = isMac
    ? isArm
      ? path.resolve(dirname, 'frp-mac-arm64/frpc')
      : path.resolve(dirname, 'frp-mac-amd64/frpc')
    : isArm
      ? path.resolve(dirname, 'frp-win-arm64/frpc.exe')
      : path.resolve(dirname, 'frp-win-amd64/frpc.exe')
  return checkFileExist(frpPath)
}

async function makeSureFfmpegDependenciesExist(dirname: string) {
  const [ffmpegExist, ffprobeExist] = await Promise.all([
    checkFfmpegExist(dirname),
    checkFfprobeExist(dirname)
  ])

  if (ffmpegExist && ffprobeExist) {
    return true
  }

  let _resolve: (value: unknown) => void, _reject: (reason?: any) => void
  const p = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })
  const downloadUrl = isMac ? ffmpegMacUrl : ffmpegWinUrl

  downloadDepProgressInfo.downloading = true
  download(downloadUrl, dirname, { extract: true })
    .on('request', (req) => {
      downloadReq = req
    })
    .on('downloadProgress', ({ percent }) => {
      downloadDepProgressInfo.title = 'FFMPEG'
      downloadDepProgressInfo.progress = percent
      log(`ffmpeg download progress: ${percent}`)
    })
    .on('error', (error) => {
      downloadDepProgressInfo.showRetry = true
      downloadDepProgressInfo.downloading = false
      downloadDepProgressInfo.progress = 0
      log(error.message)
      _reject()
    })
    .then(() => {
      downloadDepProgressInfo.title = ''
      downloadDepProgressInfo.downloading = false
      downloadDepProgressInfo.progress = 0

      _resolve(true)
    })
    .catch(() => {
      downloadDepProgressInfo.title = ''
      downloadDepProgressInfo.showRetry = true
      downloadDepProgressInfo.downloading = false
      downloadDepProgressInfo.progress = 0
      _reject()
    })

  return p
}

// async function makeSureFrpDependenciesExist(dirname: string) {
//   const frpExist = await checkFrpcExist(dirname)
//   if (frpExist) {
//     return true
//   }

//   let _resolve: (value: unknown) => void, _reject: (reason?: any) => void
//   const p = new Promise((resolve, reject) => {
//     _resolve = resolve
//     _reject = reject
//   })

//   const downloadUrl = isMac
//     ? isArm
//       ? frpMacArmUrl
//       : frpMacAmdUrl
//     : isArm
//       ? frpWinArmUrl
//       : frpWinAmdUrl

//   downloadDepProgressInfo.downloading = true
//   download(downloadUrl, dirname, { extract: true })
//     .on('request', (req) => {
//       downloadReq = req
//     })
//     .on('downloadProgress', ({ percent }) => {
//       downloadDepProgressInfo.title = 'FRPC'
//       downloadDepProgressInfo.progress = percent
//       log(`frpc download progress: ${percent}`)
//     })
//     .on('error', (error) => {
//       downloadDepProgressInfo.showRetry = true
//       downloadDepProgressInfo.downloading = false
//       downloadDepProgressInfo.progress = 0
//       log(error.message)
//       _reject()
//     })
//     .then(() => {
//       downloadDepProgressInfo.title = ''
//       downloadDepProgressInfo.downloading = false
//       downloadDepProgressInfo.progress = 0

//       _resolve(true)
//     })
//     .catch(() => {
//       downloadDepProgressInfo.title = ''
//       downloadDepProgressInfo.showRetry = true
//       downloadDepProgressInfo.downloading = false
//       downloadDepProgressInfo.progress = 0
//       _reject()
//     })

//   return p
// }

export async function makeSureDependenciesExist(dirname: string) {
  await makeSureFfmpegDependenciesExist(dirname)
  // await makeSureFrpDependenciesExist(dirname)
}
