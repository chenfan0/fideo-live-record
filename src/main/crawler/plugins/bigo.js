import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-bigo')

function getRoomIdByUrl(url) {
  const { pathname } = new URL(url)
  const firstPathnameItem = pathname.split('/')[1]
  const secondPathnameItem = pathname.split('/')[2]
  return Number.isNaN(Number(firstPathnameItem)) ? secondPathnameItem : firstPathnameItem
}

async function baseGetBigoLiveUrlsPlugin(roomUrl, others = {}) {
  const roomId = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const formData = new FormData()
  formData.append('siteId', roomId)
  const json = await (
    await request(`https://ta.bigo.tv/official_website/studio/getInternalStudioInfo`, {
      method: 'POST',
      proxy,
      headers: {
        cookie
      },
      data: formData
    })
  ).data

  log('json:', json)
  const hlsSrc = json.data.hls_src

  if (!hlsSrc) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }
  return {
    code: SUCCESS_CODE,
    liveUrls: [hlsSrc]
  }
}

export const getBigoLiveUrlsPlugin = captureError(baseGetBigoLiveUrlsPlugin)
