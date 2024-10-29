import debug from 'debug'

import { getBilibiliLiveUrlsPlugin, getBilibiliRoomInfoPlugin } from './plugins/bilibili'
import { getCCLiveUrlsPlugin, getCCRoomInfoPlugin } from './plugins/cc'
import { getDouYinLiveUrlsPlugin, getDouYinRoomInfoPlugin } from './plugins/douyin'
import { getDouyuLiveUrlsPlugin, getDouyuRoomInfoPlugin } from './plugins/douyu'
import { getHuyaLiveUrlsPlugin, getHuyaRoomInfoPlugin } from './plugins/huya'
import { getKuaishouLiveUrlsPlugin, getKuaishouRoomInfoPlugin } from './plugins/kuaishou'
import { getYoutubeLiveUrlsPlugin, getYoutubeRoomInfoPlugin } from './plugins/youtube'
import { getTwitchLiveUrlsPlugin, getTwitchRoomInfoPlugin } from './plugins/twitch'
import { getTiktokLiveUrlsPlugin, getTiktokRoomInfoPlugin } from './plugins/tiktok'
import { getWeiboLiveUrlsPlugin, getWeiboRoomInfoPlugin } from './plugins/weibo'
import { getHuaJiaoLiveUrlsPlugin, getHuaJiaoRoomInfoPlugin } from './plugins/huajiao'
import { getTaobaoLiveUrlsPlugin, getTaobaoRoomInfoPlugin } from './plugins/taobao'
import { getBigoLiveUrlsPlugin, getBigoRoomInfoPlugin } from './plugins/bigo'
import { getYYLiveUrlsPlugin, getYYRoomInfoPlugin } from './plugins/yy'
import { getJDLiveUrlsPlugin, getJDRoomInfoPlugin } from './plugins/jd'
import { getMomoLiveUrlsPlugin, getMomoRoomInfoPlugin } from './plugins/momo'
import { getShiGuangLiveUrlsPlugin, getShiGuangRoomInfoPlugin } from './plugins/shiguang'
import { getVvLiveUrlsPlugin, getVvRoomInfoPlugin } from './plugins/vv'
import { getChangLiaoLiveUrlsPlugin, getChangLiaoRoomInfoPlugin } from './plugins/changliao'
import { get17LiveUrlsPlugin, get17LiveRoomInfoPlugin } from './plugins/17live'
import { getXhsUrlsPlugin, getXhsRoomInfoPlugin } from './plugins/xhs'
import { getKilakilaLiveUrlsPlugin, getKilakilaRoomInfoPlugin } from './plugins/kilakila'
import { getAcFunLiveUrlsPlugin, getAcFunRoomInfoPlugin } from './plugins/acfun'

import { CRAWLER_ERROR_CODE } from '../../code'

const log = debug('fideo-crawler')

