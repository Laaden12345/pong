import cors from "cors"
import express from "express"
import router from "./routes"
import lpRouter from "./lpRoutes"
import { handleMessage } from "./wsServer"
import { WebSocketServer } from "ws"
import { state } from "./state"

const app = express()
app.use(cors())
const port = parseInt(process.env.PUBLIC_BACKEND_PORT || "7777")
const wsPort = parseInt(process.env.PUBLIC_WEBSOCKET_PORT || "7778")
const lpPort = parseInt(process.env.PUBLIC_LP_WEBSOCKET_PORT || "7779")
app.use(express.json())

app.use("/", router)

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`)
})

const lpApp = express()
lpApp.use(cors())
lpApp.use(express.json())

lpApp.use("/", lpRouter)

lpApp.listen(lpPort, "0.0.0.0", () => {
  console.log(`Long polling server listening on port ${lpPort}`)
})

var longpoll = require("express-longpoll")(lpApp)
longpoll.create("/poll")
var data = state

longpoll.publish("/poll", data)

// Publish at rate of 60Hz
setInterval(
  function () {
    longpoll.publish("/poll", data)
  },
  (1 / 60) * 1000
)

const wsServer = new WebSocketServer({ port: wsPort, clientTracking: true })

wsServer.on("connection", (ws) => {
  console.log("Client connected")
  ws.on("message", (message) => {
    handleMessage(ws, wsServer, message)
  })
  ws.on("close", (event) => {
    console.log("Client disconnected")
    console.log(event)
  })
})
