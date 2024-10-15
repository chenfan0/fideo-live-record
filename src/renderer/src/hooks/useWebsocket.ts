import { useEffect, useState } from 'react'

export function useWebsocket(port: string, code: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    if (socket === null) {
      const _socket = new WebSocket(`ws://localhost:${port}/${code}`)

      _socket.onopen = () => {
        setSocket(_socket)
      }

      _socket.onclose = () => {
        setSocket(null)
      }

      _socket.onmessage = (event) => {
        const messageObj = JSON.parse(event.data)

        const { type, data } = messageObj

        switch (type) {
          case 'play':
            break
        }
      }
    }
  }, [socket])

  return {
    socket
  }
}
