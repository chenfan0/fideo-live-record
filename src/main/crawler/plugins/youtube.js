import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-youtube')

function getRoomIdByUrl(url) {
  return new URL(url).searchParams.get('v')
}

async function baseGetYoutubeLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

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
          code: CRAWLER_ERROR_CODE.NOT_URLS
        }
      }
      return {
        code: SUCCESS_CODE,
        liveUrls: [url]
      }
    }
  }
}

export const getYoutubeLiveUrlsPlugin = captureError(baseGetYoutubeLiveUrlsPlugin)
