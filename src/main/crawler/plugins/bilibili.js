import debug from 'debug'

import { request } from '../base-request.js'

import { SUCCESS_CODE } from '../../../code'
import { captureError } from '../capture-error'

const log = debug('fideo-live-stream-getBilibiliLiveUrl')

async function baseGetBilibiliLiveUrlsPlugin(roomId, others = {}) {
  const { cookie, proxy } = others
  log('getBilibiliLiveUrl start: ', roomId, cookie, proxy)
  const liveInfoJson = (
    await request(
      `https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${roomId}&no_playurl=0&mask=1&qn=0&platform=web&protocol=0,1&format=0,1,2&codec=0,1,2&dolby=5&panorama=1`,
      {
        headers: { cookie },
        proxy
      }
    )
  ).data
  const streams = liveInfoJson.data.playurl_info.playurl.stream
  let maxQn = -1
  const liveUrls = []
  for (const stream of streams) {
    const formats = stream.format
    for (const format of formats) {
      const codecs = format.codec
      for (const codec of codecs) {
        const base_url = codec.base_url
        const qns = codec.accept_qn || []
        const url_infos = codec.url_info
        qns.forEach((qn) => {
          if (qn > maxQn) {
            maxQn = qn
          }
        })
        for (const url_info of url_infos) {
          if (!base_url.includes('/index.')) {
            continue
          }
          const params = new URLSearchParams(url_info.extra)
          params.set('qn', maxQn)
          const url = url_info.host + base_url + params.toString()
          liveUrls.push(url)
        }
      }
    }
  }
  console.log('liveUrls', liveUrls)
  return {
    code: SUCCESS_CODE,
    liveUrls
  }
}

export const getBilibiliLiveUrlsPlugin = captureError(baseGetBilibiliLiveUrlsPlugin)
