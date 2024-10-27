import CryptoJS from 'crypto-js'
import debug from 'debug'

import { DESKTOP_USER_AGENT, request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { SUCCESS_CODE, CRAWLER_ERROR_CODE } from '../../../code'

const log = debug('fideo-crawler-douyu')

function getRoomIdByUrl(url) {
  const { searchParams, pathname } = new URL(url)
  return searchParams.get('rid') || pathname.split('/')[1]
}

async function baseGetDouyuLiveUrlsPlugin(roomUrl, others = {}) {
  let roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

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
    const match = htmlContent.match(/var\s+apm_room_id\s*=\s*(\d+);/)

    if (match) {
      roomId = match[1]
    }

    const m = '10000000000000000000000000001501'
    const y = parseInt(new Date().getTime() / 1e3, 10)
    const fn = new Function(
      'CryptoJS',
      `"use strict"; ${scriptContent}; return ub98484234(${roomId}, ${JSON.stringify(m)}, ${y})`
    )
    const S = fn(CryptoJS)
    const v = S + '&rate=0'

    const data = (
      await request(`https://www.douyu.com/lapi/live/getH5Play/${roomId}?${v}`, {
        method: 'POST',
        proxy,
        headers: {
          cookie,
          'User-Agent': DESKTOP_USER_AGENT
        }
      })
    ).data

    const multirates = data.data.multirates.sort((x, y) => x.rate - y.rate)
    const rate = multirates[0].rate
    const liveUrls = []
    let _data

    if (rate === 0) {
      _data = data
    } else {
      const v = S + `&rate=${rate}`
      const _liveRes = await fetch(`https://www.douyu.com/lapi/live/getH5Play/${roomId}?${v}`, {
        method: 'POST'
      })
      _data = await _liveRes.json()
    }
    if (_data.msg === 'ok') {
      const rtmp_url = _data.data.rtmp_url
      const rtmp_live = _data.data.rtmp_live
      const liveUrl = rtmp_url + '/' + rtmp_live
      liveUrls.push(liveUrl)
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
  return {
    code: CRAWLER_ERROR_CODE.NOT_URLS
  }
}

async function baseGetDouyuRoomInfoPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  const data = (
    await request(`https://www.douyu.com/betard/${roomId}`, {
      proxy,
      headers: {
        cookie,
        'User-Agent': DESKTOP_USER_AGENT
      }
    })
  ).data

  const name = data.room.nickname

  return {
    code: SUCCESS_CODE,
    roomInfo: { name }
  }
}

export const getDouyuLiveUrlsPlugin = captureError(baseGetDouyuLiveUrlsPlugin)
export const getDouyuRoomInfoPlugin = captureError(baseGetDouyuRoomInfoPlugin)
