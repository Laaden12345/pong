export interface PlayerState {
  playerNo: number
  id: string
  location: {
    x: number
    y: number
  }
  velocity: {
    x: number
    y: number
  }
}

export interface BallState {
  id: string
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
    lastUpdate: new Date().getTime(),
  },
  gameRunning: false,
}
