import debug from 'debug'

import { request, DESKTOP_USER_AGENT } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-momo')

function getRoomIdByUrl(url) {
  const startIndex = url.indexOf('roomid=')
  const endIndex = url.indexOf('&', startIndex)
  return url.slice(startIndex + 7, endIndex)
}

async function baseGetMomoLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  if (!cookie) {
    return {
      code: CRAWLER_ERROR_CODE.COOKIE_IS_REQUIRED
    }
  }

  const res = (
    await request(`https://web.immomo.com/video/web/profile/enter?roomid=${roomId}&enterRoom=1`, {
      method: 'POST',
      proxy,
      headers: {
        cookie,
        'User-Agent': DESKTOP_USER_AGENT
      }
    })
  ).data

  const errmsg = res.errmsg

  if (errmsg === '请登录') {
    return {
      code: CRAWLER_ERROR_CODE.COOKIE_IS_REQUIRED
    }
  }

  if (errmsg !== 'ok') {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  return {
    code: SUCCESS_CODE,
    liveUrls: res.data.urls.map((url) => url.url)
  }
}

async function baseGetMomoRoomInfoPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others
}

export const getMomoLiveUrlsPlugin = captureError(baseGetMomoLiveUrlsPlugin)
export const getMomoRoomInfoPlugin = captureError(baseGetMomoRoomInfoPlugin)
