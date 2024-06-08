import debug from 'debug'

import { ERROR_CODE, SUCCESS_CODE, ERROR_MESSAGE } from '../../../error'

import { request } from '../request.js'
import { handleErrMsg } from '../handleErrMsg.js'

const log = debug('fideo-live-stream-getKuaishouUrl')

export async function getKuaishouUrl(roomId, others = {}) {
  const { proxy, cookie } = others
  log('getKuaishouUrl start: ', roomId, cookie, proxy)
  try {
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

    const liveUrlObj = {
      best: []
    }
    let maxBitrate = -1
    for (const match of matches) {
      if (match.includes('window.__INITIAL_STATE__')) {
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
          liveUrlObj[re.name] = [re.url]
          if (re.bitrate > maxBitrate) {
            maxBitrate = re.bitrate
            liveUrlObj.best = [re.url]
          } else if (re.bitrate === maxBitrate) {
            liveUrlObj.best.push(re.url)
          }
        }
        break
      }
    }

    return {
      code: SUCCESS_CODE,
      liveUrlObj
    }
  } catch (e) {
    const errMsg = e.message

    log('get kuaishou live url error: ', e.message)

    return handleErrMsg(errMsg)
  }
}
