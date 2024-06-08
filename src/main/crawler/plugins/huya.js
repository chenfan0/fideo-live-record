import crypto from 'crypto'
import qs from 'querystring'
import debug from 'debug'

import { request } from '../request.js'
import { ERROR_CODE, SUCCESS_CODE } from '../../../error'
import { handleErrMsg } from '../handleErrMsg.js'

const log = debug('fideo-live-stream-getHuyaLiveUrl')

function getUUID() {
  const now = Date.now()
  const randNum = Math.floor(Math.random() * 1000)
  return ((now % 10000000000) * 1000 + randNum) % 4294967295
}

function processAntiCode(antiCode, uid, streamName) {
  const TimeLocation = 'Asia/Shanghai'
  const now = new Date().toLocaleString('en-US', { timeZone: TimeLocation })
  const q = qs.parse(antiCode)
  q.t = '102'
  q.ctype = 'tars_mp'
  q.wsTime = (Math.floor(new Date().getTime() / 1000) + 21600).toString(16)
  q.ver = '1'
  q.sv = now
  const seqId = uid + new Date().getTime().toString()
  q.seqid = seqId
  q.uid = uid.toString()
  q.uuid = getUUID().toString()
  let h = crypto
    .createHash('md5')
    .update(seqId + '|' + q.ctype + '|' + q.t)
    .digest('hex')
  let fm = Buffer.from(q.fm, 'base64').toString('ascii')
  fm = fm.replace('$0', q.uid).replace('$1', streamName).replace('$2', h).replace('$3', q.wsTime)
  q.fm = fm
  h = crypto.createHash('md5').update(q.fm).digest('hex')
  q.wsSecret = h
  delete q.fm
  if (q.txyp) {
    delete q.txyp
  }
  return qs.stringify(q)
}

async function getContent(apiUrl) {
  const payload = {
    appId: 5002,
    byPass: 3,
    context: '',
    version: '2.4',
    data: {}
  }
  try {
    const response = (
      await request(apiUrl, {
        method: 'POST',
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'upgrade-insecure-requests': '1',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
        }
      })
    ).data
    return response
  } catch (error) {
    log('get content error: ', error.message)
    return null
  }
}

async function getUid() {
  const content = await getContent('https://udblgn.huya.com/web/anonymousLogin')
  return content.data.uid
}

export async function getHuyaLiveUrl(roomId, others = {}) {
  const { proxy, cookie } = others
  log('get huya live url: ', roomId)
  try {
    const uid = await getUid()
    const liveUrl = 'https://m.huya.com/' + roomId
    const body = (
      await request(liveUrl, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          cookie
        },
        proxy
      })
    ).data
    const freg = /<script> window.HNF_GLOBAL_INIT = (.*) <\/script>/i
    const res = body.match(freg)
    const liveArr = JSON.parse(res[1])

    const tLiveStreamInfo = liveArr.roomInfo.tLiveInfo.tLiveStreamInfo
    const vBitRateInfo = tLiveStreamInfo.vBitRateInfo.value
    const vStreamInfo = tLiveStreamInfo.vStreamInfo.value
    const liveUrlObj = {
      best: []
    }
    if (liveArr.roomInfo && liveArr.roomInfo.eLiveStatus === 2) {
      for (const streamInfo of vStreamInfo) {
        let {
          sFlvAntiCode,
          sFlvUrl,
          sFlvUrlSuffix,
          sStreamName,
          sHlsUrl,
          sHlsUrlSuffix,
          sHlsAntiCode
        } = streamInfo
        sFlvUrl && sStreamName && (sFlvUrl = sFlvUrl.replace('http://', 'https://'))
        // const flvBaseUrl = sFlvUrl + '/' + sStreamName + '.' + sFlvUrlSuffix + '?' + processAntiCode(sFlvAntiCode, uid, sStreamName)
        const hlsBaseUrl =
          sHlsUrl +
          '/' +
          sStreamName +
          '.' +
          sHlsUrlSuffix +
          '?' +
          processAntiCode(sHlsAntiCode, uid, sStreamName)
        for (const ratio of vBitRateInfo) {
          // const flvUrl = flvBaseUrl + `&ratio=${ratio.iBitRate}`
          const hlsUrl = hlsBaseUrl + `&ratio=${ratio.iBitRate}`
          const clarity = ratio.sDisplayName
          const liveUrls = liveUrlObj[clarity] || []
          liveUrls.push(
            // flvUrl,
            hlsUrl
          )
          liveUrlObj[clarity] = liveUrls
          if (ratio.iBitRate === 0) {
            liveUrlObj.best = liveUrls
          }
        }
      }
      return {
        code: SUCCESS_CODE,
        liveUrlObj
      }
    } else if (liveArr.roomInfo.eLiveStatus === 3) {
      return {
        code: ERROR_CODE.NOT_URLS
      }
    } else {
      return {
        code: ERROR_CODE.NOT_URLS
      }
    }
  } catch (e) {
    const errMsg = e.message
    log('get huya live url error: ', errMsg)

    return handleErrMsg(errMsg)
  }
}
