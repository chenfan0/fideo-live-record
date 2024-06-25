import module from 'module'
import os from 'node:os'
import path from 'node:path'

import type Ffmpeg from 'fluent-ffmpeg'

const require = module.createRequire(import.meta.url)
const isMac = os.platform() === 'darwin'
const ffmpeg = require('fluent-ffmpeg') as typeof Ffmpeg

const isDev = import.meta.env.MODE === 'development'
const ffmpegPath = isDev
  ? path.join(__dirname, '../../resources/ffmpeg', 'ffmpeg')
  : isMac
    ? path.join(process.resourcesPath, 'ffmpeg')
    : path.join(process.resourcesPath, 'ffmpeg.exe')
ffmpeg.setFfmpegPath(ffmpegPath)
export default ffmpeg
