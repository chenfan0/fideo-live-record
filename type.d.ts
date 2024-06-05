interface IStreamConfig {
  title: string
  roomUrl: string
  filename: string
  saveDirectoryPath: string
  proxy?: string
  cookie?: string
  interval: number
  liveUrlObj?: Record<string, string[]>
  segmentTime?: number | ''
  line: string // '0' '1' eg
  alreadyTryLine?: number[]
  status: number
}
