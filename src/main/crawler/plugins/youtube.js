import debug from 'debug'

import { ERROR_CODE, SUCCESS_CODE, ERROR_MESSAGE } from '../../../error'

import { request } from '../request'
import { handleErrMsg } from '../handleErrMsg'

const log = debug('fideo-live-stream-getYoutubeUrl')

export async function getYoutubeUrl(roomId, others = {}) {
  const { proxy, cookie } = others

  log('getYoutubeUrl start: ', roomId, cookie, proxy)
  try {
    const htmlContent = (
      await request(`https://www.youtube.com/watch?v=${roomId}`, {
        proxy,
        headers: {
          cookie,
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        }
      })
    ).data

    const scriptReg = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
    const matches = htmlContent.match(scriptReg)

    const liveUrlObj = {
      best: []
    }

    for (const match of matches) {
      if (match.includes('var ytInitialPlayerResponse')) {
        const scriptContent = match.replace(scriptReg, '$1')
        const fn = new Function(`
          const document = {
            createElement: () => ({}),
            getElementsByTagName: () => ({}),
            getElementsByTagName: () => ([{ appendChild: () => ({}) }]),
          }
          ${scriptContent}
          return ytInitialPlayerResponse
        `)
        const url = fn().streamingData.hlsManifestUrl

        if (!url) {
          return {
            code: ERROR_CODE.NOT_URLS
          }
        }

        liveUrlObj.best = [url]
        liveUrlObj['原画'] = [url]
        return {
          code: SUCCESS_CODE,
          liveUrlObj
        }
      }
    }
  } catch (e) {
    const errMsg = e.message

    log('get youtube live url error: ', e.message)

    return handleErrMsg(errMsg)
  }
}
