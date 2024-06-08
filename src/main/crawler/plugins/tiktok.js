import debug from 'debug'

import { ERROR_CODE, SUCCESS_CODE } from '../../../error'

import { request } from '../request.js'
import { handleErrMsg } from '../handleErrMsg.js'

const log = debug('fideo-live-stream-getTiktok')

export async function getTiktokLiveUrl(roomId, others = {}) {
  const { proxy, cookie } = others
  log('get tiktok live url start: ', roomId, cookie, proxy)
  try {
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
      // 不等于 2 则未开播
      return {
        code: ERROR_CODE.NOT_URLS
      }
    }

    const streamDataObj = JSON.parse(pullData.stream_data).data
    const sdkKeyToNameMap = {}
    const sdkKeyToLevelMap = {}

    for (const quality of qualities) {
      sdkKeyToNameMap[quality.sdk_key] = quality.name
      sdkKeyToLevelMap[quality.sdk_key] = quality.level
    }

    const liveUrlObj = {
      best: []
    }
    let maxLevel = -Number.MAX_SAFE_INTEGER
    let bestUrl = ''

    for (const sdkKey of Object.keys(streamDataObj)) {
      const streamData = streamDataObj[sdkKey].main
      const name = sdkKeyToNameMap[sdkKey]
      if (!name) continue
      const level = sdkKeyToLevelMap[sdkKey]
      const flv = streamData.flv
      const hls = streamData.hls

      if (level > maxLevel) {
        maxLevel = level
        bestUrl = [flv, hls].filter(Boolean)
        liveUrlObj.best = bestUrl
      }

      liveUrlObj[name] = [flv, hls].filter(Boolean)
    }
    return {
      code: SUCCESS_CODE,
      liveUrlObj
    }
  } catch (e) {
    const errMsg = e.message

    log('get tiktok live url error: ', errMsg)

    return handleErrMsg(errMsg)
  }
}
