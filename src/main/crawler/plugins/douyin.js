import debug from 'debug'

import { request } from '../request.js'
import { SUCCESS_CODE } from '../../../error'
import { handleErrMsg } from '../handleErrMsg.js'

const log = debug('fideo-live-stream-getDouYinLiveUrl')

// ld: 标清
// sd: 高清
// hd: 超清
// origin: 原画
const clarities = ['origin', 'hd', 'sd', 'ld']
const clarityMap = {
  origin: '原画',
  hd: '超清',
  sd: '高清',
  ld: '标清'
}
export async function getDouYinLiveUrl(roomId, others = {}) {
  const { proxy, cookie } = others
  log('getDouYinLiveUrl start: ', roomId, cookie, proxy)
  try {
    const baseUrl = 'https://live.douyin.com/'
    const fetchRoomUrl = `${baseUrl}${roomId}`
    const fetchUrl = `${baseUrl}webcast/room/web/enter/?aid=6383&app_name=douyin_web&live_id=1&device_platform=web&language=zh-CN&enter_from=web_live&cookie_enabled=true&screen_width=1728&screen_height=1117&browser_language=zh-CN&browser_platform=MacIntel&browser_name=Chrome&browser_version=116.0.0.0&web_rid=${roomId}`
    // const urlData = (await request(fetchUrl, {
    //   proxy,
    //   headers: {
    //     cookie
    //   }
    // })).data

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

    const liveUrlObj = {
      best: []
    }
    for (const clarity of clarities) {
      const main = streamData[clarity]?.main
      if (!main) continue
      const urls = []
      main.flv && urls.push(main.flv)
      main.hls && urls.push(main.hls)
      liveUrlObj[clarityMap[clarity]] = urls
      if (clarity === 'origin') {
        liveUrlObj.best = urls
      }
    }
    return {
      code: SUCCESS_CODE,
      liveUrlObj
    }
  } catch (e) {
    const errMsg = e.message
    log('get douyin live url error: ', errMsg)
    return handleErrMsg(errMsg)
  }
}
