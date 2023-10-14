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
    this.load.image("ball", "https://i.imgur.com/xtFdsIU.png")

    this.velocity = 600
    this.ballVelocity = 600

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
    this.ball.onRightPaddle = false
    this.ball.body!.setBounce(1)
    this.ball.body!.collideWorldBounds = true
  }

  update() {
    this.checkPlayers()
    this.players.forEach((player, i) => {
      this.movePaddle(i as keyof typeof playerConfig)
    })
  }

  addplayer(playerNo: keyof typeof playerConfig) {
    const config = playerConfig[playerNo]

    const player: any = this.add.sprite(config.spawn.x, config.spawn.y, "wall")
    player.setOrigin(0.5, 0.5)
    player.scaleY = 0.33
    this.physics.world.enable(player)
    player.angle = config.direction === "x" ? 90 : 0
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
}
