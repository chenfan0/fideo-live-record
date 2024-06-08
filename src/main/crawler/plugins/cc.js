import debug from 'debug'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE, ERROR_MESSAGE } from '../../../code'
import { request } from '../request'

const log = debug('fideo-live-stream-getCCLiveUrl')

async function baseGetCCLiveUrlPlugin(roomId, others = {}) {
  const { proxy, cookie } = others
  log('fallbackGetCCLiveUrl start: ', roomId, cookie, proxy)
  const json = (
    await request(`https://vapi.cc.163.com/video_play_url/${roomId}`, {
      proxy,
      headers: {
        cookie
      }
    })
  ).data
  const { cdn_list, tcvbr_list, vbrname_mapping } = json
  const vbrKeys = Object.keys(tcvbr_list)
  const streamUrls = []
  const liveUrlObj = {
    best: []
  }
  let maxVbr = -1
  const p = []
  for (const cdn of cdn_list) {
    for (const vbrKey of vbrKeys) {
      const vbr = tcvbr_list[vbrKey]
      p.push(
        request(`https://vapi.cc.163.com/video_play_url/${roomId}?cdn=${cdn}&vbr=${vbr}`, {
          proxy,
          headers: {
            cookie
          }
        }).then(({ data: json }) => {
          const url = json.videourl
          const arr = liveUrlObj[vbrname_mapping[vbrKey]] || []
          arr.push(url)
          liveUrlObj[vbrname_mapping[vbrKey]] = arr
          if (vbr > maxVbr) {
            maxVbr = vbr
            liveUrlObj.best = [url]
          } else if (vbr === maxVbr) {
            liveUrlObj.best.push(url)
          }
        })
      )
    }
  }
  await Promise.all(p)
  return {
    code: SUCCESS_CODE,
    liveUrlObj
  }
}
