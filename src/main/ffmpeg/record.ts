import fs from 'node:fs'
import path from 'node:path'

import debug from 'debug'
import dayjs from 'dayjs'

import execa from 'execa'

import ffmpeg from '.'

import { SUCCESS_CODE, FFMPEG_ERROR_CODE, UNKNOWN_CODE } from '../../code'

import { RECORD_DUMMY_PROCESS } from '../../const'

const log = debug('fideo-record-stream')

const KILL_MESSAGE = 'ffmpeg was killed with signal SIGKILL'

const FLV_FLAG = '.flv'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const recordStreamFfmpegProgressInfo: IFfmpegProgressInfo = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setRecordStreamFfmpegProgressInfo = (id: string, progress: any) => {
  recordStreamFfmpegProgressInfo[id] = progress
}

export const recordStreamFfmpegProcessMap = {}

export const setRecordStreamFfmpegProcessMap = (id: string, process: any) => {
  recordStreamFfmpegProcessMap[id] = process
}

export const killRecordStreamFfmpegProcess = (id: string) => {
  const process = recordStreamFfmpegProcessMap[id]

  const isDummy = process === RECORD_DUMMY_PROCESS || !process
  process?.kill('SIGKILL')
  delete recordStreamFfmpegProgressInfo[id]
  delete recordStreamFfmpegProcessMap[id]

  killDetectStreamProcess(id)

  return isDummy
}

const detectStreamProcessMap = {}
const streamResolutionMap = {}
const setDetectStreamProcessMap = (id: string, process: execa.ExecaChildProcess) => {
  detectStreamProcessMap[id] = process
}
const killDetectStreamProcess = (id: string) => {
  const process = detectStreamProcessMap[id]
  process?.kill('SIGKILL')

  delete detectStreamProcessMap[id]
  delete streamResolutionMap[id]
}

const resolutionChangeSet = new Set()
const addResolutionChangeSet = (id: string) => {
  resolutionChangeSet.add(id)
}
const removeResolutionChangeSet = (id: string) => {
  resolutionChangeSet.delete(id)
}

const checkFileExist = async (filepath: string) => {
  return new Promise((resolve) => {
    fs.access(filepath, fs.constants.F_OK, (err) => {
      if (err) {
        log('file not exist: ', filepath)
        setTimeout(() => {
          resolve(false)
        }, 800)
      } else {
        resolve(true)
      }
    })
  })
}

async function convertFlvToMp4(sourcePath: string, writeLog: (content: string) => void) {
  if (!(await checkFileExist(sourcePath))) return
  const process = ffmpeg()
  const output = sourcePath.replace(FLV_FLAG, '.mp4')
  let _resolve: (value?: unknown) => void
  const p = new Promise((resolve) => {
    _resolve = resolve
  })

  process
    .addInput(sourcePath)
    .videoCodec('copy')
    .audioCodec('copy')
    .inputFormat('flv')
    .outputFormat('mp4')
    .on('start', () => {
      writeLog(`Convert Flv To Mp4 Start: ${sourcePath}`)
    })
    .on('end', () => {
      fs.unlinkSync(sourcePath)
      writeLog(`Convert Flv To Mp4 Success: ${sourcePath}`)
      _resolve()
    })
    .on('error', () => {
      writeLog(`Convert Flv To Mp4 Error: ${sourcePath}`)
      _resolve()
    })
    .save(output)

  return p
}

async function convert(
  sourcePath: string,
  writeLog: (content: string) => void,
  convertToMP4 = true
) {
  if (!convertToMP4) return
  if (!(await checkFileExist(sourcePath))) return
  const stats = fs.statSync(sourcePath)
  const isDirectory = stats.isDirectory()

  if (isDirectory) {
    await delay(1500)
    const files = fs.readdirSync(sourcePath)
    const flvFiles = files
      .filter((file) => file.endsWith('.flv'))
      .map((file) => path.join(sourcePath, file))

    for (const flvFile of flvFiles) {
      await convertFlvToMp4(flvFile, writeLog)
    }
  } else {
    await convertFlvToMp4(sourcePath, writeLog)
  }
}

async function detectStreamResolution(streamConfig: IStreamConfig) {
  const { liveUrls, line, cookie, proxy, id } = streamConfig

  // 检测之前先清除之前的检测数据
  removeResolutionChangeSet(id)

  const process = execa(ffmpeg.ffprobePath, [
    '-v',
    'error',
    '-show_entries',
    'frame=width,height',
    '-select_streams',
    'v',
    '-skip_frame',
    'nokey',
    '-of',
    'csv=p=0',
    '-headers',
    'User-Agent: Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Mobile Safari/537.36',
    ...(proxy ? ['-http_proxy', proxy] : []),
    ...(cookie ? ['-headers', `Cookie: ${cookie}`] : []),
    liveUrls![Number(line)]
  ])

  process.on('error', (error) => {
    log('detect stream resolution error: ', error)

    delete detectStreamProcessMap[id]
  })

  process.stdout?.on('data', (data) => {
    const stringData = data.toString() as string
    const [width, height] = stringData.split(',').map((item) => item.replace('\n', ''))

    const prevResolution = streamResolutionMap[id]
    log('width, height: ', width, height)

    if (!prevResolution) {
      streamResolutionMap[id] = {
        width,
        height
      }
    } else {
      const { width: prevWidth, height: prevHeight } = prevResolution

      if (prevWidth !== width || prevHeight !== height) {
        log('resolution change: ', id, width, height)

        addResolutionChangeSet(id)

        killRecordStreamFfmpegProcess(id)

        return
      }

      streamResolutionMap[id] = {
        width,
        height
      }
    }
  })

  setDetectStreamProcessMap(id, process)
}

