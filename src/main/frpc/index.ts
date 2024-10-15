import fsp from 'node:fs/promises'
import { join } from 'node:path'

import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import Fastify from 'fastify'
import WebSocket from 'ws'
import spawn from 'cross-spawn'

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
        type: 'streamConfigList',
        data: streamConfigList
      })
    )

    ws.on('message', (message) => {
      const messageObj = JSON.parse(message.toString())
      const { type, data } = messageObj

      if (type === 'streamConfigList') {
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

export async function startFrpcProcess(code: string) {
  try {
    const userPath = app.getPath('userData')
    const { port, stopFrpcLocalServer } = await startFrpcLocalServer(code)

    const frpcConfig = `
      serverAddr = "152.32.188.7"
      [[proxies]]
      name = "fideo-frpc"
      type = "http"
      localPort = ${port}
      customDomains = ["web.fideo.site"]
      locations = ["/${code}"]
    `

    const frpcConfigPath = join(userPath, 'frpc.toml')

    await fsp.writeFile(frpcConfigPath, frpcConfig, { encoding: 'utf-8' })

    const frpcPath = is.dev
      ? join(__dirname, '../../resources/frpc/mac-arm64/frpc')
      : join(process.resourcesPath, 'frpc.exe')

    const frpcProcess = spawn(frpcPath, ['-c', frpcConfigPath])

    frpcProcess.stdout?.on('data', (data) => {
      console.log('frpcProcess stdout: ', data.toString())
    })

    frpcProcess.stdout?.on('error', (err) => {
      console.log('frpcProcess stdout error: ', err)
      stopFrpcLocalServer()
      frpcProcess.kill()
      // TODO: ipc 通知
    })

    frpcProcess.on('close', (code) => {
      console.log('frpcProcess close: ', code)
    })

    return {
      stopFrpcLocalServer,
      frpcProcess
    }
  } catch {
    return null
  }
}
