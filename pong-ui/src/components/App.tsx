import React, { useEffect, useState } from "react"

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

  return <h1>Server says: {message}</h1>
}

export default App
