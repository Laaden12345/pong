import { PlayerState, state } from "./state"

export const addPlayer = (clientId: string) => {
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
