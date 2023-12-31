import Phaser from "phaser"
import { v4 as uuidv4 } from "uuid"
import playerConfig from "./playerConfig"
import { baseUrl, longPollingUrl } from "../config"

export default class GameScene extends Phaser.Scene {
  private clientId: string
  private WIDTH: number = 800
  private HEIGHT: number = 800
  private wasd: any
  private playerKeys: any
  private ball: any
  private velocity: number
  private ballVelocity: number
  private backendUrl: string
  private backendLongPollingUrl: string
  private players: any[]
  private posts: any[]
  //Phaser text elements which are rendered
  private scores: any[]
  //array of numbers from where the text elements fetch the scores
  private scoreNumbers: number[]
  private controlledPlayer: any
  private socket: WebSocket
  private joining: boolean
  private gameRunning: boolean
  private pings: number[]
  private recordPing: boolean
  private recordPingStart: Date
  private playerNo: number
  private connectionType: string
  private protocolRefreshTimer: Phaser.Time.TimerEvent
  private subscribedToLongPoll = true
  private firstUpdate = true
  private pingRecordingText: any

  constructor() {
    super("hello-world")
  }

  preload() {
    this.load.setBaseURL("https://labs.phaser.io")

    this.load.image("wall", "https://i.imgur.com/WQUKFVC.png")
    this.load.image("wall2", "https://i.imgur.com/YD8kW9f.png")
    this.load.image("ball", "https://i.imgur.com/i0SRkIj.png")
    this.load.image("post", "https://i.imgur.com/9LJC7V8.png")

    this.clientId = uuidv4()

    this.velocity = 800
    this.ballVelocity = 400

    this.backendUrl = baseUrl
    this.backendLongPollingUrl = longPollingUrl
    this.players = []
    this.posts = []
    this.scores = []
    this.scoreNumbers = [10, 10, 10, 10]
    this.controlledPlayer = null
    this.socket = new WebSocket(
      `ws://${import.meta.env.PUBLIC_BACKEND_URL}:${
        import.meta.env.PUBLIC_WEBSOCKET_PORT
      }`
    )
    this.joining = false
    this.gameRunning = true
    this.pings = []
    this.recordPing = false
    this.recordPingStart = new Date()
    this.connectionType = "WEBSOCKET"
  }

