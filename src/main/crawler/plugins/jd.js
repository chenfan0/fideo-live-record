import debug from 'debug'

import { request, MOBILE_USER_AGENT } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-jd')

function getRoomIdByUrl(url) {
  const startIndex = url.indexOf('#/')
  const endIndex = url.indexOf('?', startIndex)
  return url.slice(startIndex + 2, endIndex)
}

async function baseGetJDLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const body = {
    liveId: roomId,
    pageId: 'Mlive_LiveRoom'
  }
  const json = (
    await request(
      `https://api.m.jd.com/api?appid=h5-live&functionId=getImmediatePlayToM&body=${encodeURIComponent(JSON.stringify(body))}`,
      {
        method: 'post',
        proxy,
        headers: {
          cookie,
          Referer: `https://lives.jd.com/`,
          'User-Agent': MOBILE_USER_AGENT
        }
      }
    )
  ).data
  const { videoUrl, h5VideoUrl } = json.data
  const liveUrls = []

  videoUrl && liveUrls.push(videoUrl)
  h5VideoUrl && liveUrls.push(h5VideoUrl)

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

async function baseGetJDRoomInfoPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  const body = {
    liveId: roomId,
    pageId: 'Mlive_LiveRoom'
  }

  const json = (
    await request(
      `https://api.m.jd.com/api?appid=h5-live&functionId=liveDetailToM&body=${encodeURIComponent(JSON.stringify(body))}`,
      {
        proxy,
        headers: {
          cookie,
          'User-Agent': MOBILE_USER_AGENT,
          Referer: `https://lives.jd.com/`
        }
      }
    )
  ).data

  const { name } = json.data.author

  return {
    code: SUCCESS_CODE,
    roomInfo: { name }
  }
}

export const getJDLiveUrlsPlugin = captureError(baseGetJDLiveUrlsPlugin)
export const getJDRoomInfoPlugin = captureError(baseGetJDRoomInfoPlugin)
