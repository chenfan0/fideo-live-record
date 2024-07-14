import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-kuaishou')

async function baseGetKuaishouLiveUrlsPlugin(roomId, others = {}) {
  const { proxy, cookie } = others
  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)
  const htmlContent = (
    await request(`https://live.kuaishou.com/u/${roomId}`, {
      headers: {
        cookie,
        host: 'live.kuaishou.com'
      },
      proxy
    })
  ).data
  const scriptReg = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  const matches = htmlContent.match(scriptReg)
  let liveUrls = []
  let maxBitrate = -1
  for (const match of matches) {
    if (!match.includes('window.__INITIAL_STATE__')) {
      continue
    }
    const scriptContent = match.replace(scriptReg, '$1')
    const fn = new Function(`
          const window = {};
          try {
            ${scriptContent};
          } catch(e) {}
          return window.__INITIAL_STATE__`)
    const data = fn()
    const playUrls = data.liveroom.playList[0].liveStream.playUrls
    const adaptationSet = playUrls[0].adaptationSet
    const representation = adaptationSet.representation
    for (const re of representation) {
      if (re.bitrate > maxBitrate) {
        maxBitrate = re.bitrate
        liveUrls = [re.url]
      } else if (re.bitrate === maxBitrate) {
        liveUrls.push(re.url)
      }
    }
    break
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

export const getKuaishouLiveUrlsPlugin = captureError(baseGetKuaishouLiveUrlsPlugin)
