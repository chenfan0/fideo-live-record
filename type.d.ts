interface IStreamConfig {
  title: string
  roomUrl: string
  filename: string
  directory: string
  proxy?: string
  cookie?: string
  interval: number
  liveUrls?: string[]
  segmentTime?: string | ''
  line: string // '0' '1' eg
  status: number
  convertToMP4: boolean
  detectResolution: boolean
}
type Lang = 'en' | 'cn'
interface IDefaultDefaultSettingsConfig {
  directory: string
  lang: Lang
  xizhiKey?: string
}

type IFfmpegProgressInfo = Record<
  string,
  {
    frames: number
    currentFps: number
    currentKbps: number
    targetSize: number
    timemark: string
    percent?: number
  }
>

interface IDownloadDepProgressInfo {
  title: string
  showRetry: boolean
  downloading: boolean
  progress: number
}

interface IWebControlSetting {
  webControlPath: string
  enableWebControl: boolean
  email: string
}
