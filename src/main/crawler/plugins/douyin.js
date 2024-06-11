import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-douyin')

async function baseGetDouYinLiveUrlsPlugin(roomId, others = {}) {
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const baseUrl = 'https://live.douyin.com/'
  const fetchRoomUrl = `${baseUrl}${roomId}`
  const fetchUrl = `${baseUrl}webcast/room/web/enter/?aid=6383&app_name=douyin_web&live_id=1&device_platform=web&language=zh-CN&enter_from=web_live&cookie_enabled=true&screen_width=1728&screen_height=1117&browser_language=zh-CN&browser_platform=MacIntel&browser_name=Chrome&browser_version=116.0.0.0&web_rid=${roomId}`

  const [res1, res2] = await Promise.all([request(baseUrl), request(fetchRoomUrl)])
  const setCookie = `${res1.headers.get('set-cookie')};${res2.headers.get('set-cookie')};${cookie ? cookie : ''}`
  const pullData = (
    await request(fetchUrl, {
      headers: {
        cookie: setCookie
      },
      proxy
    })
  ).data.data.data[0].stream_url.live_core_sdk_data.pull_data

  const streamData = JSON.parse(pullData.stream_data).data

  const liveUrls = []
  const main = streamData['origin']?.main
  main.flv && liveUrls.push(main.flv)
  main.hls && liveUrls.push(main.hls)

  return {
    code: SUCCESS_CODE,
    liveUrls
  }
}

export const getDouYinLiveUrlsPlugin = captureError(baseGetDouYinLiveUrlsPlugin)
