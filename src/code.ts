// error message
export const ERROR_MESSAGE = {
  INVALID_PROXY: 'INVALID_PROXY'
}

// error code
export const CRAWLER_ERROR_CODE = {
  NOT_URLS: 0, // roomUrl not found or not live
  NOT_SUPPORT: 1, // not support the platform
  INVALID_PROXY: 2, // invalid proxy
  INVALID_URL: 3, // invalid url
  TIME_OUT: 4, // timeout
  FORBIDDEN: 5,
  CURRENT_LINE_ERROR: 6 // current line error
}

export const FFMPEG_ERROR_CODE = {
  USER_KILL_PROCESS: 100,
  CURRENT_LINE_ERROR: 101,
  TIME_OUT: 102
}

export const SUCCESS_CODE = 200

export const errorCodeToI18nMessage = (code: number, prefix: string) => {
  let message = prefix
  switch (code) {
    case CRAWLER_ERROR_CODE.NOT_URLS:
      message += 'not_urls'
      break
    case CRAWLER_ERROR_CODE.NOT_SUPPORT:
      message += 'not_support'
      break
    case CRAWLER_ERROR_CODE.INVALID_PROXY:
      message += 'invalid_proxy'
      break
    case CRAWLER_ERROR_CODE.INVALID_URL:
      message += 'invalid_url'
      break
    case CRAWLER_ERROR_CODE.TIME_OUT:
      message += 'time_out'
      break
    case CRAWLER_ERROR_CODE.FORBIDDEN:
      message += 'forbidden'
      break
    case CRAWLER_ERROR_CODE.CURRENT_LINE_ERROR:
      message += 'current_line_error'
      break
    case FFMPEG_ERROR_CODE.USER_KILL_PROCESS:
      message += 'user_stop_record'
      break
    case FFMPEG_ERROR_CODE.CURRENT_LINE_ERROR:
      message += 'current_line_error'
      break
    case FFMPEG_ERROR_CODE.TIME_OUT:
      message += 'time_out'
      break
    default:
      message += 'unknown_error'
      break
  }
  return message
}
