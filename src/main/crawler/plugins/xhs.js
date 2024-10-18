// example
// https://www.xiaohongshu.com/hina/livestream/569443549099268368?timestamp=1729227035942&share_source=&share_source_id=null&source=share_out_of_app&host_id=6509435d0000000017023f36&xhsshare=WeixinSession&appuid=61129228000000000101df0a&apptime=1729227039&share_id=3c968a8ae43c4c0f8e2200626646ffa9

// https://www.xiaohongshu.com/api/sns/red/live/app/v1/ecology/outside/share_info?room_id=569443549099268368

import debug from 'debug'

import { request, MOBILE_USER_AGENT } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-xhs')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[3]
}

async function baseGetXhsUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const res = (
    await request(
      `https://www.xiaohongshu.com/api/sns/red/live/app/v1/ecology/outside/share_info?room_id=${roomId}`,
      {
        headers: {
          cookie,
          'User-Agent': MOBILE_USER_AGENT
        }
      }
    )
  ).data

  console.log('res', res)
  const status = res.data.room.status

  if (status !== 0) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  const live_link = res.data.room.live_link

  const flv = new URL(live_link).searchParams.get('flvUrl')

  if (!flv) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  return {
    code: SUCCESS_CODE,
    liveUrls: [flv]
  }
}

export const getXhsUrlsPlugin = captureError(baseGetXhsUrlsPlugin)
