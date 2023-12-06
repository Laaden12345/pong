import { Router } from "express"
const events = require("events")
import {
  addPlayer,
  updateBall,
  updatePlayer,
  removePlayer,
} from "./game-management"
import { PlayerState, BallState, state } from "./state"

const router = Router()

router.post("/join", async (req, res) => {
  try {
    console.log("adding player")

    const player = await addPlayer(req.body.clientId)
    res.json({
      event: "playerJoined",
      payload: player,
    })
  } catch (e) {
    if (e instanceof Error) {
      console.log(e)
      res.json(JSON.stringify({ error: e.message }))
    }
  }
})

router.post("/updateGameState", async (req, res) => {
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

  res.json({
    event: "updateGameState",
  })
})

router.post("/updatePlayer", (req, res) => {
  const playerState = req.body as PlayerState
  updatePlayer(playerState)
  res.json({
    event: "movingPaddle",
  })
})

router.post("/updateBall", (req, res) => {
  const ballState = req.body as BallState
  updateBall(ballState)
  res.json({
    event: "updateBall",
  })
})

router.post("/start", (req, res) => {
  state.gameRunning = true
  const direction = Math.random() * Math.PI * 2

  state.ball.velocity.x = Math.cos(direction) * 0.5 * 1000
  state.ball.velocity.y = Math.sin(direction) * 0.5 * 1000

  res.json({ event: "gameStarted" })
})

export default router
