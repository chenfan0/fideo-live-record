import debug from 'debug'

import { request, MOBILE_USER_AGENT, DESKTOP_USER_AGENT } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-changliao')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[1]
}

async function baseGetChangLiaoLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const htmlContent = (
    await request(roomUrl, {
      headers: {
        cookie,
        'User-Agent': MOBILE_USER_AGENT
      }
    })
  ).data

  const scriptReg = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  const matches = htmlContent.match(scriptReg)

  for (const match of matches) {
    if (!match.includes('var config =')) {
      continue
    }

    const scriptContent = match.replace(scriptReg, '$1')

    const fn = new Function(`
      const window = {};
      try {
        ${scriptContent};
      }
      catch(e) {}
      return config
    `)

    const config = fn()

    const domainpullstream_flv = config.domainpullstream_flv
    const domainpullstream_hls = config.domainpullstream_hls

    const roomInfo = (
      await request(
        `https://wap.tlclw.com/api/ui/room/v1.0.0/live.ashx?promoters=0&roomidx=${roomId}&currentUrl=${roomUrl}`,
        {
          headers: {
            cookie,
            'User-Agent': MOBILE_USER_AGENT
          }
        }
      )
    ).data.data.roomInfo

    const liveStat = roomInfo.live_stat

    if (liveStat !== 1) {
      return {
        code: CRAWLER_ERROR_CODE.NOT_URLS
      }
    }

    const liveID = roomInfo.liveID
    const idx = roomInfo.idx

    return {
      code: SUCCESS_CODE,
      liveUrls: [
        `${domainpullstream_flv}/${idx}/${liveID}.flv`,
        `${domainpullstream_hls}/${idx}/${liveID}.m3u8`
      ]
    }
  }

  return {
    code: CRAWLER_ERROR_CODE.NOT_URLS
  }
}

async function baseGetChangLiaoRoomInfoPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  const res = (
    await request(
      `https://www.tlclw.com/ashx/UI/room/base.ashx?v=1.0.1&giftNum=9&roomid=${roomId}`,
      {
        headers: {
          cookie,
          'User-Agent': DESKTOP_USER_AGENT
        },
        proxy
      }
    )
  ).data

  const name = res.roomname

  return {
    code: SUCCESS_CODE,
    roomInfo: { name }
  }
}

export const getChangLiaoLiveUrlsPlugin = captureError(baseGetChangLiaoLiveUrlsPlugin)
export const getChangLiaoRoomInfoPlugin = captureError(baseGetChangLiaoRoomInfoPlugin)
