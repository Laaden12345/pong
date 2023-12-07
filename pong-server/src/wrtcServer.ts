import { ServerChannel, Data } from "@geckos.io/server"
import {
  addPlayer,
  //removePlayer,
  updateBall,
  updatePlayer,
} from "./game-management"
import { PlayerState, BallState, state } from "./state"

export const handleRTCMessage = async (
  channel: ServerChannel,
  message: string,
  data: Data
) => {
  const json = JSON.parse(data.toString())

  switch (message) {
    case "join": {
      try {
        console.log("adding player")

        const player = await addPlayer(json.clientId)

        channel.emit("playerJoined", JSON.stringify(player))
        break
      } catch (e) {
        if (e instanceof Error) {
          console.log(e)
          channel.emit("errorMsg", JSON.stringify({ error: e.message }))
        }
        break
      }
    }
    case "getGameState": {
      if (
        state.gameRunning &&
        new Date().getTime() - state.ball.lastUpdate > (1 / 60) * 1000 // limit update frequency to 60Hz
      ) {
        updateBall(undefined)
      }
      /* state.players.forEach((player) => {
          if (
            player.lastPingUpdate &&
            new Date().getTime() - player.lastPingUpdate > 5000
          ) {
            console.log(`Removing player ${player.id} due to timeout`)
            removePlayer(player.id)
          }
        }) */
      channel.room.emit("gameState", JSON.stringify(state))
      break
    }
    case "updatePlayer": {
      const playerState = json as PlayerState
      updatePlayer(playerState)
      break
    }
    case "updateBall": {
      const ballState = json as BallState
      updateBall(ballState)
      break
    }
    case "startGame": {
      state.gameRunning = true
      const direction = Math.random() * Math.PI * 2

      state.ball.velocity.x = Math.cos(direction) * 0.5 * 1000
      state.ball.velocity.y = Math.sin(direction) * 0.5 * 1000

      channel.emit("startGame", "gameStarted")
      break
    }
  }
}
