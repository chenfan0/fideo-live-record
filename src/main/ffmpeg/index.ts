import module from 'module'
import os from 'node:os'
import path from 'node:path'

import type Ffmpeg from 'fluent-ffmpeg'

const require = module.createRequire(import.meta.url)
const ffmpeg = require('fluent-ffmpeg') as typeof Ffmpeg & {
  ffmpegPath: string
  ffprobePath: string
}

const isMac = os.platform() === 'darwin'

export const setFfmpegAndFfprobePath = (dirname: string) => {
  const ffmpegPath = isMac
    ? path.resolve(dirname, 'ffmpeg-mac/ffmpeg')
    : path.resolve(dirname, 'ffmpeg-win/ffmpeg.exe')
  const ffprobePath = isMac
    ? path.resolve(dirname, 'ffmpeg-mac/ffprobe')
    : path.resolve(dirname, 'ffmpeg-win/ffprobe.exe')
  ffmpeg.setFfmpegPath(ffmpegPath)
  ffmpeg.setFfprobePath(ffprobePath)
  ffmpeg.ffmpegPath = ffmpegPath
  ffmpeg.ffprobePath = ffprobePath
}

// const isDev = import.meta.env.MODE === 'development'
// const ffmpegPath = isDev
//   ? path.join(__dirname, '../../resources/ffmpeg', 'ffmpeg')
//   : isMac
//     ? path.join(process.resourcesPath, 'ffmpeg')
//     : path.join(process.resourcesPath, 'ffmpeg.exe')
// ffmpeg.setFfmpegPath(ffmpegPath)
export default ffmpeg
