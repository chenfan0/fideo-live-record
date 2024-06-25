import debug from 'debug'

import { getBilibiliLiveUrlsPlugin } from './plugins/bilibili'
import { getCCLiveUrlsPlugin } from './plugins/cc'
import { getDouYinLiveUrlsPlugin } from './plugins/douyin'
import { getDouyuLiveUrlsPlugin } from './plugins/douyu'
// import { getHuyaLiveUrlPlugin } from './plugins/huya'
import { getKuaishouLiveUrlsPlugin } from './plugins/kuaishou'
import { getYoutubeLiveUrlsPlugin } from './plugins/youtube'
import { getTwitchLiveUrlsPlugin } from './plugins/twitch'
import { getTiktokLiveUrlsPlugin } from './plugins/tiktok'
import { getWeiboLiveUrlsPlugin } from './plugins/weibo'
import { getHuaJiaoLiveUrlsPlugin } from './plugins/huajiao'

import { CRAWLER_ERROR_CODE } from '../../code'

const log = debug('fideo-crawler')

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
  douyin: {
    getLiveUrlsFn: getDouYinLiveUrlsPlugin,
    getRoomIdByUrl: getPathnameItem
  },
  bilibili: {
    getLiveUrlsFn: getBilibiliLiveUrlsPlugin,
    getRoomIdByUrl: getPathnameItem
  },
  cc: {
    getLiveUrlsFn: getCCLiveUrlsPlugin,
    getRoomIdByUrl: getPathnameItem
  },
  huya: {
    // getLiveUrlFn: getHuyaLiveUrlPlugin,
    getRoomIdByUrl: getPathnameItem
  },
  douyu: {
    getLiveUrlsFn: getDouyuLiveUrlsPlugin,
    getRoomIdByUrl(url) {
      const { searchParams } = new URL(url)
      return searchParams.get('rid') || getPathnameItem(url)
    }
  },
  kuaishou: {
    getLiveUrlsFn: getKuaishouLiveUrlsPlugin,
    getRoomIdByUrl(url) {
      return getPathnameItem(url, 2)
    }
  },
  youtube: {
    getLiveUrlsFn: getYoutubeLiveUrlsPlugin,
    getRoomIdByUrl: getYoutubeRoomId
  },
  twitch: {
    getLiveUrlsFn: getTwitchLiveUrlsPlugin,
    getRoomIdByUrl: getPathnameItem
  },
  tiktok: {
    getLiveUrlsFn: getTiktokLiveUrlsPlugin,
    getRoomIdByUrl: getPathnameItem
  },
  weibo: {
    getLiveUrlsFn: getWeiboLiveUrlsPlugin,
    getRoomIdByUrl(url) {
      return getPathnameItem(url, 5)
    }
  },
  huajiao: {
    getLiveUrlsFn: getHuaJiaoLiveUrlsPlugin,
    getRoomIdByUrl(url) {
      return getPathnameItem(url, 2)
    }
  }
}
/**
 *
 * @param {{ url: string, proxy?: string, cookie?: string }} info
 * @returns {Promise<{code: number, liveUrls?: string[]}>}
 */
export async function getLiveUrls(info) {
  const { roomUrl, proxy, cookie } = info
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
  log('platform:', platform)

  if (!platform) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_SUPPORT
    }
  }

  const { getLiveUrlsFn, getRoomIdByUrl } = platformToFnMap[platform]
  const roomId = getRoomIdByUrl(roomUrl)
  log('roomId:', roomId)

  const res = await getLiveUrlsFn(roomId, { proxy, cookie })
  log('res:', res)
  return res
}
