import cors from "cors"
import express from "express"

const app = express()
app.use(cors())
const port = parseInt(process.env.PUBLIC_BACKEND_PORT || "7777")

app.get("/", (req, res) => {
  res.send("Hello World")
})

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`)
})
