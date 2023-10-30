import { RawData, WebSocket, WebSocketServer } from "ws"
import { Worker } from "worker_threads"
import { PlayerState, state } from "./state"
import { isJson } from "./utils"
import { addPlayer, updatePlayer } from "./game-management"
import { spawn } from "child_process"

export const handleMessage = (
  ws: WebSocket,
  wsServer: WebSocketServer,
  message: RawData
) => {
  console.log(`Message received: ${message}`)

  if (isJson(message.toString())) {
    const json = JSON.parse(message.toString())
    switch (JSON.parse(message.toString()).type) {
      case "join": {
        try {
          console.log("adding player")

          const player = addPlayer(json.payload.clientId)

          ws.send(
            JSON.stringify({
              type: "playerJoined",
              payload: player,
            })
          )
          break
        } catch (e) {
          if (e instanceof Error) {
            console.log(e)
            ws.send(JSON.stringify({ error: e.message }))
          }
          break
        }
      }
      case "updatePlayer": {
        const playerState = json.payload as PlayerState
        updatePlayer(playerState)
        wsServer.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            const data = JSON.stringify({
              type: "updatePlayers",
              payload: state.players,
            })

            client.send(data)
          }
        })
        break
      }
      case "updateBall": {
        wsServer.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            const data = JSON.stringify({
              type: "updateBall",
              payload: state.ball,
            })

            client.send(data)
          }
        })
        break
      }
      case "getPlayers": {
        ws.send(JSON.stringify(state.players))
        break
      }
      case "startGame": {
        state.gameOver = false
        state.ball.velocity.x = (Math.random() * 2 - 1) * 400
        state.ball.velocity.y = (Math.random() * 2 - 1) * 400
        spawn("node", ["./src/ballWorker.js"])
        ws.send(JSON.stringify({ type: "gameStarted" }))
        break
      }
    }
  }
}
