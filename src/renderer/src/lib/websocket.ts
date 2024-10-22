let websocket: WebSocket | null = null

export enum WebSocketMessageType {
  UPDATE_STREAM_CONFIG_LIST = 'UPDATE_STREAM_CONFIG_LIST',
  UPDATE_FFMPEG_PROGRESS_INFO = 'UPDATE_FFMPEG_PROGRESS_INFO',
  SHOW_TOAST = 'SHOW_TOAST',

  START_RECORD_STREAM = 'START_RECORD_STREAM',
  PAUSE_RECORD_STREAM = 'PAUSE_RECORD_STREAM'
}

export function getWebsocket() {
  return websocket
}

interface IMessage {
  type: WebSocketMessageType
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

export function createWebSocket(port: number, code: string) {
  websocket = new WebSocket(`ws://localhost:${port}/${code}`)

  websocket.onopen = () => {
    while (messageQueue.length) {
      const message = messageQueue.shift()
      if (message) {
        websocket!.send(JSON.stringify(message))
      }
    }
  }

  websocket.onmessage = function (event) {
    const messageObj = JSON.parse(event.data)

    const { type, data } = messageObj

    switch (type) {
      case WebSocketMessageType.START_RECORD_STREAM:
        document.getElementById(data.id + '_play')?.click()
        break
      case WebSocketMessageType.PAUSE_RECORD_STREAM:
        document.getElementById(data.id + '_pause')?.click()
        break
    }
  }
}

export function closeWebSocket() {
  if (websocket) {
    websocket.close()
    websocket = null
  }
}
