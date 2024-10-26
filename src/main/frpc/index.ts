import fsp from 'node:fs/promises'
import { join } from 'node:path'
import os from 'node:os'
import type { ChildProcess } from 'node:child_process'

import { app, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import Fastify from 'fastify'
import WebSocket from 'ws'
import spawn from 'cross-spawn'
import { FRP_DOMAIN, FRPC_PROCESS_ERROR, WEBSOCKET_MESSAGE_TYPE } from '../../const'

import debug from 'debug'

const log = debug('fideo-frpc')

const isMac = os.platform() === 'darwin'
const isArm = ['arm64', 'arm'].includes(os.arch())

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

  let port: string

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
        .replace(
          '$$WEBSOCKET_URL$$',
          !is.dev ? `ws://localhost:${port}` : `wss://${FRP_DOMAIN}/${code}`
        )

      reply.code(200).header('Content-Type', 'text/html').send(htmlContent)
    } catch (err) {
      log('err: ', err)
      reply.code(500).header('Content-Type', 'text/plain').send('Internal Server Error')
    }
  })

  fastify.get('/health', async (_, reply) => {
    reply.code(200).header('Content-Type', 'text/plain').send('OK')
  })

  fastify.setNotFoundHandler((_, reply) => {
    reply.code(404).header('Content-Type', 'text/plain').send('Not Found')
  })

  const server = fastify.server
  const wss = new WebSocket.Server({
    server,
    perMessageDeflate: true
  })

  let streamConfigList: IStreamConfig[] = []

  wss.on('connection', (ws) => {
    log('WebSocket client connected')

    ws.send(
      JSON.stringify({
        type: 'UPDATE_STREAM_CONFIG_LIST',
        data: streamConfigList
      })
    )

    ws.on('message', (message) => {
      let messageObj
      try {
        messageObj = JSON.parse(message.toString())
      } catch {
        messageObj = {}
      }
      const { type, data } = messageObj

      switch (type) {
        case WEBSOCKET_MESSAGE_TYPE.UPDATE_STREAM_CONFIG_LIST:
          streamConfigList = data as IStreamConfig[]
          break
        case WEBSOCKET_MESSAGE_TYPE.REMOVE_STREAM_CONFIG:
          streamConfigList = streamConfigList.filter((streamConfig) => streamConfig.id !== data)
          break
        case WEBSOCKET_MESSAGE_TYPE.UPDATE_STREAM_CONFIG:
          streamConfigList = streamConfigList.map((streamConfig) =>
            streamConfig.id === data.id ? data : streamConfig
          )
          break
        case WEBSOCKET_MESSAGE_TYPE.ADD_STREAM_CONFIG:
          streamConfigList.unshift(data as IStreamConfig)
          break
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
      log('WebSocket client disconnected')
    })
  })

  const stopFrpcLocalServer = () => {
    fastify.close()
    wss.close()
  }

  fastify.listen({ port: 0, host: '0.0.0.0' }, async (err, address) => {
    if (err) {
      log(err)
      reject()
      stopFrpcLocalServer()
      return
    }

    port = new URL(address).port
    log(`Server is listening on ${address}`)

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
    log('code: ', code)
    const userPath = app.getPath('userData')
    const { port, stopFrpcLocalServer } = await startFrpcLocalServer(code)
    writeLog('frpc', 'port: ' + port)
    log('port: ', port)

    const frpcConfig = `
      serverAddr = "${FRP_DOMAIN}"
      auth.token = "fideo-frp"
      loginFailExit = false
      [transport]
      heartbeatInterval = 60
      heartbeatTimeout = 180
      tcpMuxKeepaliveInterval = -1
      dialServerTimeout = 30
      [[proxies]]
      name = "${code}"
      type = "http"
      localPort = ${port}
      customDomains = ["${FRP_DOMAIN}"]
      locations = ["/${code}"]
      healthCheck.type = "http"
      healthCheck.path = "/health"
    `
    const frpcConfigPath = join(userPath, 'frpc.toml')

    await fsp.writeFile(frpcConfigPath, frpcConfig, { encoding: 'utf-8' })

    writeLog('frpc', 'frpcConfigPath: ' + frpcConfigPath)

    const frpcPath = isMac
      ? isArm
        ? join(userPath, 'frp-mac-arm64/frpc')
        : join(userPath, 'frp-mac-amd64/frpc')
      : isArm
        ? join(userPath, 'frp-win-arm64/frpc.exe')
        : join(userPath, 'frp-win-amd64/frpc.exe')

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
      log('frpcProcess stdout: ', str)
      if (str.includes('Fideo FRPS ERROR: ')) {
        stopFrpc()
        win.webContents.send(FRPC_PROCESS_ERROR, str)
      }
    })

    frpcProcess.stdout?.on('error', (err) => {
      writeLog('frpc', 'frpcProcess stdout error: ' + err)
      log('frpcProcess stdout error: ', err)
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
