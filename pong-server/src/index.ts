import http from "http"
import cors from "cors"
import express from "express"
import router from "./routes"
import lpRouter from "./lpRoutes"
import geckos from "@geckos.io/server"
import { handleMessage } from "./wsServer"
import { handleRTCMessage } from "./wrtcServer"
import { WebSocketServer } from "ws"
import { randomUUID } from "node:crypto"
import { PlayerState, BallState, state } from "./state"

const app = express()
app.use(cors())
const port = parseInt(process.env.PUBLIC_BACKEND_PORT || "7777")
const wsPort = parseInt(process.env.PUBLIC_WEBSOCKET_PORT || "7778")
const lpPort = parseInt(process.env.PUBLIC_LP_PORT || "7779")
const wrtcPort = parseInt(process.env.PUBLIC_RTC_PORT || "7780")
app.use(express.json())

app.use("/", router)

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`)
})

const lpApp = express()
lpApp.use(cors())
lpApp.use(express.json())

lpApp.use("/", lpRouter)

lpApp.listen(lpPort, "0.0.0.0", () => {
  console.log(`Example app listening on port ${lpPort}`)
})

var longpoll = require("express-longpoll")(lpApp)
longpoll.create("/poll")
var data = state

longpoll.publish("/poll", data)

// Publish every 5 seconds
setInterval(function () {
  longpoll.publish("/poll", data)
}, 50)

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

const wrtcApp = express()
wrtcApp.use(cors())
wrtcApp.use(express.json())

wrtcApp.use("/", router)

const wrtcServer = http.createServer(wrtcApp)
const io = geckos()
io.addServer(wrtcServer)

wrtcServer.listen(wrtcPort, "0.0.0.0", () => {
  console.log(`Example app listening on port ${wrtcPort}`)
})

io.onConnection((channel) => {
  console.log("Client connected")
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`)
  })
  channel.on("join", (data) => {
    handleRTCMessage(channel, "join", data)
  })
  channel.on("getGameState", (data) => {
    handleRTCMessage(channel, "getGameState", data)
  })
  channel.on("updatePlayer", (data) => {
    handleRTCMessage(channel, "updatePlayer", data)
  })
  channel.on("updateBall", (data) => {
    handleRTCMessage(channel, "updateBall", data)
  })
  channel.on("startGame", (data) => {
    handleRTCMessage(channel, "startGame", data)
  })
  channel.onDisconnect((data) => {
    console.log("Client disconnected")
    console.log(data)
  })
})