  create() {
    this.wasd = {
      up: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    this.playerKeys = {
      space: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      enter: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      r: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R),
    }

    this.ball = this.add.sprite(350, 350, "ball")
    this.physics.world.enable(this.ball)
    this.ball.body!.setBounce(1)
    this.ball.body!.collideWorldBounds = false
    this.ball.onPlayerOnePaddle = false
    this.ball.onPlayerTwoPaddle = false
    this.ball.onPlayerThreePaddle = false
    this.ball.onPlayerFourPaddle = false

    this.posts[0] = this.add.sprite(0, 0, "post")
    this.posts[1] = this.add.sprite(this.WIDTH, 0, "post")
    this.posts[2] = this.add.sprite(0, this.HEIGHT, "post")
    this.posts[3] = this.add.sprite(this.WIDTH, this.HEIGHT, "post")

    this.players[0] = this.getWall(0)
    this.players[1] = this.getWall(1)
    this.players[2] = this.getWall(2)
    this.players[3] = this.getWall(3)

    this.pingRecordingText = null

    for (let i = 0; i < this.posts.length; i++) {
      this.physics.world.enable(this.posts[i])
      this.posts[i].setScale(1.6)
      this.posts[i].body!.setBounce(1)
      this.posts[i].body!.immovable = true
      this.physics.add.collider(this.ball, this.posts[i])

      this.physics.world.enable(this.players[i])
      this.players[i].body!.collideWorldBounds = true
      this.players[i].body!.immovable = true
      this.physics.add.collider(this.ball, this.players[i])
      this.players[i].name = "solidwall"
    }

    this.playerKeys.r.on("down", () => {
      if (this.recordPing) {
        console.log("sending pings")
        const body = {
          pings: this.pings,
          protocol: this.connectionType,
          duration:
            (new Date().getTime() - this.recordPingStart.getTime()) / 1000,
        }
        console.log(body)

        fetch(`${this.backendUrl}/pings`, {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
        this.pings = []
        this.recordPing = false
      } else {
        console.log("starting ping recording")
        this.recordPing = true
        this.recordPingStart = new Date()
      }
    })

    this.protocolRefreshTimer = this.time.addEvent({
      delay: 500,
      callback: () => {
        this.getConnectionType()
      },
      callbackScope: this,
      loop: true,
    })
  }

  update() {
    if (this.connectionType === "LONG_POLLING") {
      if (
        this.playerKeys.space.isDown &&
        !this.controlledPlayer &&
        !this.joining
      ) {
        this.joinLongPolling()
        this.joining = true
      }
      if (this.playerKeys.enter.isDown) {
        if (!this.gameRunning) {
          this.startGameLongPolling()
        }
      }
    }

    if (this.connectionType === "WEBSOCKET") {
      if (
        this.playerKeys.space.isDown &&
        !this.controlledPlayer &&
        !this.joining
      ) {
        this.join()
        this.joining = true
      }
      if (this.playerKeys.enter.isDown) {
        if (!this.gameRunning) {
          this.socket.send(
            JSON.stringify({
              event: "startGame",
            })
          )
        }
      }

      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            event: "getGameState",
            payload: {
              playerId: this.clientId,
              pingDate: new Date().getTime(),
            },
          })
        )
      }
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        switch (data.event) {
          case "playerJoined": {
            if (data.payload.id === this.clientId) {
              this.addPlayer(data.payload, true)
            }
            break
          }
          case "gameStarted": {
            console.log("starting game")
            this.gameRunning = true
            break
          }
          case "gameOver": {
            console.log("game over")
            this.gameRunning = false
            break
          }
          case "gameState": {
            const ball = data.payload.ball
            this.scoreNumbers = data.payload.scores
            for (let i = 0; i < 4; i++) {
              if (
                this.scoreNumbers[i] <= 0 &&
                this.players[i].name !== "solidwall"
              ) {
                this.replacePlayerWithWall(i as keyof typeof playerConfig)
              }
            }
            if (!this.gameRunning) {
              this.ball.body!.reset(ball.location.x, ball.location.y)
            }
            if (
              this.ball.body.velocity.x === 0 &&
              this.ball.body.velocity.y === 0
            ) {
              this.ballVelocity = 400
              this.ball.body.velocity.x = ball.velocity.x
              this.ball.body.velocity.y = ball.velocity.y
            } else {
              this.updateBall()
            }
            this.updatePlayers(data.payload.players)
            if (this.gameRunning && !data.payload.gameRunning) {
              this.gameRunning = false
            }
            break
          }
        }
      }
    }

    if (this.controlledPlayer !== null) {
      if (this.scoreNumbers[this.playerNo] > 0) {
        this.movePaddle()
      }
      this.ballCollision()

      //Dont apply these to the walls which replace lost players
      if (this.ball.onPlayerOnePaddle) {
        this.increaseBallSpeed()
        this.calculateXCollisions(this.players[0], 1)
      }
      if (this.ball.onPlayerTwoPaddle) {
        this.increaseBallSpeed()
        this.calculateXCollisions(this.players[1], -1)
      }
      if (this.ball.onPlayerThreePaddle) {
        this.increaseBallSpeed()
        this.calculateYCollisions(this.players[2], 1)
      }
      if (this.ball.onPlayerFourPaddle) {
        this.increaseBallSpeed()
        this.calculateYCollisions(this.players[3], -1)
      }
    }

    this.updateScores()
    this.updateScorePosition()

    if (this.recordPing && this.pingRecordingText === null) {
      this.pingRecordingText = this.add.text(
        this.WIDTH / 2,
        this.HEIGHT / 2,
        "Recording pings",
        {
          font: "16px Arial",
          color: "#ffffff",
        }
      )
      this.pingRecordingText.setPosition(
        this.WIDTH / 2 - this.pingRecordingText.width / 2,
        this.HEIGHT / 2 - 30
      )
      console.log(this.pingRecordingText)
    } else if (!this.recordPing && this.pingRecordingText !== null) {
      this.pingRecordingText.destroy()
      this.pingRecordingText = null
    }

    if (this.subscribedToLongPoll && this.connectionType === "LONG_POLLING") {
      this.pollServer()
    }
  }

  join() {
    this.socket.send(
      JSON.stringify({ event: "join", payload: { clientId: this.clientId } })
    )
  }

  addPlayer(playerInfo: PlayerInfo, isLocalPlayer: boolean) {
    console.log("adding player ", playerInfo.id)
    console.log(playerInfo)

    const config =
      playerConfig[playerInfo.playerNo as keyof typeof playerConfig]
    this.scoreNumbers[playerInfo.playerNo] = config.hp
    const player: any =
      config.direction === "y"
        ? this.add.sprite(config.spawn.x, config.spawn.y, "wall")
        : this.add.sprite(config.spawn.x, config.spawn.y, "wall2")
    player.setOrigin(0.5, 0.5)
    const hitpoints: any = this.add.text(
      config.spawn.x - 10,
      config.spawn.y - 10,
      this.scoreNumbers[playerInfo.playerNo].toString(),
      { font: "16px Arial", color: "#000000", align: "center" }
    )

    config.direction === "y" ? (player.scaleY = 0.33) : (player.scaleX = 0.33)
    this.physics.world.enable(player)
    player.body!.collideWorldBounds = true
    player.body!.immovable = true
    player.id = playerInfo.id
    if (isLocalPlayer) {
      this.controlledPlayer = player
      this.playerNo = playerInfo.playerNo
      console.log("controlled player set")
    }
    this.players[playerInfo.playerNo].destroy(true)
    this.players[playerInfo.playerNo] = player
    this.scores[playerInfo.playerNo] = hitpoints
    this.joining = false
  }

  async getConnectionType() {
    const response = await fetch(`${this.backendUrl}/connection-type`)
    const json = await response.json()
    this.connectionType = json.connectionType
  }

  updatePlayers(payload: any) {
    payload.forEach((player: any) => {
      if (player.id !== this.clientId) {
        if (!this.players.some((p) => p.id === player.id)) {
          this.addPlayer(player, false)
        } else if (!player.lostGame) {
          const index = this.players.findIndex((p) => p.id === player.id)
          this.players[index].setPosition(player.location.x, player.location.y)
        }
      } else if (this.recordPing) {
        this.pings.push(new Date().getTime() - player.lastPingUpdate)
      }
    })

    this.players.forEach((player, i) => {
      if (
        player.id !== undefined &&
        !payload.some((p: any) => p.id === player.id)
      ) {
        console.log(i)
        player.destroy(true)
        if (
          this.controlledPlayer !== null &&
          this.controlledPlayer.id === player.id
        ) {
          this.controlledPlayer = null
        }
        this.players[i] = this.getWall(i as keyof typeof playerConfig)
        this.scoreNumbers[i] = -999
        this.physics.world.enable(this.players[i])
        this.players[i].body!.collideWorldBounds = true
        this.players[i].body!.immovable = true
        this.physics.add.collider(this.ball, this.players[i])
        this.players[i].name = "solidwall"
      }
    })
  }

  updateBall = async () => {
    const body = {
      id: this.clientId,
      location: {
        x: this.ball.body.position.x,
        y: this.ball.body.position.y,
      },
      velocity: {
        x: this.ball.body.velocity.x,
        y: this.ball.body.velocity.y,
      },
    }

    if (this.connectionType === "WEBSOCKET") {
      this.socket.send(
        JSON.stringify({
          event: "updateBall",
          payload: body,
        })
      )
    } else if (this.connectionType === "LONG_POLLING") {
      const res = await fetch(`${this.backendLongPollingUrl}/updateBall`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()
    }
  }

  movePaddle = async () => {
    const player = this.controlledPlayer
    const config = playerConfig[this.playerNo as keyof typeof playerConfig]
    if (config.direction === "x") {
      if (this.wasd.left.isDown) {
        player.body.velocity.x = -1 * this.velocity
      } else if (this.wasd.right.isDown) {
        player.body.velocity.x = this.velocity
      } else {
        player.body.velocity.x = 0
      }
    } else {
      if (this.wasd.up.isDown) {
        player.body.velocity.y = -1 * this.velocity
      } else if (this.wasd.down.isDown) {
        player.body.velocity.y = this.velocity
      } else {
        player.body.velocity.y = 0
      }
    }

    const body = {
      id: this.clientId,
      playerNo: this.playerNo,
      lastPingUpdate: new Date().getTime(),
      location: {
        x: player.x,
        y: player.y,
      },
    }

    if (this.connectionType === "WEBSOCKET") {
      this.socket.send(
        JSON.stringify({
          event: "updatePlayer",
          payload: body,
        })
      )
    } else if (this.connectionType === "LONG_POLLING") {
      if (
        this.firstUpdate ||
        player.body.velocity.x !== 0 ||
        player.body.velocity.y !== 0
      ) {
        this.firstUpdate = false
        await fetch(`${this.backendLongPollingUrl}/updatePlayer`, {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
      }
    }
  }

  updateScorePosition() {
    for (let i = 0; i < this.players.length; i++) {
      if (this.scores[i] !== undefined) {
        const player = this.players[i]
        const score = this.scores[i]

        score.setPosition(player.x - 10, player.y - 10)
      }
    }
  }

  //Function to check paddle and ball collisions
  ballCollision() {
    this.players.forEach((player, i) => {
      i as keyof typeof playerConfig
      if (i === 0 && this.scoreNumbers[0] > 0) {
        this.ball.onPlayerOnePaddle = false
        this.physics.collide(this.players[0], this.ball, () => {
          this.ball.onPlayerOnePaddle = true
        })
      }
      if (i === 1 && this.scoreNumbers[1] > 0) {
        this.ball.onPlayerTwoPaddle = false
        this.physics.collide(this.players[1], this.ball, () => {
          this.ball.onPlayerTwoPaddle = true
        })
      }
      if (i === 2 && this.scoreNumbers[2] > 0) {
        this.ball.onPlayerThreePaddle = false
        this.physics.collide(this.players[2], this.ball, () => {
          this.ball.onPlayerThreePaddle = true
        })
      }
      if (i === 3 && this.scoreNumbers[3] > 0) {
        this.ball.onPlayerFourPaddle = false
        this.physics.collide(this.players[3], this.ball, () => {
          this.ball.onPlayerFourPaddle = true
        })
      }
    })
  }

  calculateYCollisions(paddle: any, direction: any) {
    //Calculate the relative collision point of the ball and paddle
    const relativeIntersectY = paddle.y - this.ball.y
    //Normalize the relativeIntersectY value
    const normalizedRelativeIntersectionY =
      relativeIntersectY / (paddle.displayHeight / 2)
    //Calculate the bounce angle (maximum 45 degrees)
    const bounceAngle = (normalizedRelativeIntersectionY * Math.PI) / 4
    //Calculate the x-velocity of the ball
    const ballVx = this.ballVelocity * Math.cos(bounceAngle)
    //Calculate the y-velocity of the ball
    const ballVy = this.ballVelocity * -Math.sin(bounceAngle)
    //Update the x and y ball velocities

    this.ball.body.velocity.y = ballVy
    this.ball.body.velocity.x = direction * ballVx

    direction === 1
      ? (this.ball.onPlayerThreePaddle = false)
      : (this.ball.onPlayerFourPaddle = false)
  }

  calculateXCollisions(paddle: any, direction: any) {
    //Calculate the relative collision point of the ball and paddle
    const relativeIntersectX = paddle.x - this.ball.x
    //Normalize the relativeIntersectX value
    const normalizedRelativeIntersectionX =
      relativeIntersectX / (paddle.displayWidth / 2)
    //Calculate the bounce angle (maximum 45 degrees)
    const bounceAngle = (normalizedRelativeIntersectionX * Math.PI) / 4
    //Calculate the y-velocity of the ball
    const ballVy = this.ballVelocity * Math.cos(bounceAngle)
    //Calculate the x-velocity of the ball
    const ballVx = this.ballVelocity * -Math.sin(bounceAngle)
    //Update the x and y ball velocities
    this.ball.body.velocity.y = direction * ballVy
    this.ball.body.velocity.x = ballVx

    direction === 1
      ? (this.ball.onPlayerOnePaddle = false)
      : (this.ball.onPlayerTwoPaddle = false)
  }
  //Update ball velocity after each collision
  increaseBallSpeed() {
    if (this.ballVelocity < 1200) {
      this.ballVelocity += 100
    }
  }

  updateScores() {
    for (let i = 0; i < this.scores.length; i++) {
      if (this.scoreNumbers[i] !== undefined) {
        this.scores[i].setText(this.scoreNumbers[i].toString())
      }
    }
  }

  checkForLostPlayers() {
    for (let i = 0; i < this.scores.length; i++) {
      if (
        this.scoreNumbers[i] <= 0 &&
        this.scoreNumbers[i] > -100 &&
        this.gameRunning
      ) {
        this.replacePlayerWithWall(i as keyof typeof playerConfig)
        this.scoreNumbers[i] = -999
      }
    }
  }

  replacePlayerWithWall = async (playerNo: keyof typeof playerConfig) => {
    const solidWall: any = this.getWall(playerNo)
    solidWall.id = this.players[playerNo].id

    this.physics.world.enable(solidWall)
    solidWall.body!.collideWorldBounds = true
    solidWall.body!.immovable = true
    solidWall.name = "solidWall"

    this.players[playerNo].destroy(true)
    this.players[playerNo] = solidWall
    this.physics.add.collider(this.ball, this.players[playerNo])

    const body = {
      id: this.clientId,
      playerNo: this.playerNo,
      lostGame: true,
      location: {
        x: solidWall.body.position.x,
        y: solidWall.body.position.y,
      },
    }

    if (this.connectionType === "WEBSOCKET") {
      this.socket.send(
        JSON.stringify({
          event: "updatePlayer",
          payload: body,
        })
      )
    } else if (this.connectionType === "LONG_POLLING") {
      const res = await fetch(`${this.backendLongPollingUrl}/updatePlayer`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()
      console.log(data)
    }
  }

  getWall(playerNo: keyof typeof playerConfig) {
    if (playerNo === 0) {
      const wall = this.add.sprite(0, 0, "wall2")
      wall.displayWidth = this.WIDTH
      return wall
    } else if (playerNo === 1) {
      const wall = this.add.sprite(0, this.HEIGHT, "wall2")
      wall.displayWidth = this.WIDTH
      return wall
    } else if (playerNo === 2) {
      const wall = this.add.sprite(0, 0, "wall")
      wall.displayHeight = this.HEIGHT
      return wall
    } else {
      const wall = this.add.sprite(this.WIDTH, 0, "wall")
      wall.displayHeight = this.HEIGHT
      return wall
    }
  }

  //LONG POLLING FUNCTIONS BELOW
  joinLongPolling = async () => {
    const body = {
      clientId: this.clientId,
    }

    const res = await fetch(`${this.backendLongPollingUrl}/join`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await res.json()

    this.addPlayer(data.payload, true)
  }

  startGameLongPolling = async () => {
    const res = await fetch(`${this.backendLongPollingUrl}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await res.json()

    this.gameRunning = true
  }

  updateGameLongPolling = async () => {
    const res = await fetch(`${this.backendLongPollingUrl}/updateGameState`, {
      body: JSON.stringify({
        clientId: this.clientId,
        pingDate: new Date().getTime(),
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await res.json()
  }

  pollServer = async () => {
    this.subscribedToLongPoll = false
    let response = await fetch(`${this.backendLongPollingUrl}/poll`)

    if (response.status != 200) {
      console.log("error")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await this.pollServer()
    } else {
      let data = await response.json()

      const ball = data.ball
      this.scoreNumbers = data.scores

      for (let i = 0; i < 4; i++) {
        if (this.scoreNumbers[i] <= 0 && this.players[i].name !== "solidWall") {
          this.replacePlayerWithWall(i as keyof typeof playerConfig)
        }
      }

      if (!this.gameRunning) {
        this.ball.body!.reset(ball.location.x, ball.location.y)
      }
      if (this.ball.body.velocity.x === 0 && this.ball.body.velocity.y === 0) {
        this.ballVelocity = 400
        this.ball.body.velocity.x = ball.velocity.x
        this.ball.body.velocity.y = ball.velocity.y
      } else {
        this.updateBall()
      }
      this.updatePlayers(data.players)
      if (this.gameRunning && !data.gameRunning) {
        this.gameRunning = false
      }

      await this.updateGameLongPolling()
      await this.pollServer()
    }
  }
}
