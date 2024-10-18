import debug from 'debug'

import { getBilibiliLiveUrlsPlugin } from './plugins/bilibili'
import { getCCLiveUrlsPlugin } from './plugins/cc'
import { getDouYinLiveUrlsPlugin } from './plugins/douyin'
import { getDouyuLiveUrlsPlugin } from './plugins/douyu'
import { getHuyaLiveUrlsPlugin } from './plugins/huya'
import { getKuaishouLiveUrlsPlugin } from './plugins/kuaishou'
import { getYoutubeLiveUrlsPlugin } from './plugins/youtube'
import { getTwitchLiveUrlsPlugin } from './plugins/twitch'
import { getTiktokLiveUrlsPlugin } from './plugins/tiktok'
import { getWeiboLiveUrlsPlugin } from './plugins/weibo'
import { getHuaJiaoLiveUrlsPlugin } from './plugins/huajiao'
import { getTaobaoLiveUrlsPlugin } from './plugins/taobao'
import { getBigoLiveUrlsPlugin } from './plugins/bigo'
import { getYYLiveUrlsPlugin } from './plugins/yy'
import { getJDLiveUrlsPlugin } from './plugins/jd'
import { getMomoLiveUrlsPlugin } from './plugins/momo'
import { getShiGuangLiveUrlsPlugin } from './plugins/shiguang'
import { getVvLiveUrlsPlugin } from './plugins/vv'
import { getChangLiaoLiveUrlsPlugin } from './plugins/changliao'
import { get17LiveUrlsPlugin } from './plugins/17live'

import { CRAWLER_ERROR_CODE } from '../../code'

const log = debug('fideo-crawler')

const hostnameToPlatformCrawlerFnMap = {
  'www.youtube.com': getYoutubeLiveUrlsPlugin,
  'youtube.com': getYoutubeLiveUrlsPlugin,

  'www.twitch.tv': getTwitchLiveUrlsPlugin,
  'twitch.tv': getTwitchLiveUrlsPlugin,

  'www.tiktok.com': getTiktokLiveUrlsPlugin,
  'tiktok.com': getTiktokLiveUrlsPlugin,

  'live.douyin.com': getDouYinLiveUrlsPlugin,
  'v.douyin.com': getDouYinLiveUrlsPlugin,

  'live.kuaishou.com': getKuaishouLiveUrlsPlugin,
  'live.bilibili.com': getBilibiliLiveUrlsPlugin,

  'cc.163.com': getCCLiveUrlsPlugin,

  'www.huajiao.com': getHuaJiaoLiveUrlsPlugin,
  'huajiao.com': getHuaJiaoLiveUrlsPlugin,

  'weibo.com': getWeiboLiveUrlsPlugin,
  'www.weibo.com': getWeiboLiveUrlsPlugin,

  'www.douyu.com': getDouyuLiveUrlsPlugin,
  'douyu.com': getDouyuLiveUrlsPlugin,

  'tbzb.taobao.com': getTaobaoLiveUrlsPlugin,

  'www.bigo.tv': getBigoLiveUrlsPlugin,
  'bigo.tv': getBigoLiveUrlsPlugin,

  'www.yy.com': getYYLiveUrlsPlugin,
  'yy.com': getYYLiveUrlsPlugin,

  'www.huya.com': getHuyaLiveUrlsPlugin,
  'huya.com': getHuyaLiveUrlsPlugin,

  'lives.jd.com': getJDLiveUrlsPlugin,

  'web.immomo.com': getMomoLiveUrlsPlugin,

  'www.rengzu.com': getShiGuangLiveUrlsPlugin,

  'h5webcdn-pro.vvxqiu.com': getVvLiveUrlsPlugin,

  'www.tlclw.com': getChangLiaoLiveUrlsPlugin,
  'tlclw.com': getChangLiaoLiveUrlsPlugin,

  'www.17.live': get17LiveUrlsPlugin,
  '17.live': get17LiveUrlsPlugin
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

  const getLiveUrlsFn = hostnameToPlatformCrawlerFnMap[host]

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
