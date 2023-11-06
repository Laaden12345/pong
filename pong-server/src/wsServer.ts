import { RawData, WebSocket, WebSocketServer } from "ws"
import { addPlayer, updateBall, updatePlayer } from "./game-management"
import { PlayerState, BallState, state } from "./state"
import { isJson } from "./utils"

export const handleMessage = async (
  ws: WebSocket,
  wsServer: WebSocketServer,
  message: RawData
) => {
  console.log(`Message received: ${message}`)

  if (isJson(message.toString())) {
    const json = JSON.parse(message.toString())

    switch (JSON.parse(message.toString()).event) {
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
        if (
          state.gameRunning &&
          new Date().getTime() - state.ball.lastUpdate > 10 // throttle ball updates
        ) {
          updateBall(undefined)
        }
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
        //ws.send(JSON.stringify(ballState))
        break
      }
      case "getPlayers": {
        ws.send(JSON.stringify(state.players))
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