const hostnameToPlatformCrawlerFnMap = {
  'www.youtube.com': {
    getLiveUrlsFn: getYoutubeLiveUrlsPlugin,
    getRoomInfoFn: getYoutubeRoomInfoPlugin
  },
  'youtube.com': {
    getLiveUrlsFn: getYoutubeLiveUrlsPlugin,
    getRoomInfoFn: getYoutubeRoomInfoPlugin
  },

  'www.twitch.tv': {
    getLiveUrlsFn: getTwitchLiveUrlsPlugin,
    getRoomInfoFn: getTwitchRoomInfoPlugin
  },
  'twitch.tv': {
    getLiveUrlsFn: getTwitchLiveUrlsPlugin,
    getRoomInfoFn: getTwitchRoomInfoPlugin
  },

  'www.tiktok.com': {
    getLiveUrlsFn: getTiktokLiveUrlsPlugin,
    getRoomInfoFn: getTiktokRoomInfoPlugin
  },
  'tiktok.com': {
    getLiveUrlsFn: getTiktokLiveUrlsPlugin,
    getRoomInfoFn: getTiktokRoomInfoPlugin
  },

  'live.douyin.com': {
    getLiveUrlsFn: getDouYinLiveUrlsPlugin,
    getRoomInfoFn: getDouYinRoomInfoPlugin
  },
  'v.douyin.com': {
    getLiveUrlsFn: getDouYinLiveUrlsPlugin,
    getRoomInfoFn: getDouYinRoomInfoPlugin
  },

  'live.kuaishou.com': {
    getLiveUrlsFn: getKuaishouLiveUrlsPlugin,
    getRoomInfoFn: getKuaishouRoomInfoPlugin
  },

  'live.bilibili.com': {
    getLiveUrlsFn: getBilibiliLiveUrlsPlugin,
    getRoomInfoFn: getBilibiliRoomInfoPlugin
  },

  'cc.163.com': {
    getLiveUrlsFn: getCCLiveUrlsPlugin,
    getRoomInfoFn: getCCRoomInfoPlugin
  },

  'www.huajiao.com': {
    getLiveUrlsFn: getHuaJiaoLiveUrlsPlugin,
    getRoomInfoFn: getHuaJiaoRoomInfoPlugin
  },

  'huajiao.com': {
    getLiveUrlsFn: getHuaJiaoLiveUrlsPlugin,
    getRoomInfoFn: getHuaJiaoRoomInfoPlugin
  },

  'weibo.com': {
    getLiveUrlsFn: getWeiboLiveUrlsPlugin,
    getRoomInfoFn: getWeiboRoomInfoPlugin
  },
  'www.weibo.com': {
    getLiveUrlsFn: getWeiboLiveUrlsPlugin,
    getRoomInfoFn: getWeiboRoomInfoPlugin
  },

  'www.douyu.com': {
    getLiveUrlsFn: getDouyuLiveUrlsPlugin,
    getRoomInfoFn: getDouyuRoomInfoPlugin
  },
  'douyu.com': {
    getLiveUrlsFn: getDouyuLiveUrlsPlugin,
    getRoomInfoFn: getDouyuRoomInfoPlugin
  },

  'tbzb.taobao.com': {
    getLiveUrlsFn: getTaobaoLiveUrlsPlugin,
    getRoomInfoFn: getTaobaoRoomInfoPlugin
  },

  'www.bigo.tv': {
    getLiveUrlsFn: getBigoLiveUrlsPlugin,
    getRoomInfoFn: getBigoRoomInfoPlugin
  },
  'bigo.tv': {
    getLiveUrlsFn: getBigoLiveUrlsPlugin,
    getRoomInfoFn: getBigoRoomInfoPlugin
  },

  'www.yy.com': {
    getLiveUrlsFn: getYYLiveUrlsPlugin,
    getRoomInfoFn: getYYRoomInfoPlugin
  },
  'yy.com': {
    getLiveUrlsFn: getYYLiveUrlsPlugin,
    getRoomInfoFn: getYYRoomInfoPlugin
  },

  'www.huya.com': {
    getLiveUrlsFn: getHuyaLiveUrlsPlugin,
    getRoomInfoFn: getHuyaRoomInfoPlugin
  },
  'huya.com': {
    getLiveUrlsFn: getHuyaLiveUrlsPlugin,
    getRoomInfoFn: getHuyaRoomInfoPlugin
  },

  'lives.jd.com': {
    getLiveUrlsFn: getJDLiveUrlsPlugin,
    getRoomInfoFn: getJDRoomInfoPlugin
  },

  'web.immomo.com': {
    getLiveUrlsFn: getMomoLiveUrlsPlugin,
    getRoomInfoFn: getMomoRoomInfoPlugin
  },

  'www.rengzu.com': {
    getLiveUrlsFn: getShiGuangLiveUrlsPlugin,
    getRoomInfoFn: getShiGuangRoomInfoPlugin
  },

  'h5webcdn-pro.vvxqiu.com': {
    getLiveUrlsFn: getVvLiveUrlsPlugin,
    getRoomInfoFn: getVvRoomInfoPlugin
  },

  'www.tlclw.com': {
    getLiveUrlsFn: getChangLiaoLiveUrlsPlugin,
    getRoomInfoFn: getChangLiaoRoomInfoPlugin
  },
  'tlclw.com': {
    getLiveUrlsFn: getChangLiaoLiveUrlsPlugin,
    getRoomInfoFn: getChangLiaoRoomInfoPlugin
  },

  'www.17.live': {
    getLiveUrlsFn: get17LiveUrlsPlugin,
    getRoomInfoFn: get17LiveRoomInfoPlugin
  },
  '17.live': {
    getLiveUrlsFn: get17LiveUrlsPlugin,
    getRoomInfoFn: get17LiveRoomInfoPlugin
  },

  'www.xiaohongshu.com': {
    getLiveUrlsFn: getXhsUrlsPlugin,
    getRoomInfoFn: getXhsRoomInfoPlugin
  },
  'xiaohongshu.com': {
    getLiveUrlsFn: getXhsUrlsPlugin,
    getRoomInfoFn: getXhsRoomInfoPlugin
  },

  'live.kilakila.cn': {
    getLiveUrlsFn: getKilakilaLiveUrlsPlugin,
    getRoomInfoFn: getKilakilaRoomInfoPlugin
  },

  'live.acfun.cn': {
    getLiveUrlsFn: getAcFunLiveUrlsPlugin,
    getRoomInfoFn: getAcFunRoomInfoPlugin
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  'huajiao',
  'taobao',
  'bigo',
  'yy',
  'huya',
  'lives.jd.com'
]
/**
 *
 * @param {{ url: string, proxy?: string, cookie?: string }} info
 * @returns {Promise<{code: number, liveUrls?: string[]}>}
 */
export async function getLiveUrls(info, writeLog) {
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

  const getLiveUrlsFn = hostnameToPlatformCrawlerFnMap[host]?.getLiveUrlsFn

  // TODO: 判断是否是支持的平台但是url不对，提供更好的错误提示
  if (!getLiveUrlsFn) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_SUPPORT
    }
  }

  const res = await getLiveUrlsFn(roomUrl, { proxy, cookie }, writeLog)
  log('res:', res)
  return res
}

export async function getRoomInfo(info, writeLog) {
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

  const getRoomInfoFn = hostnameToPlatformCrawlerFnMap[host]?.getRoomInfoFn

  // TODO: 判断是否是支持的平台但是url不对，提供更好的错误提示
  if (!getRoomInfoFn) {
    return {
      code: CRAWLER_ERROR_CODE.NOT_SUPPORT
    }
  }

  const res = await getRoomInfoFn(roomUrl, { proxy, cookie }, writeLog)
  log('res:', res)
  return res
}
