import cors from "cors"
import express from "express"
import router from "./routes"
import { handleMessage } from "./wsServer"
import { WebSocketServer } from "ws"
import { randomUUID } from "node:crypto"

const app = express()
app.use(cors())
const port = parseInt(process.env.PUBLIC_BACKEND_PORT || "7777")
const wsPort = parseInt(process.env.PUBLIC_WEBSOCKET_PORT || "7778")
app.use(express.json())

app.use("/", router)

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`)
})

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
