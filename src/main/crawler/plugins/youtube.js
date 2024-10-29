import debug from 'debug'

import { DESKTOP_USER_AGENT, request } from '../base-request.js'
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
        'User-Agent': DESKTOP_USER_AGENT
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

async function baseGetYoutubeRoomInfoPlugin(roomUrl, others = {}) {
  const { cookie, proxy } = others

  const html = (
    await request(roomUrl, {
      headers: {
        cookie,
        'User-Agent': DESKTOP_USER_AGENT
      },
      proxy
    })
  ).data

  const flag = '<link itemprop="name" content="'
  const itemPropAuthorIndex = html.indexOf(flag)
  const startIndex = itemPropAuthorIndex + flag.length
  const endIndex = html.indexOf('"></span>', startIndex)
  const name = html.slice(startIndex, endIndex)

  return {
    code: SUCCESS_CODE,
    roomInfo: { name }
  }
}

export const getYoutubeLiveUrlsPlugin = captureError(baseGetYoutubeLiveUrlsPlugin)
export const getYoutubeRoomInfoPlugin = captureError(baseGetYoutubeRoomInfoPlugin)
