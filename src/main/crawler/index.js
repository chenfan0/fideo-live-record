import { getBilibiliLiveUrlsPlugin } from './plugins/bilibili'
// import { getCCLiveUrl } from './liveUrl/cc.js'
// import { getDouYinLiveUrl } from './liveUrl/douyin.js'
// import { getDouyuLiveUrl } from './liveUrl/douyu.js'
// import { getHuyaLiveUrl } from './liveUrl/huya.js'
// import { getKuaishouUrl } from './liveUrl/kuaishou.js'
// import { getYoutubeUrl } from './liveUrl/youtube.js'
// import { getTwitchLiveUrl } from './liveUrl/twitch.js'
// import { getTiktokLiveUrl } from './liveUrl/tiktok.js'
// import { ERROR_CODE } from '../../error'
// import { NOT_SUPPORT } from './const.js'
// import { getWeiboLiveUrl } from './liveUrl/weibo.js'
// import { getHuaJiaoLiveUrl } from './liveUrl/huajiao.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../code'

const getPathnameItem = (url, index = 1) => {
  const { pathname } = new URL(url)
  return pathname.split('/')[index]
}

const getYoutubeRoomId = (url) => {
  const { searchParams } = new URL(url)
  return searchParams.get('v')
}

const supportPlatform = [
  'douyin',
  'bilibili',
  'cc',
  'douyu',
  'kuaishou',
  'huya',
  'youtube',
  'twitch',
  'tiktok',
  'weibo',
  'huajiao'
]
const platformToFnMap = {
  // douyin: {
  //   getLiveUrlFn: getDouYinLiveUrl,
  //   getRoomIdByUrl: getPathnameItem
  // },
  bilibili: {
    getLiveUrlFn: getBilibiliLiveUrlsPlugin,
    getRoomIdByUrl: getPathnameItem
  }
  // cc: {
  //   getLiveUrlFn: getCCLiveUrl,
  //   getRoomIdByUrl: getPathnameItem
  // },
  // huya: {
  //   getLiveUrlFn: getHuyaLiveUrl,
  //   getRoomIdByUrl: getPathnameItem
  // },
  // douyu: {
  //   getLiveUrlFn: getDouyuLiveUrl,
  //   getRoomIdByUrl(url) {
  //     const { searchParams } = new URL(url)
  //     return searchParams.get('rid') || getPathnameItem(url)
  //   }
  // },
  // kuaishou: {
  //   getLiveUrlFn: getKuaishouUrl,
  //   getRoomIdByUrl(url) {
  //     return getPathnameItem(url, 2)
  //   }
  // },
  // youtube: {
  //   getLiveUrlFn: getYoutubeUrl,
  //   getRoomIdByUrl: getYoutubeRoomId
  // },
  // twitch: {
  //   getLiveUrlFn: getTwitchLiveUrl,
  //   getRoomIdByUrl: getPathnameItem
  // },
  // tiktok: {
  //   getLiveUrlFn: getTiktokLiveUrl,
  //   getRoomIdByUrl: getPathnameItem
  // },
  // weibo: {
  //   getLiveUrlFn: getWeiboLiveUrl,
  //   getRoomIdByUrl(url) {
  //     return getPathnameItem(url, 5)
  //   }
  // },
  // huajiao: {
  //   getLiveUrlFn: getHuaJiaoLiveUrl,
  //   getRoomIdByUrl(url) {
  //     return getPathnameItem(url, 2)
  //   }
  // }
}
/**
 *
 * @param {{ url: string, proxy?: string, cookie?: string }} info
 * @returns {Promise<{code: 0 | 1 | 200}>}
 */
export async function getLiveUrls(info) {
  const { roomUrl, proxy, cookie } = info
  console.log('getLiveUrls', info)
  let host
  try {
    host = new URL(roomUrl).host
  } catch (e) {
    console.error(e)
    return {
      code: CRAWLER_ERROR_CODE.INVALID_URL
    }
  }

  const platform = supportPlatform.find((p) => host.includes(p))

  if (!platform) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_SUPPORT
    }
  }

  const { getLiveUrlFn, getRoomIdByUrl } = platformToFnMap[platform]
  const roomId = getRoomIdByUrl(roomUrl)

  return await getLiveUrlFn(roomId, { proxy, cookie })
}
