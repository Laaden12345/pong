export interface PlayerState {
  playerNo: number
  id: string
  height: number
  width: number
  location: {
    x: number
    y: number
  }
  velocity: {
    x: number
    y: number
  }
}

export interface GameState {
  connectedClients: string[]
  players: PlayerState[]
  ball: {
    location: {
      x: number
      y: number
    }
    velocity: {
      x: number
      y: number
    }
    collision: number
    lastUpdate: number
  }
  gameRunning: boolean
}

export const state: GameState = {
  connectedClients: [],
  players: [],
  ball: {
    location: {
      x: 450,
      y: 450,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    collision: -1,
    lastUpdate: new Date().getTime(),
  },
  gameRunning: false,
}
