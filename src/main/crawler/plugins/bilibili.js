import debug from 'debug'

import { request, DESKTOP_USER_AGENT } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-bilibili')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[1]
}

async function baseGetBilibiliLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { cookie, proxy } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const response = await request(
    `https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${roomId}&protocol=0,1&format=0,1,2&codec=0,1&ptype=8`
  )

  const streams = response.data.data.playurl_info.playurl.stream

  const liveUrls = []

  for (const stream of streams) {
    const formatName = stream.format[0].format_name
    let realUrl = null
    if (formatName === 'ts') {
      const formatIndex = stream.format.length - 1
      const codecIndex = stream.format[formatIndex].codec.length - 1
      const baseUrl = stream.format[formatIndex].codec[codecIndex].base_url
      const urlInfo = stream.format[formatIndex].codec[codecIndex].url_info
      const accept_qn = stream.format[formatIndex].codec[codecIndex].accept_qn

      const maxQn = Math.max(...accept_qn)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [_, info] of urlInfo.entries()) {
        let selectedHost = info.host
        let selectedExtra = info.extra

        if (selectedHost && selectedExtra) {
          let realUrl = `${selectedHost}${baseUrl}${selectedExtra}`
          const qnIndex = realUrl.indexOf('qn=')
          if (qnIndex !== -1) {
            const qnEndIndex = realUrl.indexOf('&', qnIndex)
            realUrl = realUrl.slice(0, qnIndex) + `qn=${maxQn}` + realUrl.slice(qnEndIndex)
          }
          liveUrls.push(realUrl)
          break
        }
      }
    }

    if (realUrl) break
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

async function baseGetBilibiliRoomInfoPlugin(roomUrl, others = {}) {
  const { proxy, cookie } = others

  const html = (
    await request(roomUrl, {
      headers: {
        cookie,
        'User-Agent': DESKTOP_USER_AGENT
      },
      proxy
    })
  ).data

  const flag = 'uname":"'
  const startIndex = html.indexOf(flag) + flag.length
  const endIndex = html.indexOf('","', startIndex)
  const name = html.slice(startIndex, endIndex)

  return {
    code: SUCCESS_CODE,
    roomInfo: { name }
  }
}

export const getBilibiliLiveUrlsPlugin = captureError(baseGetBilibiliLiveUrlsPlugin)
export const getBilibiliRoomInfoPlugin = captureError(baseGetBilibiliRoomInfoPlugin)
