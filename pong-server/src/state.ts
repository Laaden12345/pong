export interface PlayerState {
  playerNo: number
  id: string
  lostGame: boolean
  location: {
    x: number
    y: number
  }
}

export interface BallState {
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

export interface GameState {
  players: PlayerState[]
  scores: number[]
  ball: BallState
  gameRunning: boolean
}

export const state: GameState = {
  players: [],
  scores: [10, 10, 10, 10],
  ball: {
    location: {
      x: 400,
      y: 400,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    lastUpdate: new Date().getTime(),
  },
  gameRunning: false,
}
