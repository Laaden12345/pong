import React, { useEffect, useState } from "react"
import { baseUrl } from "../config"

export enum ConnectionType {
  WEBSOCKET = "Websocket",
  WEBRTC = "WebRTC (not implemented)",
  LONG_POLLING = "Long polling (not implemented)",
  MQTT = "MQTT (not implemented)",
}

interface PingData {
  time: string
  protocol: string
  duration: number
  average: number
  median: number
  ninetynine: number
  min: number
  max: number
  pings: number[]
}

const Game = () => {
  const [phaser, setPhaser] = useState<Phaser.Game>()
  const [activeCommunicationType, setActiveCommunicationType] =
    useState<ConnectionType>("WEBSOCKET" as ConnectionType)
  const [newCommunicationType, setNewCommunicationType] =
    useState<ConnectionType>("WEBSOCKET" as ConnectionType)
  const [pings, setPings] = useState<PingData[]>([])

  useEffect(() => {
    const initPhaser = async () => {
      const Phaser = await import("phaser")
      const { default: GameScene } = await import("../game/GameScene")

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

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await window.fetch(`${baseUrl}/pings`)
        const data = (await response.json()) as PingData[]
        setPings(data)
      } catch (e) {
        console.error(e)
      }
    }, 1000)
    return () => clearInterval(intervalId)
  }, [useState])

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
      <div>
        <h3>Ping data</h3>
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: "1rem 0",
          }}
        >
          <thead>
            <tr>
              <th>Time</th>
              <th>Protocol</th>
              <th>Test duration</th>
              <th>Average</th>
              <th>Median</th>
              <th>99th percentile</th>
              <th>Min</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            {pings.map((result, index) => {
              if (result.pings.length) {
                return (
                  <tr key={index}>
                    <td>{new Date(result.time).toLocaleString()}</td>
                    <td>{result.protocol}</td>
                    <td>{result.duration} s</td>
                    <td>{result.average.toFixed(2)} ms</td>
                    <td>{result.median} ms</td>
                    <td>{result.ninetynine} ms</td>
                    <td>{result.min} ms</td>
                    <td>{result.max} ms</td>
                  </tr>
                )
              } else {
                return (
                  <tr key={index}>
                    <td>{new Date(result.time).toLocaleString()}</td>
                    <td>{result.duration} s</td>
                    {[...Array(5)].map((_, i) => (
                      <td key={i}>-</td>
                    ))}
                  </tr>
                )
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Game
