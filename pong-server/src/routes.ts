import { Router } from "express"

const router = Router()

let connectionType = "WEBSOCKET"

router.get("/connection-type", (req, res) => {
  res.json({ connectionType })
})

router.post("/connection-type", (req, res) => {
  connectionType = req.body.connectionType
  console.log(connectionType)

  res.json({ connectionType })
})

export default router
