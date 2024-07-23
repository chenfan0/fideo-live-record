import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-weibo')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[5]
}

async function baseGetWeiboLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)

  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const referer = `https://weibo.com/l/wblive/p/show/${roomId}`
  const json = (
    await request(`https://weibo.com/l/!/2/wblive/room/show_pc_live.json?live_id=${roomId}`, {
      proxy,
      headers: {
        cookie,
        referer
      }
    })
  ).data

  const data = json.data
  const status = data.status

  if (status !== 1) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  const hls = data.live_origin_hls_url
  const flv = data.live_origin_flv_url

  const liveUrls = []
  flv && liveUrls.push(flv)
  hls && liveUrls.push(hls)

  if (liveUrls.length === 0) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  return {
    code: SUCCESS_CODE,
    liveUrls: [flv, hls]
  }
}

export const getWeiboLiveUrlsPlugin = captureError(baseGetWeiboLiveUrlsPlugin)
