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
    height: 0,
    width: 0,
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

  const collision = state.ball.collision
  if (collision != -1) {
    const velocity = calculateCollision(
      state.players[collision],
      collision >= 2 ? 1 : -1
    )
    console.log(velocity)
    state.ball.velocity.x = velocity[0]
    state.ball.velocity.y = velocity[1]
  }
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

//TODO MOVE ALL CALCULATIONS OF COLLISION AND FIX UPDATE BALL FUNCTION, PROBLEM: ALL PLAYERS UPDATE ABOUT THE SAME COLLISION IN THE UI
const calculateCollision = (
  player: PlayerState,
  direction: number
): [number, number] => {
  //HARD CODED PLACEHOLDER
  const ballVelocity = 400

  if (player.playerNo == 0 || player.playerNo == 2) {
    //Calculate the relative collision point of the ball and paddle
    const relativeIntersectY = player.location.y - state.ball.location.y
    //Normalize the relativeIntersectY value
    const normalizedRelativeIntersectionY =
      relativeIntersectY / (player.height / 2)
    //Calculate the bounce angle (maximum 45 degrees)
    const bounceAngle = (normalizedRelativeIntersectionY * Math.PI) / 4
    //Calculate the x-velocity of the ball
    const ballVx = ballVelocity * Math.cos(bounceAngle)
    //Calculate the y-velocity of the ball
    const ballVy = ballVelocity * -Math.sin(bounceAngle)
    //Update the x and y ball velocities
    return [direction * ballVx, ballVy]
  } else {
    //Calculate the relative collision point of the ball and paddle
    const relativeIntersectX = player.location.x - state.ball.location.x
    //Normalize the relativeIntersectX value
    const normalizedRelativeIntersectionX =
      relativeIntersectX / (player.width / 2)
    //Calculate the bounce angle (maximum 45 degrees)
    const bounceAngle = (normalizedRelativeIntersectionX * Math.PI) / 4
    //Calculate the y-velocity of the ball
    const ballVy = ballVelocity * Math.cos(bounceAngle)
    //Calculate the x-velocity of the ball
    const ballVx = ballVelocity * -Math.sin(bounceAngle)
    //Update the x and y ball velocities
    return [ballVx, direction * ballVy]
  }
}
