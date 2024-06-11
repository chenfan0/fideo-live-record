import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-weibo')

async function baseGetWeiboLiveUrlsPlugin(roomId, others = {}) {
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

  return {
    liveUrls: [flv, hls],
    code: SUCCESS_CODE
  }
}

export const getWeiboLiveUrlsPlugin = captureError(baseGetWeiboLiveUrlsPlugin)