export async function recordStream(
  streamConfig: IStreamConfig,
  writeLog: (title: string, content: string) => void,
  cb?: (code: number, errMsg?: string) => void
) {
  log('start record stream')
  let _resolve!: (
    value:
      | {
          code: number
        }
      | PromiseLike<{
          code: number
        }>
  ) => void
  const p: Promise<{ code: number }> = new Promise((resolve) => {
    _resolve = resolve
  })

  const {
    liveUrls,
    line,
    roomUrl,
    directory,
    filename,
    proxy,
    cookie,
    title,
    segmentTime,
    convertToMP4,
    detectResolution,
    id
  } = streamConfig

  writeLog(title, `RecordStream Config: ${JSON.stringify(streamConfig, null, 2)}`)

  detectResolution && detectStreamResolution(streamConfig)

  const secondSegmentTime = Number(segmentTime) * 60
  const isSegmentMode = secondSegmentTime > 0

  const time = dayjs().format('YYYY.MM.DD-HH.mm.ss')
  const baseOutput = path.resolve(directory, `${filename}-${time}`)
  const output = isSegmentMode ? path.resolve(baseOutput, `%03d`) : baseOutput
  const convertSource = isSegmentMode ? baseOutput : output + FLV_FLAG

  if (isSegmentMode) {
    fs.mkdirSync(baseOutput)
  }

  if (recordStreamFfmpegProcessMap[id] !== RECORD_DUMMY_PROCESS) {
    writeLog(title, 'Record Stream is Killed')
    _resolve({
      code: FFMPEG_ERROR_CODE.USER_KILL_PROCESS
    })
    /**
     * 如果是这种情况，说明是在获取直播地址的时候，用户停止了录制
     * 这个回调会在用户执行停止录制的时候被调用，这个时候不需要再次调用停止录制的回调
     */
    // cb?.(FFMPEG_ERROR_CODE.USER_KILL_PROCESS)
    return p
  }
  const ffmpegProcess = ffmpeg().addInput(liveUrls![Number(line)])

  ffmpegProcess.inputOptions(['-re'])

  setRecordStreamFfmpegProcessMap(id, ffmpegProcess)

  ffmpegProcess.inputOption(
    '-headers',
    'User-Agent: Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Mobile Safari/537.36'
  )

  if (!roomUrl.includes('huya.com')) {
    // 虎牙添加referer 会录制不了
    ffmpegProcess.inputOption('-headers', `Referer: ${roomUrl}`)
  }

  if (proxy) {
    ffmpegProcess.inputOption('-http_proxy', proxy)
  }
  if (cookie) {
    ffmpegProcess.inputOption('-headers', `Cookie: ${cookie}`)
  }
  if (secondSegmentTime > 0) {
    ffmpegProcess.outputOptions([
      '-f segment',
      `-segment_time ${secondSegmentTime}`,
      '-reset_timestamps 1'
    ])
  }

  ffmpegProcess
    .videoCodec('copy')
    .audioCodec('copy')
    .on('start', (...args) => {
      log('record live start', args.join(' '))

      writeLog(title, `Record Live Start: ${args.join(' ')}`)

      _resolve({
        code: SUCCESS_CODE
      })
    })
    .on('progress', (progress) => {
      setRecordStreamFfmpegProgressInfo(id, {
        targetSize: progress.targetSize,
        timemark: progress.timemark
      })
      log('record live progress: ', progress)
    })
    .on('end', async (...args) => {
      const msg = args.join(' ')

      log('record live end: ', msg)
      writeLog(title, `Record Live End: ${msg}`)

      killRecordStreamFfmpegProcess(id)

      cb?.(SUCCESS_CODE)
      await convert(convertSource, writeLog.bind(null, title), convertToMP4)
      cb?.(SUCCESS_CODE)
    })
    .on('error', async (error) => {
      const errMsg = error.message

      log('record live error: ', errMsg)
      writeLog(title, `Record Live Error: ${errMsg}`)
      const isResolutionChange = resolutionChangeSet.has(id)
      // 清空数据
      killRecordStreamFfmpegProcess(id)

      let errCode!: number

      if (isResolutionChange) {
        errCode = FFMPEG_ERROR_CODE.RESOLUTION_CHANGE
      } else if (errMsg !== KILL_MESSAGE) {
        errCode = UNKNOWN_CODE
        if (errMsg.includes('Error opening input files: Operation timed out')) {
          errCode = FFMPEG_ERROR_CODE.TIME_OUT
        }
      } else {
        errCode = FFMPEG_ERROR_CODE.USER_KILL_PROCESS
      }

      cb?.(errCode, errMsg)
      await convert(convertSource, writeLog.bind(null, title), convertToMP4)
      cb?.(errCode, errMsg)
    })
    .save(output + FLV_FLAG)
  return p
}
