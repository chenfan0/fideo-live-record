import debug from "debug"

import { request } from "../request"
import { handleErrMsg } from "../handleErrMsg"
import { SUCCESS_CODE } from "../../../error"
import { NOT_URLS } from "../const"

const log = debug('fideo-live-stream-getHuaJiaoLiveUrl')

export async function getHuaJiaoLiveUrl(roomId, others = {}) {
  const { proxy, cookie } = others
  log('getHuaJiaoLiveUrl start: ', roomId, cookie, proxy)

  try {
    const htmlContent = (await request(`https://www.huajiao.com/l/${roomId}`, {
      headers: {
        cookie
      },
      proxy
    })).data

    const scriptContentRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
    const matches = htmlContent.match(scriptContentRegex)

    let str = ''

    for (const match of matches) {
      if (
        match.includes('author') &&
        match.includes('feed')
      ) {
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

    const liveUrlData = (await request(`https://live.huajiao.com/live/substream?&sn=${sn}&uid=${uid}&liveid=${roomId}&encode=h264`, {
      headers: {
        cookie
      },
      proxy
    })).data

    const liveUrlObj = {
      best: [liveUrlData.data.main, liveUrlData.data.h264_url],
      origin: [liveUrlData.url, liveUrlData.data.h264_url]
    }

    return {
      liveUrlObj,
      code: SUCCESS_CODE
    }

  } catch (e) {
    const errMsg = e.message

    log('getHuaJiaoLiveUrl error: ', errMsg)

    return handleErrMsg(errMsg)
  }
}
