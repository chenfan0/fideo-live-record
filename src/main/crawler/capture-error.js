import { CRAWLER_ERROR_CODE, ERROR_MESSAGE } from '../../code'
import debug from 'debug'

const log = debug('fideo-crawler-capture-error')

/**
 *
 * @param {*} fn
 * @returns {(roomId: string, others: Object) => Promise<{ code: number, streamUrls: [] } | { code: number }>}
 */
export function captureError(fn) {
  return async function (...args) {
    try {
      return await fn.apply(this, args)
    } catch (e) {
      const message = e.message

      log('error:', message)

      if (message.includes('timeout')) {
        return {
          code: CRAWLER_ERROR_CODE.TIMEOUT
        }
      }

      if (message === ERROR_MESSAGE.INVALID_PROXY) {
        return {
          code: CRAWLER_ERROR_CODE.INVALID_PROXY
        }
      }

      // tiktok Request failed with status code 502
      if (message.includes('403') || message === 'Request failed with status code 502') {
        return {
          code: CRAWLER_ERROR_CODE.FORBIDDEN
        }
      }

      return {
        code: CRAWLER_ERROR_CODE.NOT_URLS
      }
    }
  }
}
