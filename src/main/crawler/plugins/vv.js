import debug from 'debug'

import { MOBILE_USER_AGENT, request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-vv')

function getRoomIdByUrl(url) {
  return new URL(url).searchParams.get('roomId')
}

async function baseGetVvLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const formData = new FormData()
  formData.append('siteId', roomId)
  const json = await (
    await request(`https://h5-ddos.wasaixiu.com/room/video/getRoomData.do?roomId=${roomId}`, {
      proxy,
      headers: {
        cookie,
        'User-Agent': MOBILE_USER_AGENT
      }
    })
  ).data

  if (json.hadLivingRoom !== true) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }
  log('json:', json)
  const videoUrl = json.videoUrl

  return {
    code: SUCCESS_CODE,
    liveUrls: [videoUrl]
  }
}

async function baseGetVvRoomInfoPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others
}

export const getVvLiveUrlsPlugin = captureError(baseGetVvLiveUrlsPlugin)
export const getVvRoomInfoPlugin = captureError(baseGetVvRoomInfoPlugin)
