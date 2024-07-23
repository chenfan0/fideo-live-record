import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-tiktok')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[1]
}

async function baseGetTiktokLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const htmlContent = (
    await request(`https://www.tiktok.com/${roomId}/live`, {
      headers: {
        cookie
      },
      proxy
    })
  ).data

  const scriptContentRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  const matches = htmlContent.match(scriptContentRegex)
  let str = ''
  for (const match of matches) {
    if (match.includes('liveRoomUserInfo') && match.includes('LiveRoom')) {
      str = match.replace(scriptContentRegex, '$1')
      break
    }
  }
  const fn = new Function(`const obj = ${str}; return obj`)

  const obj = fn()
  const pullData = obj.LiveRoom.liveRoomUserInfo.liveRoom.streamData.pull_data
  const qualities = pullData.options.qualities
  const status = obj.LiveRoom.liveRoomUserInfo.liveRoom.status

  if (status !== 2) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  const streamDataObj = JSON.parse(pullData.stream_data).data
  const sdkKeyToNameMap = {}
  const sdkKeyToLevelMap = {}

  for (const quality of qualities) {
    sdkKeyToNameMap[quality.sdk_key] = quality.name
    sdkKeyToLevelMap[quality.sdk_key] = quality.level
  }

  let liveUrls = []
  let maxLevel = -Number.MAX_SAFE_INTEGER

  for (const sdkKey of Object.keys(streamDataObj)) {
    const streamData = streamDataObj[sdkKey].main
    const name = sdkKeyToNameMap[sdkKey]
    if (!name) continue
    const level = sdkKeyToLevelMap[sdkKey]
    const flv = streamData.flv
    const hls = streamData.hls

    if (level > maxLevel) {
      maxLevel = level
      liveUrls = [flv, hls].filter(Boolean)
    }
  }

  if (liveUrls.length === 0) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  return {
    code: SUCCESS_CODE,
    liveUrls
  }
}

export const getTiktokLiveUrlsPlugin = captureError(baseGetTiktokLiveUrlsPlugin)
