import React, { useEffect, useState } from "react"
import Game from '../game/Game'

const App = () => {
  const [message, setMessage] = useState("Loading...")
  const fetchMessage = async () => {
    const endpoint = `http://localhost:${import.meta.env.PUBLIC_BACKEND_PORT}`
    const response = await fetch(endpoint)

    setMessage(await response.text())
  }
  useEffect(() => {
    fetchMessage()
  })

  return <Game />
}

export default App
