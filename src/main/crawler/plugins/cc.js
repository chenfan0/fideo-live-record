import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-cc')

async function baseGetCCLiveUrlsPlugin(roomId, others = {}) {
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const json = (
    await request(`https://vapi.cc.163.com/video_play_url/${roomId}`, {
      proxy,
      headers: {
        cookie
      }
    })
  ).data
  const { cdn_list, tcvbr_list } = json
  const vbrKeys = Object.keys(tcvbr_list)
  const liveUrls = []
  let maxVbr = -1
  const p = []
  for (const cdn of cdn_list) {
    for (const vbrKey of vbrKeys) {
      const vbr = tcvbr_list[vbrKey]
      if (vbr > maxVbr) {
        maxVbr = vbr
      }
    }
    p.push(
      request(`https://vapi.cc.163.com/video_play_url/${roomId}?cdn=${cdn}&vbr=${maxVbr}`, {
        proxy,
        headers: {
          cookie
        }
      }).then(({ data: json }) => {
        const url = json.videourl
        liveUrls.push(url)
      })
    )
  }
  await Promise.all(p)
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

export const getCCLiveUrlsPlugin = captureError(baseGetCCLiveUrlsPlugin)
