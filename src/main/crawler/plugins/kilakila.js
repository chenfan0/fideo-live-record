import debug from 'debug'

import { request, DESKTOP_USER_AGENT } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-kilakila')

function getRoomIdByUrl(url) {
  return new URL(url).searchParams.get('id')
}

async function baseGetKilakilaLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const res = (
    await request(`https://live.kilakila.cn/LiveRoom/getRoomInfo?roomId=${roomId}`, {
      headers: {
        cookie,
        'User-Agent': DESKTOP_USER_AGENT
      }
    })
  ).data

  const b = res.b
  if (b.liveStartStr !== '直播中') {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }
  const fetchRoomId = b.roomId

  if (Number(fetchRoomId) === Number(roomId)) {
    return {
      code: SUCCESS_CODE,
      liveUrls: [b.flvPlayUrl, b.hlsPlayUrl]
    }
  }

  const newRes = (
    await request(`https://live.kilakila.cn/LiveRoom/getRoomInfo?roomId=${fetchRoomId}`, {
      headers: {
        cookie,
        'User-Agent': DESKTOP_USER_AGENT
      }
    })
  ).data

  const newB = newRes.b
  if (newB.liveStartStr !== '直播中') {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  const liveUrls = [newB.flvPlayUrl, newB.hlsPlayUrl].filter(Boolean)

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

export const getKilakilaLiveUrlsPlugin = captureError(baseGetKilakilaLiveUrlsPlugin)
