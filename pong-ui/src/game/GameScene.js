import Phaser from "phaser"

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("hello-world")
  }

  preload() {
    this.load.setBaseURL("https://labs.phaser.io")

    this.load.image("wall", "https://i.imgur.com/WQUKFVC.png")
    this.load.image("ball", "https://i.imgur.com/xtFdsIU.png")

    this.velocity = 600
    this.ballVelocity = 600
  }

  create() {
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    }

    this.rightPaddle = this.add.sprite(700, 200, "wall")
    this.rightPaddle.setOrigin(0.5, 0.5)
    this.rightPaddle.scaleY = 0.33
    this.physics.world.enable(this.rightPaddle)
    this.rightPaddle.body.collideWorldBounds = true
    this.rightPaddle.body.immovable = true

    this.ball = this.add.sprite(400, 300, "ball")
    this.physics.world.enable(this.ball)
    this.ball.body.velocity.set(this.ballVelocity, 0)
    this.ball.onRightPaddle = false
    this.ball.body.setBounce(1)
    this.ball.body.collideWorldBounds = true
  }

  update() {
    this.movePaddle()
    this.ballCollision()

    if (this.ball.onRightPaddle) {
      this.ball.body.velocity.y =
        Math.random() * 50 + this.rightPaddle.body.velocity.y
      //this.ball.body.velocity.x += (0.1) * this.ball.body.velocity.x;
      this.ball.onRightPaddle = false
    }
  }

  movePaddle() {
    if (this.wasd.up.isDown) {
      console.log("UP")
      console.log(this.ball.onRightPaddle)
      this.rightPaddle.body.velocity.y = -1 * this.velocity
      console.log(this.rightPaddle.y)
    } else if (this.wasd.down.isDown) {
      console.log("Down")
      this.rightPaddle.body.velocity.y = this.velocity
      console.log(this.rightPaddle.y)
    } else {
      this.rightPaddle.body.velocity.y = 0
    }
  }

  ballCollision() {
    this.ball.onRightPaddle = false
    this.physics.collide(
      this.rightPaddle,
      this.ball,
      function () {
        this.ball.onRightPaddle = true
      },
      null,
      this
    )
  }
}
