import debug from 'debug'

import { request, MOBILE_USER_AGENT } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-douyin')

async function getMobileData(roomUrl, others = {}) {
  const { proxy, cookie } = others
  // 这里直接用fetch然后取消重定向，获取location
  const location = (
    await fetch(roomUrl, {
      redirect: 'manual'
    })
  ).headers.get('location')

  const url = new URL(location)
  const roomId = url.pathname.split('/').pop()

  const secUserId = url.searchParams.get('sec_user_id')

  const data = (
    await request(
      `https://webcast.amemv.com/webcast/room/reflow/info/?verifyFp=verify_lxj5zv70_7szNlAB7_pxNY_48Vh_ALKF_GA1Uf3yteoOY&type_id=0&live_id=1&version_code=99.99.99&app_id=1128&room_id=${roomId}&sec_user_id=${secUserId}`,
      {
        headers: {
          'User-Agent': MOBILE_USER_AGENT,
          cookie
        },
        proxy
      }
    )
  ).data

  return data
}

async function getDesktopData(roomUrl, others = {}) {
  const roomId = new URL(roomUrl).pathname.split('/')[1]
  const { proxy, cookie } = others
  const baseUrl = 'https://live.douyin.com/'
  const fetchRoomUrl = `${baseUrl}${roomId}`
  const fetchUrl = `${baseUrl}webcast/room/web/enter/?aid=6383&app_name=douyin_web&live_id=1&device_platform=web&language=zh-CN&enter_from=web_live&cookie_enabled=true&screen_width=1728&screen_height=1117&browser_language=zh-CN&browser_platform=MacIntel&browser_name=Chrome&browser_version=116.0.0.0&web_rid=${roomId}`

  const [res1, res2] = await Promise.all([request(baseUrl), request(fetchRoomUrl)])
  const setCookie = `${res1.headers.get('set-cookie')};${res2.headers.get('set-cookie')};${cookie ? cookie : ''}`
  const data = (
    await request(fetchUrl, {
      headers: {
        cookie: setCookie
      },
      proxy
    })
  ).data

  return data
}

async function baseGetMobileDouYinLiveUrlsPlugin(roomUrl, others = {}) {
  const { proxy, cookie } = others

  log('roomUrl:', roomUrl, 'cookie:', cookie, 'proxy:', proxy)

  const data = await getMobileData(roomUrl, others)

  const pullData = data.data.room.stream_url.live_core_sdk_data.pull_data
  const status = data.data.room.status

  if (status !== 2) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  const streamData = JSON.parse(pullData.stream_data).data

  const liveUrls = []
  const main = streamData['origin']?.main
  main.flv && liveUrls.push(main.flv)
  main.hls && liveUrls.push(main.hls)

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

async function baseGetDesktopDouYinLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = new URL(roomUrl).pathname.split('/')[1]
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const data = await getDesktopData(roomUrl, others)

  const pullData = data.data.data[0].stream_url.live_core_sdk_data.pull_data

  const streamData = JSON.parse(pullData.stream_data).data

  const liveUrls = []
  const main = streamData['origin']?.main
  main.flv && liveUrls.push(main.flv)
  main.hls && liveUrls.push(main.hls)

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

async function baseGetDouYinLiveUrlsPlugin(roomUrl, others = {}) {
  const isDesktopUrl = new URL(roomUrl).host === 'live.douyin.com'
  if (isDesktopUrl) {
    return baseGetDesktopDouYinLiveUrlsPlugin(roomUrl, others)
  } else {
    return baseGetMobileDouYinLiveUrlsPlugin(roomUrl, others)
  }
}

async function baseGetDouYinRoomInfoPlugin(roomUrl, others = {}) {
  const isDesktopUrl = new URL(roomUrl).host === 'live.douyin.com'
  let name = ''
  if (isDesktopUrl) {
    const data = await getDesktopData(roomUrl, others)
    name = data.data.data[0].owner.nickname
  } else {
    const data = await getMobileData(roomUrl, others)
    name = data.data.room.owner.nickname
  }

  return {
    code: SUCCESS_CODE,
    roomInfo: { name }
  }
}

export const getDouYinLiveUrlsPlugin = captureError(baseGetDouYinLiveUrlsPlugin)
export const getDouYinRoomInfoPlugin = captureError(baseGetDouYinRoomInfoPlugin)
