import { GameState, PlayerState, state } from "./state"

export const addPlayer = async (clientId: string) => {
  if (state.players.find((p) => p.id === clientId)) {
    throw new Error("Player already exists")
  }
  if (state.players.length >= 4) {
    throw new Error("Max players reached")
  }
  const player: PlayerState = {
    playerNo: state.players.length,
    id: clientId,
    location: {
      x: 0,
      y: 0,
    },
    velocity: {
      x: 0,
      y: 0,
    },
  }
  state.players.push(player)
  return player
}

export const updatePlayer = (player: PlayerState) => {
  const index = state.players.findIndex((p) => p.id === player.id)
  if (index === -1) {
    console.log(`Player ${player.id} not found`)
    return
  }
  state.players[index] = player
}

export const updateBall = async () => {
  const now = new Date().getTime()
  const time = now - state.ball.lastUpdate

  state.ball.location.x += state.ball.velocity.x * time
  state.ball.location.y += state.ball.velocity.y * time
  if (
    state.ball.location.x < 0 ||
    state.ball.location.x > 800 ||
    state.ball.location.y < 0 ||
    state.ball.location.y > 800
  ) {
    state.gameRunning = false
    state.ball.velocity.x = 0
    state.ball.velocity.y = 0
    state.ball.location.x = 400
    state.ball.location.y = 400
  }
  state.ball.lastUpdate = now
}
