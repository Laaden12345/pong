import { Router } from "express"
import { randomUUID } from "node:crypto"
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
  const filtered = files.filter((file) => file.endsWith(".json"))
  const pings = filtered
    .map((file) => {
      const data = fs.readFileSync(__dirname + "/../pings/" + file)
      return JSON.parse(data.toString())
    })
    .sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime()
    })
  res.json(pings)
})

router.post("/pings", (req, res) => {
  console.log("Received pings")

  const pings = [...req.body.pings] as number[]
  const average = pings.reduce((a, b) => a + b, 0) / pings.length
  const median = pings.sort()[Math.floor(pings.length / 2)]
  const ninetynine = pings[Math.floor(pings.length * 0.99)]
  const min = Math.min(...pings)
  const max = Math.max(...pings)
  const id = randomUUID()
  const result = {
    id,
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
  const filename = id + ".json"
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

router.delete("/pings/:id", (req, res) => {
  const id = req.params.id
  try {
    const filename = fs
      .readdirSync(__dirname + "/../pings")
      .find((file) => file.startsWith(id))
    fs.unlinkSync(__dirname + "/../pings/" + filename)
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(404).send()
  }
})

export default router
