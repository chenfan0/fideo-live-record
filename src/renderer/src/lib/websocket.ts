let websocket: WebSocket | null = null

export function getWebsocket() {
  return websocket
}

interface IMessage {
  type: string
  data: any
}
const messageQueue: IMessage[] = []
export function sendMessage(message: IMessage) {
  if (!websocket) {
    messageQueue.push(message)
    return
  }
  if (websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(message))
  } else {
    messageQueue.push(message)
  }
}

export function createWebSocket(
  port: number,
  code: string,
  onMessage: (event: MessageEvent) => void
) {
  websocket = new WebSocket(`ws://localhost:${port}/${code}`)

  websocket.onopen = () => {
    while (messageQueue.length) {
      const message = messageQueue.shift()
      if (message) {
        websocket!.send(JSON.stringify(message))
      }
    }
  }

  websocket.onmessage = onMessage

  websocket.onclose = (event) => {
    if (event.code === 1000) {
      websocket = null
    } else {
      createWebSocket(port, code, onMessage)
    }
  }
}

export function closeWebSocket() {
  if (websocket) {
    websocket.close(1000)
    websocket = null
  }
}
