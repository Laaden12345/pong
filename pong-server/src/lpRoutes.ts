import { Router } from "express"
import {
  addPlayer,
  updateBall,
  updatePlayer,
  checkIdlePlayers,
} from "./game-management"
import { PlayerState, BallState, state } from "./state"
import { connectionType } from "./routes"

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
  if (state.gameRunning) {
    updateBall(undefined)
  }

  const player = state.players.find((p) => p.id === req.body.clientId)
  if (player) {
    player.lastPingUpdate = req.body.pingDate
  }

  if (connectionType === "LONG_POLLING") {
    checkIdlePlayers()
  }

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
