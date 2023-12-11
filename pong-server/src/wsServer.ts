import { RawData, WebSocket, WebSocketServer } from "ws"
import {
  addPlayer,
  checkIdlePlayers,
  updateBall,
  updatePlayer,
} from "./game-management"
import { PlayerState, BallState, state } from "./state"
import { isJson } from "./utils"

export const handleMessage = async (
  ws: WebSocket,
  wsServer: WebSocketServer,
  message: RawData
) => {
  if (isJson(message.toString())) {
    const json = JSON.parse(message.toString())

    switch (json.event) {
      case "join": {
        try {
          console.log("adding player")

          const player = await addPlayer(json.payload.clientId)

          ws.send(
            JSON.stringify({
              event: "playerJoined",
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
      case "getGameState": {
        if (state.gameRunning) {
          updateBall(undefined)
        }

        const player = state.players.find((p) => p.id === json.payload.clientId)
        if (player) {
          player.lastPingUpdate = json.payload.pingDate
        }

        // Remove players that haven't called for 5 seconds
        checkIdlePlayers()

        wsServer.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              event: "gameState",
              payload: state,
            })
          )
        })
        break
      }
      case "updatePlayer": {
        const playerState = json.payload as PlayerState
        updatePlayer(playerState)
        break
      }
      case "updateBall": {
        const ballState = json.payload as BallState
        updateBall(ballState)
        break
      }
      case "startGame": {
        state.gameRunning = true
        const direction = Math.random() * Math.PI * 2

        state.ball.velocity.x = Math.cos(direction) * 0.5 * 1000
        state.ball.velocity.y = Math.sin(direction) * 0.5 * 1000

        ws.send(JSON.stringify({ event: "gameStarted" }))
        break
      }
    }
  }
}
