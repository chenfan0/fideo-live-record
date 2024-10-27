import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-cc')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[1]
}

async function baseGetCCLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)

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

async function baseGetCCRoomInfoPlugin(roomUrl, others = {}) {
  const { proxy, cookie } = others
  const html = (
    await request(roomUrl, {
      headers: {
        cookie
      },
      proxy
    })
  ).data

  const flag = '"nickname":"'
  const startIndex = html.indexOf(flag) + flag.length
  const endIndex = html.indexOf('","', startIndex)
  const name = html.slice(startIndex, endIndex)

  return {
    code: SUCCESS_CODE,
    roomInfo: { name }
  }
}

export const getCCLiveUrlsPlugin = captureError(baseGetCCLiveUrlsPlugin)
export const getCCRoomInfoPlugin = captureError(baseGetCCRoomInfoPlugin)
