import { PlayerState, state, BallState } from "./state"

export const addPlayer = async (clientId: string) => {
  if (state.players.find((p) => p.id === clientId)) {
    throw new Error("Player already exists")
  }
  if (state.players.length >= 4) {
    throw new Error("Max players reached")
  }
  let playerNo = 4
  for (let i = 0; i < 4; i++) {
    if (!state.players.find((p) => p.playerNo === i)) {
      playerNo = i
      break
    }
  }

  console.log(`Player ${clientId} joined as player ${playerNo}`)

  const player: PlayerState = {
    playerNo,
    id: clientId,
    lostGame: false,
    location: {
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

export const checkIdlePlayers = () => {
  state.players.forEach((player) => {
    if (
      player.lastPingUpdate &&
      new Date().getTime() - player.lastPingUpdate > 5000
    ) {
      console.log(`Removing player ${player.id} due to timeout`)
      removePlayer(player.id)
    }
  })
}

export const removePlayer = (clientId: string) => {
  const index = state.players.findIndex((p) => p.id === clientId)
  if (index === -1) {
    console.log(`Player ${clientId} not found`)
    return
  }
  state.players.splice(index, 1)
  state.scores[index] = 10;
  
  console.log(`Player ${clientId} removed`)
}

export const updateBall = async (ballState?: BallState) => {
  const now = new Date().getTime()

  if (ballState) {
    state.ball.velocity.x = ballState.velocity.x
    state.ball.velocity.y = ballState.velocity.y
    state.ball.location.x = ballState.location.x
    state.ball.location.y = ballState.location.y
  }
  if (
    state.ball.location.x < -25 ||
    state.ball.location.x > 825 ||
    state.ball.location.y < -25 ||
    state.ball.location.y > 825
  ) {
    const x = state.ball.location.x
    const y = state.ball.location.y
    state.ball.velocity.x = 0
    state.ball.velocity.y = 0
    state.ball.location.x = 400
    state.ball.location.y = 400
    updateScores(x, y, state.gameRunning)
    state.gameRunning = false
  }
  state.ball.lastUpdate = now
}

const updateScores = async (
  x: number,
  y: number,
  needsScoreUpdate: boolean
) => {
  if (needsScoreUpdate) {
    if (y < -25) {
      state.scores[0] -= 1
      if (state.scores[0] <= 0) {
        state.players[0].lostGame = true
      }
    } else if (y > 825) {
      state.scores[1] -= 1
      if (state.scores[1] <= 0) {
        state.players[1].lostGame = true
      }
    } else if (x < -25) {
      state.scores[2] -= 1
      if (state.scores[2] <= 0) {
        state.players[2].lostGame = true
      }
    } else if (x > 825) {
      state.scores[3] -= 1
      if (state.scores[3] <= 0) {
        state.players[3].lostGame = true
      }
    }
  }
}
