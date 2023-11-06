import React, { useEffect, useState } from "react"
import { baseUrl } from "../config"

export enum ConnectionType {
  WEBSOCKET = "Websocket",
  WEBRTC = "WebRTC (not implemented)",
  LONG_POLLING = "Long polling (not implemented)",
  MQTT = "MQTT (not implemented)",
}

const Game = () => {
  const [phaser, setPhaser] = useState<Phaser.Game>()
  const [activeCommunicationType, setActiveCommunicationType] =
    useState<ConnectionType>("WEBSOCKET" as ConnectionType)
  const [newCommunicationType, setNewCommunicationType] =
    useState<ConnectionType>("WEBSOCKET" as ConnectionType)

  useEffect(() => {
    const initPhaser = async () => {
      const Phaser = await import("phaser")
      const { default: GameScene } = await import("./GameScene")

      const config = {
        event: Phaser.AUTO,
        parent: "phaser-container",
        width: 800,
        height: 800,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0, x: 0 },
          },
        },
      }

      let game = new Phaser.Game({
        ...config,
        scene: [GameScene],
      })

      setPhaser(game)
    }

    initPhaser()
  }, [])

  useEffect(() => {
    const setConnection = async (type: ConnectionType) => {
      const body = JSON.stringify({ connectionType: type })

      const response = await window.fetch(`${baseUrl}/connection-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      })

      const data = await response.json()

      setActiveCommunicationType(data["connectionType"] as ConnectionType)
    }
    setConnection(newCommunicationType)
  }, [newCommunicationType])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div>
        <div>Active communication type: {activeCommunicationType}</div>
        {Object.keys(ConnectionType).map((key) => (
          <button
            key={key}
            value={key}
            onClick={() => setNewCommunicationType(key as ConnectionType)}
          >
            {ConnectionType[key as keyof typeof ConnectionType]}
          </button>
        ))}
      </div>
      <div id="phaser-container" style={{ marginTop: "2rem" }} />
    </div>
  )
}

export default Game
