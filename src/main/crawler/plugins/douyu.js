import CryptoJS from 'crypto-js'
import debug from 'debug'

import { request } from '../request.js'
import { ERROR_CODE, SUCCESS_CODE, ERROR_MESSAGE } from '../../../error'
import { handleErrMsg } from '../handleErrMsg.js'

const log = debug('fideo-live-stream-getDouyuLiveUrl')

export async function getDouyuLiveUrl(roomId, others = {}) {
  const { proxy, cookie } = others
  log('getDouyuLiveUrl start: ', roomId, cookie, proxy)
  try {
    const htmlContent = (
      await request(`https://www.douyu.com/${roomId}`, {
        proxy,
        headers: {
          cookie
        }
      })
    ).data

    const scriptRegex = /<script\s+type=['"]text\/javascript['"]>([\s\S]*?)<\/script>/gi
    const scriptMatches = htmlContent.match(scriptRegex)
    for (let i = 0; i < scriptMatches.length; i++) {
      const scriptContent = scriptMatches[i].replace(scriptRegex, '$1')
      if (!scriptContent.includes(`ub98484234`)) continue

      const m = '10000000000000000000000000001501'
      const y = parseInt(new Date().getTime() / 1e3, 10)
      const fn = new Function(
        'CryptoJS',
        `"use strict"; ${scriptContent}; return ub98484234(${roomId}, ${JSON.stringify(m)}, ${y})`
      )
      const S = fn(CryptoJS)
      const v = S + '&rate=0'

      const liveUrlObj = {
        best: []
      }
      let minRate = Number.MAX_SAFE_INTEGER

      const data = (
        await request(`https://www.douyu.com/lapi/live/getH5Play/${roomId}?${v}`, {
          method: 'POST',
          proxy,
          headers: {
            cookie
          }
        })
      ).data

      const multirates = data.data.multirates.sort((x, y) => x.rate - y.rate)

      for (const multirate of multirates) {
        let _data
        if (multirate.rate === 0) {
          _data = data
        } else {
          const v = S + `&rate=${multirate.rate}`
          const _liveRes = await fetch(`https://www.douyu.com/lapi/live/getH5Play/${roomId}?${v}`, {
            method: 'POST'
          })
          _data = await _liveRes.json()
        }
        if (_data.msg === 'ok') {
          const rtmp_url = _data.data.rtmp_url
          const rtmp_live = _data.data.rtmp_live
          const liveUrl = rtmp_url + '/' + rtmp_live
          const liveUrls = liveUrlObj[multirate.name] || []
          liveUrls.push(liveUrl)
          liveUrlObj[multirate.name] = liveUrls
          if (multirate.rate < minRate) {
            minRate = multirate.rate
            liveUrlObj.best = [liveUrl]
          } else if (multirate.rate === minRate) {
            liveUrlObj.best.push(liveUrl)
          }
        }
      }
      return {
        code: SUCCESS_CODE,
        liveUrlObj
      }
    }
    return {
      code: ERROR_CODE.NOT_URLS
    }
  } catch (e) {
    const errMsg = e.message
    log('getDouyuLiveUrl error: ', errMsg)

    return handleErrMsg(errMsg)
  }
}
