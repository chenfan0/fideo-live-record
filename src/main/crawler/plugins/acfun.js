import debug from 'debug'

import { request, DESKTOP_USER_AGENT } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-acFun')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[2]
}

async function baseGetAcFunLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const setCookie = await request(roomUrl, {
    headers: {
      'User-Agent': DESKTOP_USER_AGENT
    }
  }).then((res) => res.headers.get('Set-Cookie'))

  const { userId, 'acfun.api.visitor_st': visitorSt } = (
    await request(`https://id.app.acfun.cn/rest/app/visitor/login`, {
      method: 'POST',
      headers: {
        Cookie: cookie ? `${setCookie};${cookie}` : `${setCookie}`,
        'User-Agent': DESKTOP_USER_AGENT,
        Referer: 'https://live.acfun.cn',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: 'sid=acfun.api.visitor'
    })
  ).data

  const res = (
    await request(
      `https://api.kuaishouzt.com/rest/zt/live/web/startPlay?subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=${userId}&acfun.api.visitor_st=${visitorSt}`,
      {
        method: 'POST',
        headers: {
          Cookie: cookie ? `${setCookie};${cookie}` : `${setCookie}`,
          'User-Agent': DESKTOP_USER_AGENT,
          Referer: 'https://live.acfun.cn',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: `authorId=${roomId}&pullStreamType=FLV`
      }
    )
  ).data

  if (res.result !== 1) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }
  const videoPlayRes = JSON.parse(res.data.videoPlayRes)

  const representations = videoPlayRes.liveAdaptiveManifest[0].adaptationSet.representation

  let maxBitrate = 0
  let maxBitrateUrl = ''
  for (const representation of representations) {
    const { url, bitrate } = representation

    if (bitrate > maxBitrate) {
      maxBitrate = bitrate
      maxBitrateUrl = url
    }
  }

  if (!maxBitrateUrl) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  return {
    code: SUCCESS_CODE,
    liveUrls: [maxBitrateUrl]
  }
}

export const getAcFunLiveUrlsPlugin = captureError(baseGetAcFunLiveUrlsPlugin)
