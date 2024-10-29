import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-xhs')

function getRoomIdByUrl(url) {
  const _url = new URL(url)

  if (_url.pathname.startsWith('/user/profile/')) {
    return _url.pathname.split('/')[3]
  }

  return _url.searchParams.get('host_id')
}

// 参考 https://github.com/ihmily/DouyinLiveRecorder/blob/6508c0549c66afce7f09d30a9b5d87287f8fbf1e/douyinliverecorder/spider.py#L708
async function baseGetXhsUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const res = (
    await request(
      `https://live-room.xiaohongshu.com/api/sns/v1/live/user_status?user_id_list=${roomId}`,
      {
        headers: {
          'User-Agent': 'ios/7.830 (ios 17.0; ; iPhone 15 (A2846/A3089/A3090/A3092))',
          'xy-common-params': 'platform=iOS&sid=session.1722166379345546829388',
          referer: 'https://app.xhs.cn/'
        }
      }
    )
  ).data

  console.log('res', res)

  if (res.data.length === 0) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  const live_link = res.data[0].live_link

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

async function baseGetXhsRoomInfoPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others
}

export const getXhsUrlsPlugin = captureError(baseGetXhsUrlsPlugin)
export const getXhsRoomInfoPlugin = captureError(baseGetXhsRoomInfoPlugin)
