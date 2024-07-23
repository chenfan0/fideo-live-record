import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { SUCCESS_CODE, CRAWLER_ERROR_CODE } from '../../../code'

const log = debug('fideo-crawler-yy')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[1]
}

async function baseGetYYLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const data = (
    await request(
      `https://stream-manager.yy.com/v3/channel/streams?uid=0&cid=${roomId}&sid=${roomId}&appid=0&sequence=${Date.now()}&encode=json`,
      {
        method: 'POST',
        data: {
          head: {
            seq: Date.now(),
            appidstr: '0',
            bidstr: '121',
            cidstr: roomId,
            sidstr: roomId,
            uid64: 0,
            client_type: 108,
            client_ver: '5.18.2',
            stream_sys_ver: 1,
            app: 'yylive_web',
            playersdk_ver: '5.18.2',
            thundersdk_ver: '0',
            streamsdk_ver: '5.18.2'
          },
          client_attribute: {
            client: 'web',
            model: 'web1',
            cpu: '',
            graphics_card: '',
            os: 'chrome',
            osversion: '126.0.0.0',
            vsdk_version: '',
            app_identify: '',
            app_version: '',
            business: '',
            width: '1920',
            height: '1080',
            scale: '',
            client_type: 8,
            h265: 0
          },
          avp_parameter: {
            version: 1,
            client_type: 8,
            service_type: 0,
            imsi: 0,
            send_time: 1720617734,
            line_seq: -1,
            gear: 4,
            ssl: 1,
            stream_format: 0
          }
        }
      }
    )
  ).data

  const avp_info_res = data.avp_info_res

  const stream_line_addr = avp_info_res.stream_line_addr
  const stream_line_list = avp_info_res.stream_line_list

  const keys = Object.keys(stream_line_list)
  const liveUrls = []

  for (const key of keys) {
    const stream = stream_line_addr[key]
    if (!stream) continue
    const url = stream.cdn_info?.url
    if (!url) continue
    liveUrls.push(url)
  }

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

export const getYYLiveUrlsPlugin = captureError(baseGetYYLiveUrlsPlugin)
