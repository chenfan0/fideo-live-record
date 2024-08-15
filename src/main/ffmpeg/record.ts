import fs from 'node:fs'
import path from 'node:path'

import debug from 'debug'
import dayjs from 'dayjs'

import ffmpeg from '.'

import { SUCCESS_CODE, FFMPEG_ERROR_CODE } from '../../code'

import { RECORD_DUMMY_PROCESS } from '../../const'

const log = debug('fideo-record-stream')

const KILL_MESSAGE = 'ffmpeg was killed with signal SIGKILL'

const FLV_FLAG = '.flv'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const recordStreamFfmpegProgressInfo: IFfmpegProgressInfo = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setRecordStreamFfmpegProgressInfo = (title: string, progress: any) => {
  recordStreamFfmpegProgressInfo[title] = progress
}

export const recordStreamFfmpegProcessMap = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setRecordStreamFfmpegProcessMap = (title: string, process: any) => {
  recordStreamFfmpegProcessMap[title] = process
}

export const resetRecordStreamFfmpeg = (title: string) => {
  const process = recordStreamFfmpegProcessMap[title]

  const isDummy = process === RECORD_DUMMY_PROCESS

  process?.kill('SIGKILL')
  delete recordStreamFfmpegProgressInfo[title]
  delete recordStreamFfmpegProcessMap[title]

  return isDummy
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

async function convertFlvToMp4(sourcePath: string) {
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
    .on('end', () => {
      fs.unlinkSync(sourcePath)
      _resolve()
    })
    .on('error', () => {
      _resolve()
    })
    .save(output)

  return p
}

async function convert(sourcePath: string, convertToMP4 = true) {
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
      await convertFlvToMp4(flvFile)
    }
  } else {
    await convertFlvToMp4(sourcePath)
  }
}

export async function recordStream(streamConfig: IStreamConfig, cb?: (code: number) => void) {
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

  const { liveUrls, line, directory, filename, proxy, cookie, title, segmentTime, convertToMP4 } =
    streamConfig

  const secondSegmentTime = Number(segmentTime) * 60
  const isSegmentMode = secondSegmentTime > 0

  const time = dayjs().format('YYYY.MM.DD-HH.mm.ss')
  const baseOutput = path.resolve(directory, `${filename}-${time}`)
  const output = isSegmentMode ? path.resolve(baseOutput, `%03d`) : baseOutput
  const convertSource = isSegmentMode ? baseOutput : output + FLV_FLAG

  if (isSegmentMode) {
    fs.mkdirSync(baseOutput)
  }

  if (recordStreamFfmpegProcessMap[title] !== RECORD_DUMMY_PROCESS) {
    _resolve({
      code: FFMPEG_ERROR_CODE.USER_KILL_PROCESS
    })
    cb?.(FFMPEG_ERROR_CODE.USER_KILL_PROCESS)
    return p
  }
  const ffmpegProcess = ffmpeg().addInput(liveUrls![Number(line)])

  ffmpegProcess.inputOptions(['-re'])

  setRecordStreamFfmpegProcessMap(title, ffmpegProcess)

  ffmpegProcess.inputOption(
    '-headers',
    'User-Agent: Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Mobile Safari/537.36'
  )
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
      _resolve({
        code: SUCCESS_CODE
      })
    })
    .on('progress', (progress) => {
      setRecordStreamFfmpegProgressInfo(title, progress)
      log('record live progress: ', progress)
    })
    .on('end', async (...args) => {
      const msg = args.join(' ')

      log('record live end: ', msg)

      resetRecordStreamFfmpeg(title)

      cb?.(SUCCESS_CODE)
      await convert(convertSource, convertToMP4)
      cb?.(SUCCESS_CODE)
    })
    .on('error', async (error) => {
      const errMsg = error.message

      log('record live error: ', errMsg)

      resetRecordStreamFfmpeg(title)

      if (errMsg !== KILL_MESSAGE) {
        let errCode = FFMPEG_ERROR_CODE.CURRENT_LINE_ERROR
        if (errMsg.includes('Error opening input files: Operation timed out')) {
          errCode = FFMPEG_ERROR_CODE.TIME_OUT
        }
        cb?.(errCode)
        await convert(convertSource, convertToMP4)
        cb?.(errCode)
      } else {
        cb?.(FFMPEG_ERROR_CODE.USER_KILL_PROCESS)
        await convert(convertSource, convertToMP4)
        cb?.(FFMPEG_ERROR_CODE.USER_KILL_PROCESS)
      }
    })
    .save(output + FLV_FLAG)
  return p
}
