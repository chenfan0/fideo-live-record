import fsp from 'node:fs/promises'
import path from 'node:path'
import dayjs from 'dayjs'

export function writeLogWrapper(baseDir: string) {
  const logPrefixPath = path.resolve(baseDir, 'logs')
  console.log('logPrefixPath:', logPrefixPath)
  return async (title: string, content: string) => {
    const logPath = path.resolve(logPrefixPath, title)
    return fsp
      .mkdir(logPath, { recursive: true })
      .catch((e) => {
        console.log(e)
      })
      .then(() => {
        const logFilePath = path.resolve(logPath, `${dayjs().format('YYYY-MM-DD')}.txt`)
        content = `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] ${content}`
        fsp
          .readFile(logFilePath, 'utf8')
          .then((existingContent) => {
            const prefix = existingContent ? '\n' : 'Fideo LOG: \n'
            return fsp.appendFile(logFilePath, `${prefix}${content}`)
          })
          .catch(() => {
            return fsp.writeFile(logFilePath, `Fideo LOG: \n${content}`)
          })
      })
  }
}
