import { Router } from "express"
import * as fs from "node:fs"

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

router.get("/pings", (req, res) => {
  const files = fs.readdirSync(__dirname + "/../pings")
  const pings = files.map((file) => {
    const data = fs.readFileSync(__dirname + "/../pings/" + file)
    return JSON.parse(data.toString())
  })
  res.json(pings)
})

router.post("/pings", (req, res) => {
  console.log("Received pings")

  const pings = [...req.body.pings]
  const average = pings.reduce((a, b) => a + b, 0) / pings.length
  const median = pings.sort()[Math.floor(pings.length / 2)]
  const ninetynine = pings.sort()[Math.floor(pings.length * 0.99)]
  const min = pings.sort()[0]
  const max = pings.sort()[pings.length - 1]
  const result = {
    time: new Date().toISOString(),
    protocol: req.body.protocol,
    duration: req.body.duration,
    average,
    median,
    ninetynine,
    min,
    max,
    pings: req.body.pings,
  }
  const filename = new Date().toISOString().replace(/:/g, "-") + ".json"
  try {
    fs.writeFileSync(
      __dirname + "/../pings/" + filename,
      JSON.stringify(result)
    )
  } catch (e) {
    console.error(e)
  }
  res.send("OK")
})

export default router
