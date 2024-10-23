import debug from 'debug'

import { DESKTOP_USER_AGENT, request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-kuaishou')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[2]
}

async function baseGetKuaishouLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others
  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  if (!cookie) {
    return {
      code: CRAWLER_ERROR_CODE.COOKIE_IS_REQUIRED
    }
  }

  const data = (
    await request('https://live.kuaishou.com/live_api/follow/living', {
      headers: {
        cookie,
        'User-Agent': DESKTOP_USER_AGENT
      }
    })
  ).data

  const list = data.data.list
  let liveUrl = ''

  for (const item of list) {
    const { author, playUrls } = item

    if (author.id !== roomId) {
      continue
    }

    let maxBitrate = 0
    const representations = playUrls[0].adaptationSet.representation

    for (const representation of representations) {
      const { bitrate, url } = representation

      if (bitrate > maxBitrate) {
        maxBitrate = bitrate
        liveUrl = url
      }
    }
  }

  if (!liveUrl) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  return {
    code: SUCCESS_CODE,
    liveUrls: [liveUrl]
  }
}

export const getKuaishouLiveUrlsPlugin = captureError(baseGetKuaishouLiveUrlsPlugin)
