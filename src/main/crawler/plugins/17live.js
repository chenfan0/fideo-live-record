import debug from 'debug'

import { request, MOBILE_USER_AGENT } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-17live')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[3]
}

async function baseGet17LiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const res = (
    await request(`https://wap-api.17app.co/api/v1/lives/${roomId}/info`, {
      headers: {
        cookie,
        'User-Agent': MOBILE_USER_AGENT
      }
    })
  ).data

  if (res.status !== 2) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  const rtmpUrls = res.rtmpUrls

  const urls = rtmpUrls.map((rtmpUrl) => rtmpUrl.urlHighQuality || rtmpUrl.url)

  console.log('res', res)

  return {
    code: SUCCESS_CODE,
    liveUrls: urls
  }
}

export const get17LiveUrlsPlugin = captureError(baseGet17LiveUrlsPlugin)
