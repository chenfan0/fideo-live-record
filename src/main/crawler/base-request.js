import { URL } from 'node:url'
import axios from 'axios'

import { ERROR_MESSAGE } from '../../code'

/**
 *
 * @param {string} url
 * @param {{ headers: Object, data: Object, method: string, proxy: string }} param
 * @returns
 */
export async function request(url, param = {}) {
  const proxy = param.proxy || null
  let proxyObj = null
  if (proxy) {
    try {
      const proxyUrl = new URL(proxy)
      if (!proxyUrl.protocol || !proxyUrl.hostname || !proxyUrl.port) {
        throw new Error(ERROR_MESSAGE.INVALID_PROXY)
      }
      proxyObj = {
        protocol: proxyUrl.protocol,
        host: proxyUrl.hostname,
        port: proxyUrl.port,
        auth: proxyUrl.username
          ? {
              username: proxyUrl.username,
              password: proxyUrl.password
            }
          : null
      }
    } catch {
      throw new Error(ERROR_MESSAGE.INVALID_PROXY)
    }
  }
  const response = await axios({
    url,
    method: param.method || 'GET',
    data: param.data || undefined,
    headers: {
      ...param.headers
    },
    timeout: 20000,
    proxy: proxyObj || undefined
  })
  return response
}
