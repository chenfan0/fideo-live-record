import crypto from 'crypto'

import debug from 'debug'
import base64 from 'base-64'
import utf8 from 'utf8'

import { DESKTOP_USER_AGENT, MOBILE_USER_AGENT, request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { SUCCESS_CODE, CRAWLER_ERROR_CODE } from '../../../code'

const log = debug('fideo-crawler-huya')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[1]
}

async function baseGetHuyaLiveUrlsPlugin(roomUrl, others = {}) {
  let roomId = getRoomIdByUrl(roomUrl)
  const { cookie, proxy } = others
  log('roomId: ', roomId, 'cookie: ', cookie, 'proxy: ', proxy)

  if (!/^\d+$/.test(roomId)) {
    const htmlBody = (
      await request(`https://www.huya.com/${roomId}`, {
        headers: {
          'User-Agent': DESKTOP_USER_AGENT,
          cookie
        },
        proxy
      })
    ).data
    const scriptReg = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
    const matches = htmlBody.match(scriptReg)

    for (const match of matches) {
      if (!match.includes('var hyPlayerConfig')) {
        continue
      }
      const scriptContent = match.replace(scriptReg, '$1')
      const fn = new Function(`
        const window = {}
        ${scriptContent}
        return hyPlayerConfig
      `)
      const gameLiveInfo = fn().stream.data[0].gameLiveInfo

      console.dir(fn(), { depth: null })
      const realRoomId = gameLiveInfo.profileRoom
      if (realRoomId) {
        roomId = realRoomId
        break
      }
    }
  }

  const data = (
    await request(
      `https://mp.huya.com/cache.php?m=Live&do=profileRoom&roomid=${roomId}&showSecret=1`,
      {
        headers: {
          cookie,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': MOBILE_USER_AGENT
        },
        proxy
      }
    )
  ).data

  const liveStatus = data.data.liveStatus

  if (liveStatus !== 'ON') {
    return {
      code: CRAWLER_ERROR_CODE.NOT_URLS
    }
  }

  const liveUrls = []

  const baseSteamInfoList = data.data.stream.baseSteamInfoList

  for (const streamInfo of baseSteamInfoList) {
    const urlQuery = new URLSearchParams(streamInfo.sFlvAntiCode)
    const uid = Math.floor(Math.random() * (1499999999999 - 1400000000000) + 1400000000000)
    const wsTime = Math.floor((Date.now() + 21600) / 1000).toString(16)
    const seqId = Date.now() * 1000 + uid
    const wsSecretPrefix = utf8
      .decode(base64.decode(decodeURIComponent(urlQuery.get('fm'))))
      .split('_')[0]
    const wsSecretHash = crypto
      .createHash('md5')
      .update(`${seqId}|${urlQuery.get('ctype')}|${urlQuery.get('t')}`)
      .digest('hex')
    const wsSecret = crypto
      .createHash('md5')
      .update(`${wsSecretPrefix}_${uid}_${streamInfo.sStreamName}_${wsSecretHash}_${wsTime}`)
      .digest('hex')

    const url = `${streamInfo.sFlvUrl}/${streamInfo.sStreamName}.${streamInfo.sFlvUrlSuffix}?wsSecret=${wsSecret}&wsTime=${wsTime}&seqid=${seqId}&ctype=${urlQuery.get('ctype')}&ver=1&fs=${urlQuery.get('fs')}&t=${urlQuery.get('t')}&uid=${uid}&ratio=0`
    liveUrls.push(url)
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

async function baseGetHuyaRoomInfoPlugin(roomUrl, others = {}) {

  const { proxy, cookie } = others

  const htmlContent = (
    await request(roomUrl, {
      headers: {
        cookie,
        'User-Agent': DESKTOP_USER_AGENT
      },
      proxy
    })
  ).data

  const startFlag = '">'
  const hostNameIndex = htmlContent.indexOf('host-name')

  const startIndex = htmlContent.indexOf(startFlag, hostNameIndex) + startFlag.length
  const endIndex = htmlContent.indexOf('</h3>', startIndex)

  const name = htmlContent.slice(startIndex, endIndex)

  return {
    code: SUCCESS_CODE,
    roomInfo: { name }
  }
}

export const getHuyaLiveUrlsPlugin = captureError(baseGetHuyaLiveUrlsPlugin)
export const getHuyaRoomInfoPlugin = captureError(baseGetHuyaRoomInfoPlugin)
