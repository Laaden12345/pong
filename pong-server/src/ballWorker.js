import { state } from "./state"

console.log("game started")

while (!state.gameOver) {
  const now = new Date().getTime()
  const time = now - state.ball.lastUpdate
  state.ball.location.x += state.ball.velocity.x * time
  state.ball.location.y += state.ball.velocity.y * time
  console.log(state.ball.location.x, state.ball.location.y)
  if (
    state.ball.location.x < 0 ||
    state.ball.location.x > 800 ||
    state.ball.location.y < 0 ||
    state.ball.location.y > 800
  ) {
    state.gameOver = true
    state.ball.velocity.x = 0
    state.ball.velocity.y = 0
    state.ball.location.x = 400
    state.ball.location.y = 400
  }
  state.ball.lastUpdate = now
  setInterval(() => {}, (1 / 60) * 1000)
}
