interface IStreamConfig {
  title: string
  roomUrl: string
  filename: string
  directory: string
  proxy?: string
  cookies?: string
  interval: number
  roomLines?: string[]
  segmentTime?: string | ''
  line: string // '0' '1' eg
  status: number
}
type Lang = 'en' | 'cn'
interface IDefaultDefaultSettingsConfig {
  directory: string
  lang: Lang
}
