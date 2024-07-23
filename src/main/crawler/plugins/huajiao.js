import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-huajiao')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[2]
}

async function baseGetHuaJiaoLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const htmlContent = (
    await request(`https://www.huajiao.com/l/${roomId}`, {
      headers: {
        cookie
      },
      proxy
    })
  ).data

  const scriptContentRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  const matches = htmlContent.match(scriptContentRegex)

  let str = ''

  for (const match of matches) {
    if (match.includes('author') && match.includes('feed')) {
      str = match.replace(scriptContentRegex, '$1')
      break
    }
  }

  const fn = new Function(`
    const window = {
      HJ_JS_CONF: {},
      _DATA: {},
    };
    ${str};
    return window
  `)
  const data = fn()
  const uid = data._DATA.author.uid
  const sn = data._DATA.feed.feed.sn

  const liveUrlData = (
    await request(
      `https://live.huajiao.com/live/substream?&sn=${sn}&uid=${uid}&liveid=${roomId}&encode=h264`,
      {
        headers: {
          cookie
        },
        proxy
      }
    )
  ).data

  const liveUrls = [liveUrlData.data.main, liveUrlData.data.h264_url]

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

export const getHuaJiaoLiveUrlsPlugin = captureError(baseGetHuaJiaoLiveUrlsPlugin)
