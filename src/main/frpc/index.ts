import fsp from 'node:fs/promises'
import { join } from 'node:path'
import type { ChildProcess } from 'node:child_process'

import { app, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import Fastify from 'fastify'
import WebSocket from 'ws'
import spawn from 'cross-spawn'
import { FRPC_PROCESS_ERROR } from '../../const'

export let frpcObj: {
  frpcProcess: ChildProcess
  stopFrpcLocalServer: () => void
} | null = null

export function stopFrpc() {
  frpcObj?.frpcProcess.kill()
  frpcObj?.stopFrpcLocalServer()
  frpcObj = null
}

async function startFrpcLocalServer(
  code: string
): Promise<{ port: string; stopFrpcLocalServer: () => void }> {
  let resolve!: (value: unknown) => void, reject!: (reason?: any) => void

  const p = new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  const fastify = Fastify()

  fastify.get(`/${code}`, async (_, reply) => {
    const filePath = is.dev
      ? join(__dirname, '../../resources/index.html')
      : join(process.resourcesPath, 'index.html')

    try {
      const htmlContent = (await fsp.readFile(filePath, 'utf-8'))
        .toString()
        .replace('$$WEBSOCKET_URL$$', `wss://web.fideo.site/${code}`)

      reply.code(200).header('Content-Type', 'text/html').send(htmlContent)
    } catch (err) {
      console.log('err: ', err)
      reply.code(500).header('Content-Type', 'text/plain').send('Internal Server Error')
    }
  })

  fastify.setNotFoundHandler((_, reply) => {
    reply.code(404).header('Content-Type', 'text/plain').send('Not Found')
  })

  const server = fastify.server
  const wss = new WebSocket.Server({ server })

  let streamConfigList: IStreamConfig[] = []

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected')

    ws.send(
      JSON.stringify({
        type: 'UPDATE_STREAM_CONFIG_LIST',
        data: streamConfigList
      })
    )

    ws.on('message', (message) => {
      const messageObj = JSON.parse(message.toString())
      const { type, data } = messageObj

      if (type === 'UPDATE_STREAM_CONFIG_LIST') {
        streamConfigList = data as IStreamConfig[]
      }

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type,
              data
            })
          )
        }
      })
    })

    ws.on('close', () => {
      console.log('WebSocket client disconnected')
    })
  })

  const stopFrpcLocalServer = () => {
    fastify.close()
    wss.close()
  }

  fastify.listen({ port: 0, host: '0.0.0.0' }, async (err, address) => {
    if (err) {
      console.error(err)
      reject()
      stopFrpcLocalServer()
      return
    }

    const port = new URL(address).port
    console.log(`Server is listening on ${address}`)

    resolve({
      port,
      stopFrpcLocalServer
    })
  })

  return p as any
}

let frpcProcessTimer: NodeJS.Timeout

export async function startFrpcProcess(
  code: string,
  writeLog: (title: string, content: string) => void,
  win: BrowserWindow
) {
  try {
    writeLog('frpc', 'code: ' + code)
    console.log('code: ', code)
    const userPath = app.getPath('userData')
    const { port, stopFrpcLocalServer } = await startFrpcLocalServer(code)
    writeLog('frpc', 'port: ' + port)
    console.log('port: ', port)

    const frpcConfig = `
      serverAddr = "web.fideo.site"
      auth.token = "fideo-frp"
      [[proxies]]
      name = "${code}"
      type = "http"
      localPort = ${port}
      customDomains = ["web.fideo.site"]
      locations = ["/${code}"]
    `
    const frpcConfigPath = join(userPath, 'frpc.toml')

    await fsp.writeFile(frpcConfigPath, frpcConfig, { encoding: 'utf-8' })

    writeLog('frpc', 'frpcConfigPath: ' + frpcConfigPath)

    const frpcPath = is.dev
      ? join(__dirname, '../../resources/frpc/mac-arm64/frpc')
      : join(process.resourcesPath, 'frpc.exe')

    const frpcProcess = spawn(frpcPath, ['-c', frpcConfigPath])

    const frpcProcessCheck = () => {
      if (!frpcProcess) return false
      try {
        process.kill(frpcProcess.pid!, 0)
        return true
      } catch (err) {
        return false
      }
    }

    frpcProcess.stdout?.on('data', (data) => {
      const str = data.toString()
      writeLog('frpc', 'frpcProcess stdout: ' + str)
      console.log('frpcProcess stdout: ', str)
      if (str.includes('error')) {
        stopFrpc()
        win.webContents.send(FRPC_PROCESS_ERROR, str)
      }
    })

    frpcProcess.stdout?.on('error', (err) => {
      writeLog('frpc', 'frpcProcess stdout error: ' + err)
      console.log('frpcProcess stdout error: ', err)
      stopFrpc()
      win.webContents.send(FRPC_PROCESS_ERROR, err)
    })

    frpcProcessTimer = setInterval(() => {
      const isAlive = frpcProcessCheck()
      if (!isAlive) {
        writeLog('frpc', 'frpcProcess isAlive: ' + isAlive)
        stopFrpcLocalServer()
        clearInterval(frpcProcessTimer)
      }
    }, 3000)

    frpcObj = {
      frpcProcess,
      stopFrpcLocalServer
    }
    return {
      status: true,
      code,
      port
    }
  } catch {
    return {
      status: false
    }
  }
}
