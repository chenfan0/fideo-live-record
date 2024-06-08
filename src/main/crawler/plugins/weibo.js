import debug from 'debug'

import { request } from '../request'
import { handleErrMsg } from '../handleErrMsg'
import { SUCCESS_CODE } from '../../../error'
import { NOT_URLS } from '../const'

const log = debug('fideo-live-stream-getWeiboLiveUrl')

export async function getWeiboLiveUrl(roomId, others = {}) {
  const { proxy, cookie } = others
  log('getWeiboLiveUrl start: ', roomId, cookie, proxy)

  try {
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
      return NOT_URLS
    }

    const hls = data.live_origin_hls_url
    const flv = data.live_origin_flv_url

    const liveUrlObj = {
      best: [flv, hls],
      origin: [flv, hls]
    }

    return {
      liveUrlObj,
      code: SUCCESS_CODE
    }
  } catch (e) {
    const errMsg = e.message

    log('getWeiboLiveUrl error: ', errMsg)

    return handleErrMsg(errMsg)
  }
}
