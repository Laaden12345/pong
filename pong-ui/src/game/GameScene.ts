import Phaser from "phaser"
import playerConfig from "./playerConfig"

export default class GameScene extends Phaser.Scene {
  private wasd: any
  private playerKeys: any
  private ball: any
  private velocity: number
  private ballVelocity: number
  private backendUrl: string
  private players: any[]

  constructor() {
    super("hello-world")
  }

  preload() {
    this.load.setBaseURL("https://labs.phaser.io")

    this.load.image("wall", "https://i.imgur.com/WQUKFVC.png")
    this.load.image("wall2", "https://i.imgur.com/YD8kW9f.png")
    this.load.image("ball", "https://i.imgur.com/xtFdsIU.png")

    this.velocity = 800
    this.ballVelocity = 400

    this.backendUrl = `http://localhost:${import.meta.env.PUBLIC_BACKEND_PORT}`
    this.players = []
  }

  create() {
    this.wasd = {
      up: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    this.playerKeys = {
      0: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      1: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      2: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      3: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    }

    this.ball = this.add.sprite(400, 300, "ball")
    this.physics.world.enable(this.ball)
    this.ball.body!.velocity.set(this.ballVelocity, 0)
    this.ball.body!.setBounce(1)
    this.ball.body!.collideWorldBounds = true
    this.ball.onPlayerOnePaddle = false
    this.ball.onPlayerTwoPaddle = false
    this.ball.onPlayerThreePaddle = false
    this.ball.onPlayerFourPaddle = false
  }

  update() {
    this.checkPlayers()
    this.players.forEach((player, i) => {
      this.movePaddle(i as keyof typeof playerConfig)
    })
    this.ballCollision()

    if (this.ball.onPlayerOnePaddle) {
      this.increaseBallSpeed()
      this.calculateXCollisions(this.players[0], 1)
    }
    if (this.ball.onPlayerTwoPaddle) {
      this.increaseBallSpeed()
      this.calculateYCollisions(this.players[1], 1)
    }
    if (this.ball.onPlayerThreePaddle) {
      this.increaseBallSpeed()
      this.calculateXCollisions(this.players[2], -1)
    }
    if (this.ball.onPlayerFourPaddle) {
      this.increaseBallSpeed()
      this.calculateYCollisions(this.players[3], -1)
    }
  }

  addplayer(playerNo: keyof typeof playerConfig) {
    const config = playerConfig[playerNo]
    const player: any =
      config.direction === "y"
        ? this.add.sprite(config.spawn.x, config.spawn.y, "wall")
        : this.add.sprite(config.spawn.x, config.spawn.y, "wall2")
    player.setOrigin(0.5, 0.5)
    config.direction === "y" ? (player.scaleY = 0.33) : (player.scaleX = 0.33)
    this.physics.world.enable(player)
    player.body!.collideWorldBounds = true
    player.body!.immovable = true

    this.players.push(player)
  }

  async getConnectionType() {
    const response = await fetch(`${this.backendUrl}/connection-type`)
    const connectionType = await response.json()
    console.log(connectionType)
  }

  checkPlayers() {
    Object.keys(this.playerKeys).forEach((key: any) => {
      if (this.playerKeys[key].isDown && !this.players[key]) {
        this.addplayer(key as keyof typeof playerConfig)
      }
    })
  }

  movePaddle(playerNo: keyof typeof playerConfig) {
    if (!this.players[playerNo]) {
      return
    }
    const config = playerConfig[playerNo]
    const player = this.players[playerNo]
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
  }

  //Function to check paddle and ball collisions
  ballCollision() {
    this.players.forEach((player, i) => {
      i as keyof typeof playerConfig
      if (i === 0) {
        this.ball.onPlayerOnePaddle = false
        this.physics.collide(this.players[0], this.ball, () => {
          this.ball.onPlayerOnePaddle = true
        })
      }
      if (i === 1) {
        this.ball.onPlayerTwoPaddle = false
        this.physics.collide(this.players[1], this.ball, () => {
          this.ball.onPlayerTwoPaddle = true
        })
      }
      if (i === 2) {
        this.ball.onPlayerThreePaddle = false
        this.physics.collide(this.players[2], this.ball, () => {
          this.ball.onPlayerThreePaddle = true
        })
      }
      if (i === 3) {
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
      ? (this.ball.onPlayerTwoPaddle = false)
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
      : (this.ball.onPlayerThreePaddle = false)
  }
  //Update ball velocity after each collision
  increaseBallSpeed() {
    if (this.ballVelocity < 1200) {
      this.ballVelocity += 100
    }
  }
}
