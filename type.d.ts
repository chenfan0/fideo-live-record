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
