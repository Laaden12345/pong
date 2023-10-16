import Phaser, { GameObjects } from "phaser"

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("hello-world")
  }

  preload() {
    this.load.setBaseURL("https://labs.phaser.io")

    this.load.image("wall", "https://i.imgur.com/WQUKFVC.png")
    this.load.image("wall2", "https://i.imgur.com/YD8kW9f.png")
    this.load.image("ball", "https://i.imgur.com/xtFdsIU.png")

    this.velocity = 800
    this.ballVelocity = 600
  }

  create() {
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    this.arrows = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    }

    this.leftPaddle = this.add.sprite(50, 400, "wall")
    this.initializePaddle(this.leftPaddle, "y")

    this.rightPaddle = this.add.sprite(750, 400, "wall")
    this.initializePaddle(this.rightPaddle, "y")

    this.topPaddle = this.add.sprite(400, 50, "wall2")
    //this.topPaddle.setRotation(Math.PI / 2)
    this.initializePaddle(this.topPaddle, "x")

    this.bottomPaddle = this.add.sprite(400, 750, "wall2")
    //this.bottomPaddle.setRotation(Math.PI / 2)
    this.initializePaddle(this.bottomPaddle, "x")

    //Initializing ball
    this.ball = this.add.sprite(400, 300, "ball")
    this.physics.world.enable(this.ball)
    this.ball.body.velocity.set(this.ballVelocity, 0)
    this.ball.onRightPaddle = false
    this.ball.body.setBounce(1)
    this.ball.body.collideWorldBounds = true
  }

  update() {
    this.moveLeftPaddle()
    this.moveRightPaddle()
    this.moveTopPaddle()
    this.moveBottomPaddle()

    this.ballCollision()

    if (this.ball.onLeftPaddle) {
      //Update ball velocity after each collision
      if (this.ballVelocity < 1200) {
        this.ballVelocity += 100
      }
      this.calculateYCollisions(this.leftPaddle, 1)
    }
    if (this.ball.onRightPaddle) {
      //Update ball velocity after each collision
      if (this.ballVelocity < 1200) {
        this.ballVelocity += 100
      }
      this.calculateYCollisions(this.rightPaddle, 2)
    }
    if (this.ball.onTopPaddle) {
      //Update ball velocity after each collision
      if (this.ballVelocity < 1200) {
        this.ballVelocity += 100
      }
      this.calculateXCollisions(this.topPaddle, 1)
    }
    if (this.ball.onBottomPaddle) {
      //Update ball velocity after each collision
      if (this.ballVelocity < 1200) {
        this.ballVelocity += 100
      }
      this.calculateXCollisions(this.bottomPaddle, 2)
    }
  }

  //WIP function to control left paddle
  moveLeftPaddle() {
    if (this.wasd.up.isDown) {
      this.leftPaddle.body.velocity.y = -1 * this.velocity
    } else if (this.wasd.down.isDown) {
      this.leftPaddle.body.velocity.y = this.velocity
    } else {
      this.leftPaddle.body.velocity.y = 0
    }
  }

  //WIP function to control right paddle
  moveRightPaddle() {
    if (this.arrows.up.isDown) {
      this.rightPaddle.body.velocity.y = -1 * this.velocity
    } else if (this.arrows.down.isDown) {
      this.rightPaddle.body.velocity.y = this.velocity
    } else {
      this.rightPaddle.body.velocity.y = 0
    }
  }

  //WIP function to control top paddle
  moveTopPaddle() {
    if (this.wasd.left.isDown) {
      this.topPaddle.body.velocity.x = -1 * this.velocity
    } else if (this.wasd.right.isDown) {
      this.topPaddle.body.velocity.x = this.velocity
    } else {
      this.topPaddle.body.velocity.x = 0
    }
  }

  //WIP function to control bottom paddle
  moveBottomPaddle() {
    if (this.arrows.left.isDown) {
      this.bottomPaddle.body.velocity.x = -1 * this.velocity
    } else if (this.arrows.right.isDown) {
      this.bottomPaddle.body.velocity.x = this.velocity
    } else {
      this.bottomPaddle.body.velocity.x = 0
    }
  }

  //Function to check paddle and ball collisions
  ballCollision() {
    this.ball.onLeftPaddle = false
    this.physics.collide(
      this.leftPaddle,
      this.ball,
      function () {
        this.ball.onLeftPaddle = true
      },
      null,
      this
    )
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
    this.ball.onTopPaddle = false
    this.physics.collide(
      this.topPaddle,
      this.ball,
      function () {
        this.ball.onTopPaddle = true
      },
      null,
      this
    )
    this.ball.onBottomPaddle = false
    this.physics.collide(
      this.bottomPaddle,
      this.ball,
      function () {
        this.ball.onBottomPaddle = true
      },
      null,
      this
    )
  }

  calculateYCollisions(paddle, side) {
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
    if (side == 1) {
      this.ball.body.velocity.y = ballVy
      this.ball.body.velocity.x = ballVx
      this.ball.onLeftPaddle = false
    } else {
      this.ball.body.velocity.y = ballVy
      this.ball.body.velocity.x = -ballVx
      this.ball.onRightPaddle = false
    }
  }

  calculateXCollisions(paddle, side) {
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
    if (side == 1) {
      this.ball.body.velocity.y = ballVy
      this.ball.body.velocity.x = ballVx
      this.ball.onTopPaddle = false
    } else {
      this.ball.body.velocity.y = -ballVy
      this.ball.body.velocity.x = ballVx
      this.ball.onBottomPaddle = false
    }
  }
  //Helper function for itializing paddles
  initializePaddle(paddle, axis) {
    paddle.setOrigin(0.5, 0.5)
    if (axis == "y") {
      paddle.scaleY = 0.33
    } else {
      paddle.scaleX = 0.33
    }
    this.physics.world.enable(paddle)
    paddle.body.collideWorldBounds = true
    paddle.body.immovable = true
  }
}
