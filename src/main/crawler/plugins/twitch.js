import debug from 'debug'

import { request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { CRAWLER_ERROR_CODE, SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-twitch')

async function baseGetTwitchLiveUrlsPlugin(roomId, others = {}) {
  const { proxy, cookie } = others

  log('roomId:', roomId, 'cookie:', cookie, 'proxy:', proxy)

  const html = (
    await request(`https://www.twitch.tv/${roomId}`, {
      headers: {
        cookie
      },
      proxy
    })
  ).data

  const clientIDIndex = html.indexOf('clientId')
  const firstQuotationIndex = html.indexOf('"', clientIDIndex)
  const secondQuotationIndex = html.indexOf('"', firstQuotationIndex + 1)
  const clientID = html.slice(firstQuotationIndex + 1, secondQuotationIndex)
  const query = {
    operationName: 'PlaybackAccessToken_Template',
    query:
      'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature   authorization { isForbidden forbiddenReasonCode }   __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature   __typename  }}',
    variables: {
      isLive: true,
      login: roomId,
      isVod: false,
      vodID: '',
      playerType: 'site'
    }
  }

  try {
    const { data: res } = await request('https://gql.twitch.tv/gql', {
      method: 'post',
      headers: {
        'Client-Id': clientID,
        cookie
      },
      proxy,
      data: {
        operationName: 'UseLive',
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: '639d5f11bfb8bf3053b424d9ef650d04c4ebb7d94711d644afb08fe9a0fad5d9'
          }
        },
        variables: {
          channelLogin: roomId
        }
      }
    })
    const data = res.data
    const stream = data.user.stream
    if (!stream) {
      return {
        code: CRAWLER_ERROR_CODE.NOT_URLS
      }
    }
  } catch (e) {
    log('baseGetTwitchLiveUrlPlugin error: ', e.message)
  }

  const json = (
    await request('https://gql.twitch.tv/gql', {
      method: 'post',
      headers: {
        'Client-Id': clientID,
        cookie
      },
      proxy,
      data: query
    })
  ).data

  const streamPlaybackAccessToken = json.data.streamPlaybackAccessToken
  const search = new URLSearchParams('')
  search.set('acmb', 'e30=')
  search.set('allow_source', true)
  search.set('fast_bread', true)
  search.set('player_backend', true)
  search.set('reassignments_supported', true)
  search.set('sig', streamPlaybackAccessToken.signature)
  search.set('supported_codecs', 'avc1')
  search.set('transcode_mode', 'cbr_v1')
  search.set('token', streamPlaybackAccessToken.value)
  const url = `https://usher.ttvnw.net/api/channel/hls/${roomId}.m3u8?${search.toString()}`

  return {
    code: SUCCESS_CODE,
    liveUrls: [url]
  }
}

export const getTwitchLiveUrlsPlugin = captureError(baseGetTwitchLiveUrlsPlugin)
